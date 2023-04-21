const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocument,
  GetCommand,
  PutCommand,
  QueryCommand,
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
          : 'http://localhost:8000',
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
    console.log('Item saved successfully', entity)
    return entity
  }

  async create(params) {
    const command = new PutCommand({
      ...params,
    })

    return this.documentClient.send(command)
  }

  async getItem(tableName, id) {
    console.log(`Getting item id=${id} from DynamoDB table: ${tableName}`)
    const params = {
      TableName: tableName,
      Key: { PK: id },
      // ConsistentRead: true,
    }
    if (!id || id.trim() === '') {
      const error = new Error()
      error.msg = 'Id required'
      error.statusCode = 400

      throw JSON.parse(error)
    }

    const entity = await this.get(params)
    console.log('Item retrieved successfully')
    return entity
  }

  async get(params) {
    const command = new GetCommand({
      ...params,
    })
    return this.documentClient.send(command)
  }

  async queryIndexByField(
    tableName,
    { indexName, field, value, limit, pastBookings = false },
  ) {
    console.log(
      `Getting items from DynamoDB table: ${tableName} by with ${field}=${value} `,
    )

    const ONE_HOUR = 1
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
          ':value2': new Date(new Date().getTime() + ONE_HOUR).toISOString(),
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
    const command = new QueryCommand({
      ...params,
    })
    return this.documentClient.send(command)
  }
}
