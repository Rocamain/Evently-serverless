const DynamoDbAdapter = require('../adapter/dynamoDbAdapter')
const S3Service = require('./s3Services')
const Entity = require('../entity/entity')
const generateId = require('./utils/generateId')

const { tableName, indexName, field } = process.env
module.exports = class EntityService {
  constructor(dynamoDbAdapter) {
    this.dynamoDbAdapter = dynamoDbAdapter || new DynamoDbAdapter()
    this.s3Service = new S3Service()
    this.tableName = tableName
    this.indexName = indexName
    this.field = field
  }

  async createEvent(event, files) {
    event.id = generateId()
    const { IS_OFFLINE } = process.env
    if (!IS_OFFLINE) {
      event.eventPhotos = await this.s3Service.saveEventPictures({
        files,
        eventId: event.id,
      })
    } else {
      event.eventPhotos = ['placeholder.com/hello.webp']
    }
    console.log({
      eventPhotos: event,
      tableName: this.tableName,
      dynamoDbAdapter: this.dynamoDbAdapter.create,
    })

    const response = await this.create(event)
    console.log('Last', response)
    return response
  }

  async createBooking(booking) {
    const { eventId, ...restRequestBody } = booking
    const eventInfo = await this.get(eventId, 'event')

    if (eventInfo && Object.keys(eventInfo.data).length) {
      const {
        eventLocation,
        eventDateAndTime,
        eventOwnerId,
        eventOwnerName,
        eventTitle,
        eventCategory,
      } = eventInfo.data

      booking = {
        eventDateAndTime,
        eventOwnerId,
        eventOwnerName,
        eventLocation,
        eventTitle,
        eventCategory,
        eventId,
        ...restRequestBody,
      }

      return await this.create(booking)
    } else {
      const error = new Error()
      error.message = 'Event does not exist'
      error.name = 'ValidationException'
      throw error
    }
  }

  async create(requestBody) {
    console.log(
      `Creating entity item in repository on table ${process.env.tableName}`,
    )

    const entityItem = new Entity(requestBody).toItem()

    await this.dynamoDbAdapter.createItem(this.tableName, entityItem)

    console.log('item created')

    return { data: Entity.fromItem(entityItem) }
  }

  async update(requestBody, entityId) {
    console.log(
      `Updating entity item in repository on table ${process.env.tableName}`,
    )

    const [id, userId] = entityId.split('-')
    if (entityId.includes('event')) {
      const eventInfo = await this.get(id, 'event')
      const eventExist = Boolean(Object.keys(eventInfo.data).length)

      if (!eventExist) {
        const error = new Error()
        error.message = 'Event does not exist'
        error.name = 'ValidationException'
        throw error
      }
    }

    const entityItem = await this.dynamoDbAdapter.updateItem(
      this.tableName,
      { id, userId },
      requestBody,
    )

    return { message: 'Update successful', data: Entity.fromItem(entityItem) }
  }

  async get(id, userId) {
    console.log(
      `Retrieving Entity item id ${id} from repository entityService from table ${process.env.tableName}`,
    )
    if (userId) {
      const entityItem = await this.dynamoDbAdapter.getItem(this.tableName, {
        id,
        userId,
      })
      return { data: entityItem ? Entity.fromItem(entityItem) : {} }
    }

    const { Items, Count } = await this.dynamoDbAdapter.queryByField(
      this.tableName,
      {
        field: 'PK',
        value: id,
      },
    )
    return {
      data: Items
        ? {
            items: Items.map((entityItem) => Entity.fromItem(entityItem)),
            count: Count,
          }
        : {},
    }
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
    console.log('service global index', { response })
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
