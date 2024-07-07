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

  async createEvent(data, files) {
    data.id = generateId()
    console.log({ 'Running Event Service wit data...': files, data })
    if (!files) {
      return { message: 'To create an event, pictures are required' }
    }

    if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev') {
      data.eventPictures = await this.s3Service.saveEventPictures({
        files,
        eventId: data.id,
      })
    } else {
      // Block for test, to avoid making calls to the api, saving cost
      data.eventPictures = []
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          data.eventPictures.push(
            'placeholder_picture' + '-' + Number(index + 1),
          )
        })
      } else {
        data.eventPictures.push('placeholder_picture-1')
      }
    }
    const response = await this.create(data)

    return response
  }

  async createBooking(booking) {
    console.log({ 'Running Booking Service with data...': booking })
    const { eventId, ...restRequestBody } = booking
    if (!eventId) {
      const error = new Error()
      error.message = 'Event does not exist'
      error.name = 'ValidationException'
      throw error
    }
    const id = eventId.split('-event')[0]

    const eventInfo = await this.get(id, 'event')
    console.log({ id, eventInfo })
    const existEvent = Object.keys(eventInfo.data).length !== 0

    if (!existEvent) {
      const error = new Error()
      error.message = 'Event does not exist'
      error.name = 'ValidationException'
      throw error
    }

    const {
      eventLocationId,
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
      eventLocationId,
      eventTitle,
      eventCategory,
      eventId,
      ...restRequestBody,
    }

    return await this.create(booking)
  }

  async create(data) {
    console.log(
      `Creating entity item in repository on table ${
        process.env.tableName
      } with this data: ${JSON.stringify(data)}`,
    )

    const entityItem = new Entity(data).toItem()

    await this.dynamoDbAdapter.createItem(this.tableName, entityItem)

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

  async queryByGlobalIndex(id, queries) {
    console.log(
      `Retrieving Entities from repository entityItemService on global index ${process.env.indexName} from table ${process.env.tableName}`,
    )
    console.log({
      indexName: this.indexName,
      field: this.field,
      value: id,
      ...queries,
    })

    const response = await this.dynamoDbAdapter.queryIndexByField(
      this.tableName,
      {
        indexName: this.indexName,
        field: this.field,
        value: id,
        ...queries,
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
