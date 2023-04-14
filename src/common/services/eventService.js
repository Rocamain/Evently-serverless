const DynamoDbAdapter = require('../dynamoDbAdapter')
const EventEntity = require('../entities/eventEntity')

module.exports = class EntityService {
  constructor(dynamoDbAdapter) {
    this.dynamoDbAdapter = dynamoDbAdapter || new DynamoDbAdapter()
    this.tableName = process.env.tableName
  }

  async create(requestBody) {
    console.log(
      `Creating entity item in repository on table ${process.env.tableName}`,
    )

    const entityService = new EventEntity(requestBody)
    await this.dynamoDbAdapter.createItem(this.tableName, entityService)

    return entityService
  }

  async get(id) {
    const response = await this.dynamoDbAdapter.getItem(this.tableName, id)
    console.log(
      `Retrieving EventEntity item id ${id} from repository entityService`,
    )
    const item = response.Item

    if (item) {
      console.log('Item found')
      return JSON.stringify({ data: EventEntity.fromItem(item) })
    }
    console.log('Item not found')
    return JSON.stringify({ data: {} })
  }
}
