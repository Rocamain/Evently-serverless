const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocument,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
} = require('@aws-sdk/lib-dynamodb')
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')
const https = require('https')

module.exports = class DynamoDbAdapter {
  constructor() {
    this.documentDbClient = (client) => {
      return DynamoDBDocument.from(new DynamoDB(client), {
        marshallOptions: {
          removeUndefinedValues: true,
        },
      })
    }
    this.getClient = () => {
      console.log('DynamoDB creating connection')

      const IS_PRODUCTION_CONFIG = process.env.STAGE === 'prod'

      const config = {
        endpoint: process.env.MOCK_DYNAMODB_ENDPOINT
          ? process.env.MOCK_DYNAMODB_ENDPOINT
          : 'http://127.0.0.1:8000',
        sslEnabled: false,
        region: 'eu-west-2',
        maxAttempts: 2,

        requestHandler: new NodeHttpHandler({
          socketTimeout: 1000,
          connectionTimeout: 1000,
        }),
      }

      // Endpoint is empty when running in AWS
      if (IS_PRODUCTION_CONFIG) {
        return this.documentDbClient({
          region: 'eu-west-2',
          requestHandler: new NodeHttpHandler({
            httpsAgent: new https.Agent({
              maxSockets: 30,
              keepAlive: true,
            }),
          }),
        })
      }

      return this.documentDbClient(config)
    }
    this.documentClient = this.getClient()
  }

  async createItem(tableName, entity) {
    console.log(`Saving new item into DynamoDB table ${tableName}`)

    const params = {
      Item: entity,
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
      ConditionExpression: 'attribute_not_exists(PK)',
    }

    await this.create(params)
    console.log('Item saved successfully')
    return entity
  }

  async create(params) {
    const command = new PutCommand({
      ...params,
    })

    const response = await this.documentClient.send(command)

    return response
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
    console.log('Item retrieved successfully')
    return response.Item
  }

  async get(params) {
    const command = new GetCommand({
      ...params,
    })
    return this.documentClient.send(command)
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
        const batchItems = {
          [tableName]: itemKeys.slice(0, 25).map((key) => ({
            DeleteRequest: { Key: key },
          })),
        }
        const batchWriteCommand = {
          RequestItems: batchItems,
          ReturnConsumedCapacity: 'TOTAL',
        }

        await this.batchDelete(batchWriteCommand)
        console.log('Batch Items deleted successfully')

        return recursiveBatchDelete(itemKeys, count - 25, batchSize)
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
    { indexName, field, value, limit, pastBookings = false },
  ) {
    console.log(
      `Getting items from DynamoDB table: ${tableName} by with ${field}=${value} `,
    )

    const FIVE_MINUTES = 300000
    const expression = pastBookings
      ? '#field = :value'
      : '#field = :value AND #field2 >= :value2'

    const expressionAttributeNames = pastBookings
      ? {
          '#field': field,
        }
      : {
          '#field': field,
          '#field2': 'eventDateAndTime',
        }

    const expressionAttributeValues = pastBookings
      ? {
          ':value': value,
        }
      : {
          ':value': value,
          ':value2': new Date(
            new Date().getTime() + FIVE_MINUTES,
          ).toISOString(),
        }

    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: true,
      Limit: limit,
    }

    const response = await this.query(params)
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
