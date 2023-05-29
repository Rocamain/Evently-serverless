const generateId = require('./utils/generateId')
const generateDate = require('./utils/generateDate')
const { stingFormatter } = require('./utils/stringFormatter')

const EVENT_PROPERTIES = [
  'id',
  'createdAt',
  'type',
  'eventOwnerId',
  'eventOwnerName',
  'eventOwnerEmail',
  'eventTitle',
  'eventDescription',
  'eventCategory',
  'eventLocation',
  'eventDateAndTime',
  'eventPrice',
  'eventLink',
  'userId',
]

const BOOKING_PROPERTIES = [
  'id',
  'type',
  'userId',
  'userName',
  'userEmail',
  'eventId',
  'eventDateAndTime',
  'eventOwnerName',
  'eventOwnerId',
  'eventTitle',
  'eventLocation',
  'eventCategory',
]

module.exports = class Entity {
  constructor({
    createdAt = new Date(),
    id,
    type,
    eventId,
    eventOwnerId,
    eventOwnerName,
    eventOwnerEmail,
    eventTitle,
    eventDescription,
    eventCategory,
    eventLocation,
    eventDate,
    eventTime,
    eventDateAndTime,
    eventLink,
    eventPrice,
    userId,
    userName,
    userEmail,
  }) {
    this.createdAt =
      createdAt instanceof Date
        ? createdAt.toISOString()
        : new Date(createdAt).toISOString()
    this.id = id || generateId(createdAt)
    this.type = stingFormatter(type)
    this.eventId = eventId
    this.eventOwnerId = eventOwnerId
    this.eventOwnerName = eventOwnerName
    this.eventOwnerEmail = stingFormatter(eventOwnerEmail)
    this.eventTitle = eventTitle
    this.eventDescription = eventDescription
    this.eventCategory = eventCategory
    this.eventLocation = eventLocation
    this.eventDateAndTime =
      eventDate && eventTime
        ? generateDate(eventDate, eventTime)
        : eventDateAndTime
    this.eventLink = stingFormatter(eventLink)
    this.eventPrice = eventPrice
    this.userId = userId || type
    this.userName = userName
    this.userEmail = stingFormatter(userEmail)
  }

  static fromItem(item) {
    item.id = item.PK
    delete item.PK

    const entity = new Entity({ ...item })
    const entitySanitized = entity.sanitizeItem()
    if (entitySanitized) {
      const isEvent = item.type === 'event'

      if (isEvent) {
        delete entitySanitized.userId
      }
      if (!isEvent) {
        delete entitySanitized.eventOwnerId
      }
      let { PK, ...restEntity } = entitySanitized

      PK = isEvent
        ? PK + '-' + entitySanitized.type
        : PK + '-' + entitySanitized.userId

      return {
        [`${entitySanitized.type}Id`]: PK,
        ...restEntity,
      }
    }
  }

  toItem() {
    const item = { ...this.sanitizeItem() }

    return item
  }

  sanitizeItem() {
    switch (this.type) {
      case 'event': {
        const sanitizeEventItem = {}

        EVENT_PROPERTIES.forEach((property) => {
          property === 'id'
            ? (sanitizeEventItem.PK = this.id)
            : (sanitizeEventItem[property] = this[property])
        })

        return sanitizeEventItem
      }
      case 'booking': {
        const sanitizeEventItem = {}
        BOOKING_PROPERTIES.forEach((property) => {
          property === 'id'
            ? (sanitizeEventItem.PK = this.eventId)
            : (sanitizeEventItem[property] = this[property])
        })
        return sanitizeEventItem
      }
    }
  }
}
