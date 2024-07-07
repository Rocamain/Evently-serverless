const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocument,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  BatchWriteCommand,
} = require('@aws-sdk/lib-dynamodb')
const { NodeHttpHandler } = require('@smithy/node-http-handler')
const https = require('https')
const createFilterExpression = require('./utils/createFilterExpression.js')
const getUniqueCombinations = require('./utils/getUniqueCombinations')

module.exports = class DynamoDbAdapter {
  constructor() {
    // CONNECTION METHODS

    this.documentDbClient = (client) => {
      return DynamoDBDocument.from(new DynamoDB(client), {
        marshallOptions: {
          removeUndefinedValues: true,
        },
      })
    }

    this.getClient = () => {
      console.log('DynamoDB creating connection')

      const config = this.getConfig()

      return this.documentDbClient(config)
    }

    this.getConfig = () => {
      const IS_OFFLINE = process.env.STAGE === 'local'

      if (IS_OFFLINE) {
        // MOCK_DYNAMODB_ENDPOINT is coming from Jest dynalite to make the integration test. Otherwise is for local development
        const localEndpoint = process.env.MOCK_DYNAMODB_ENDPOINT
          ? process.env.MOCK_DYNAMODB_ENDPOINT
          : 'http://127.0.0.1:8000'
        const localRegion = process.env.MOCK_DYNAMODB_ENDPOINT
          ? 'local'
          : process.env.REGION
        console.log({ localEndpoint })
        const localConfig = {
          endpoint: localEndpoint,
          sslEnabled: false,
          region: localRegion,
        }
        return localConfig
      }
      const productionConfig = {
        region: process.env.REGION,
        requestHandler: new NodeHttpHandler({
          httpsAgent: new https.Agent({
            maxSockets: 30,
            keepAlive: true,
          }),
        }),
      }

      return productionConfig
    }

    //  CONNECTION

    this.documentClient = this.getClient()
  }

  // CRUD METHODS

  async createItem(tableName, entity) {
    console.log(`Saving new item into DynamoDB table ${tableName}`)

    const params = {
      Item: entity,
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
      ConditionExpression: 'attribute_not_exists(PK)',
    }

    return await this.create(params)
  }

  async create(params) {
    const command = new PutCommand({
      ...params,
    })

    const response = await this.documentClient.send(command)
    console.log('Item saved successfully')
    return response
  }

  async updateItem(tableName, entity, fieldsToChange) {
    console.log(`Saving new item into DynamoDB table ${tableName}`)
    const updateExpression = []
    const expressionAttributeValues = {}

    for (const key in fieldsToChange) {
      updateExpression.push(`${key} = :${key}`)
      expressionAttributeValues[`:${key}`] = fieldsToChange[key]
    }

    const params = {
      TableName: tableName,
      Key: {
        PK: entity.id,
        userId: entity.userId,
      },
      UpdateExpression: 'SET ' + updateExpression.join(', '),
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }

    const response = await this.update(params)
    console.log('Item updated successfully')
    return response
  }

  async update(params) {
    const command = new UpdateCommand({
      ...params,
    })

    const { Attributes } = await this.documentClient.send(command)

    return Attributes
  }

  async getItem(tableName, { id, userId }) {
    console.log(`Getting item id=${id} from DynamoDB table: ${tableName}`)
    const params = {
      TableName: tableName,
      Key: {
        PK: id,
        userId,
      },

      ConsistentRead: true,
    }

    const response = await this.get(params)

    return response
  }

  async get(params) {
    const command = new GetCommand({
      ...params,
    })
    const { Item } = await this.documentClient.send(command)

    Item
      ? console.log('Item retrieved successfully')
      : console.log('Item does not exist in the DB')

    return Item
  }

  async deleteItem(tableName, { id, userId }) {
    console.log(`Getting item id=${id} from DynamoDB table: ${tableName}`)

    const params = {
      TableName: tableName,
      Key: { PK: id, userId },
      ReturnConsumedCapacity: 'TOTAL',
    }

    const response = await this.delete(params)
    console.log('Item deleted successfully')
    return response
  }

  async deleteItems(tableName, { id, userId, items, count }) {
    console.log(
      `Deleting items with id=${id} from DynamoDB table: ${tableName}`,
    )
    if (count === 1) {
      const response = await this.deleteItem(tableName, { id, userId })
      return response
    } else {
      const itemKeys = items.map((item) => ({
        PK: id,
        userId: item.userId,
      }))

      // Delete the items in batches of 25 (the maximum allowed by DynamoDB)

      const batchSize = 25

      //  recursive function to delete on batches of 25.

      const recursiveBatchDelete = async (itemKeys, count, batchSize) => {
        if (count <= 0) {
          return
        }

        const currentBatchSize = Math.min(count, batchSize) // Adjust batch size based on remaining items
        const batchItems = {
          [tableName]: itemKeys.slice(0, currentBatchSize).map((key) => ({
            DeleteRequest: { Key: key },
          })),
        }

        const batchWriteCommand = {
          RequestItems: batchItems,
          ReturnConsumedCapacity: 'TOTAL',
        }

        await this.batchDelete(batchWriteCommand)

        console.log('Batch Items deleted successfully')

        return recursiveBatchDelete(
          itemKeys.slice(currentBatchSize),
          count - currentBatchSize,
          batchSize,
        )
      }

      return await recursiveBatchDelete(itemKeys, count, batchSize)
    }
  }

  async delete(params) {
    const command = new DeleteCommand({
      ...params,
    })

    const response = await this.documentClient.send(command)

    return response
  }

  async batchDelete(params) {
    const command = new BatchWriteCommand(params)

    const response = await this.documentClient.send(command)

    return response
  }

  async queryByField(tableName, { field, value }) {
    console.log(
      `Getting items from DynamoDB table: ${tableName} by with ${field}=${value} `,
    )
    const params = {
      TableName: tableName,
      KeyConditionExpression: '#field = :value',
      ExpressionAttributeNames: {
        '#field': field,
      },
      ExpressionAttributeValues: {
        ':value': value,
      },
    }
    const response = await this.query(params)
    console.log('Items retrieved successfully')
    return response
  }

  async queryIndexByField(
    tableName,
    { indexName, searchWords, value, limit, exclusiveStartKey, ...params },
  ) {
    console.log(
      `Getting items from DynamoDB table: ${tableName} by with ${indexName}=${value} `,
    )
    const searchWordsCombinations = searchWords
      ? getUniqueCombinations(searchWords)
      : null

    const {
      expression,
      expressionAttributeNames,
      expressionAttributeValues,
      filterExpression,
    } = createFilterExpression({
      value,
      searchWords: searchWordsCombinations,
      ...params,
    })

    const queryParams = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: true,
      Limit: limit || 10,
    }

    if (exclusiveStartKey) {
      queryParams.ExclusiveStartKey = exclusiveStartKey
    }

    if (filterExpression) {
      queryParams.FilterExpression = filterExpression
    }

    const response = await this.query(queryParams)
    console.log('Items retrieved successfully')
    return response
  }

  async query(params) {
    const command = new QueryCommand({
      ...params,
    })

    const response = await this.documentClient.send(command)

    return response
  }
}
