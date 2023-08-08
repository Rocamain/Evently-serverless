const DynamoDbAdapter = require('../adapter/dynamoDbAdapter')
const Entity = require('../entity/entity')
const { tableName, indexName, field } = process.env
module.exports = class EntityService {
  constructor(dynamoDbAdapter) {
    this.dynamoDbAdapter = dynamoDbAdapter || new DynamoDbAdapter()
    this.tableName = tableName
    this.indexName = indexName
    this.field = field
  }

  async create(requestBody) {
    if (requestBody.type === 'booking') {
      const { eventId, ...restRequestBody } = requestBody
      const eventInfo = await this.get(eventId, 'event')

      if (Object.keys(eventInfo.data).length) {
        const {
          eventLocation,
          eventDateAndTime,
          eventOwnerId,
          eventOwnerName,
          eventTitle,
          eventCategory,
        } = eventInfo.data

        requestBody = {
          eventDateAndTime,
          eventOwnerId,
          eventOwnerName,
          eventLocation,
          eventTitle,
          eventCategory,
          eventId,
          ...restRequestBody,
        }
      } else {
        const error = new Error()
        error.message = 'Event does not exist'
        error.name = 'ValidationException'
        throw error
      }
    }
    console.log(
      `Creating entity item in repository on table ${process.env.tableName}`,
    )

    const entityItem = new Entity(requestBody).toItem()

    await this.dynamoDbAdapter.createItem(this.tableName, entityItem)

    console.log('item created')

    return { data: Entity.fromItem(entityItem) }
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

  async queryByGlobalIndex(id, params) {
    console.log(
      `Retrieving Entities from repository entityItemService on global index ${process.env.indexName} from table ${process.env.tableName}`,
    )

    const response = await this.dynamoDbAdapter.queryIndexByField(
      this.tableName,
      {
        indexName: this.indexName,
        field: this.field,
        value: id,
        ...params,
      },
    )

    const items = response.Items
    const lastEvaluatedKey = response.LastEvaluatedKey

    if (items.length) {
      console.log('Items found')

      const itemsEntities = items.map((item) => Entity.fromItem(item))

      return JSON.stringify({
        data: itemsEntities,
        lastEvaluatedKey,
      })
    } else {
      console.log('Items not found')

      return JSON.stringify({ data: [] })
    }
  }

  async delete(id, userId) {
    //  if item to delete is an Event, then delete the booking to that event.

    if (userId === 'event') {
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
