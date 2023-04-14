const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocument,
  GetCommand,
  PutCommand,
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
    console.log(
      `Saving new item id="${entity.id}" into DynamoDB table ${tableName}`,
    )
    const params = {
      Item: entity.toItem(),
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
      Expected: {
        pk: {
          Exists: false,
        },
      },
    }

    try {
      await this.create(params)
      console.log('Item saved successfully')
      return entity
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  async create(params) {
    const command = new PutCommand({
      ...params,
    })

    return this.documentClient.send(command)
  }

  async getItem(tableName, id) {
    console.log(`get item id=${id} from DynamoDB table: ${tableName}`)
    const params = {
      TableName: tableName,
      Key: { PK: id },
      ConsistentRead: true,
    }
    if (!id || id.trim() === '') {
      const error = new Error()
      error.msg = 'Id required'
      error.statusCode = 400
      console.log('Error', error)
      throw error
    }
    try {
      const entity = await this.get(params)
      console.log('Item retrieved successfully')
      return entity
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  async get(params) {
    const command = new GetCommand({
      ...params,
    })
    return this.documentClient.send(command)
  }
}
