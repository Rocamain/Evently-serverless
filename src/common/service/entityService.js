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
    if (requestBody.type === 'booking') {
      console.log('Checking if event exists')
      const eventInfo = await this.get(requestBody.eventId, 'event')
      console.log('is booking, this is event result', eventInfo)
      const parsedEventInfo = eventInfo

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
    console.log(
      `Creating entity item in repository on table ${process.env.tableName}`,
    )
    const entityService = new Entity(requestBody).toItem()

    await this.dynamoDbAdapter.createItem(this.tableName, entityService)

    return { data: Entity.fromItem(entityService) }
  }

  async get(id, userId) {
    console.log(
      `Retrieving Entity item id ${id} from repository entityService from table ${process.env.tableName}`,
    )
    const entityItem = await this.dynamoDbAdapter.getItem(this.tableName, {
      id,
      userId,
    })

    return { data: entityItem ? Entity.fromItem(entityItem) : {} }
  }

  async queryByGlobalIndex(id, pastBookings) {
    console.log(
      `Retrieving Entities from repository entityItemService on global index ${process.env.indexName} from table ${process.env.tableName}`,
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

  async delete(id, userId) {
    if (userId === 'event') {
      console.log('IS EVENT')
      const { Items, Count } = await this.dynamoDbAdapter.queryByField(
        this.tableName,
        {
          field: 'PK',
          value: id,
        },
      )

      console.log(
        `Deleting Entities items  with id ${id} from repository entityService from table ${process.env.tableName}`,
      )
      await this.dynamoDbAdapter.deleteItems(this.tableName, {
        id,
        userId,
        items: Items,
        count: Count,
      })

      return { data: { message: 'Items deleted' } }
    } else {
      console.log(
        `Deleting Entity item id ${id} from repository entityService from table ${process.env.tableName}`,
      )
      await this.dynamoDbAdapter.deleteItem(this.tableName, {
        id,
        userId,
      })

      return { data: { message: 'Item deleted' } }
    }
  }
}
