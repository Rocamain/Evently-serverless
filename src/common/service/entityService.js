const DynamoDbAdapter = require('../adapter/dynamoDbAdapter')
const Entity = require('../entity/entity')

module.exports = class EntityService {
  constructor(dynamoDbAdapter) {
    this.dynamoDbAdapter = dynamoDbAdapter || new DynamoDbAdapter()
    this.tableName = process.env.tableName
    this.indexName = process.env.indexName
    this.field = process.env.field
  }

  async create(requestBody) {
    console.log(
      `Creating entity item in repository on table ${process.env.tableName}`,
    )

    if (requestBody.type === 'booking') {
      const eventInfo = await this.get(requestBody.eventId)
      const parsedEventInfo = JSON.parse(eventInfo)
      console.log({ EVENT: parsedEventInfo })
      if (Object.keys(parsedEventInfo.data).length) {
        const {
          eventLocation,
          eventDateAndTime,
          eventOwnerId,
          eventOwnerName,
        } = parsedEventInfo.data
        requestBody = {
          eventDateAndTime,
          eventOwnerId,
          eventOwnerName,
          eventLocation,
          ...requestBody,
        }
      } else {
        const error = new Error()
        error.message = 'Event not exist'
        error.name = 'Validation Exception'
        throw error
      }
    }
    const entityService = new Entity(requestBody).toItem()

    await this.dynamoDbAdapter.createItem(this.tableName, entityService)

    return { data: Entity.fromItem(entityService) }
  }

  async get(id) {
    const response = await this.dynamoDbAdapter.getItem(this.tableName, id)
    console.log(
      `Retrieving Entity item id ${id} from repository entityService from table ${process.env.tableName}`,
    )
    const item = response.Item

    if (item) {
      console.log('Item found', item)
      return JSON.stringify({ data: Entity.fromItem(item) })
    }
    console.log('Item not found')
    return JSON.stringify({ data: {} })
  }

  async queryByGlobalIndex(id, pastBookings) {
    console.log(
      `Retrieving Entities from repository entityService on global index ${process.env.indexName} from table ${process.env.tableName}`,
    )
    const response = await this.dynamoDbAdapter.queryIndexByField(
      this.tableName,
      {
        indexName: this.indexName,
        field: this.field,
        value: id,
        pastBookings,
      },
    )

    const items = response.Items

    if (items.length) {
      console.log('Items found')
      const itemsEntities = items.map((item) => Entity.fromItem(item))

      return JSON.stringify({
        data: itemsEntities,
      })
    } else {
      console.log('Items not found')
      return JSON.stringify({ data: [] })
    }
  }
}
