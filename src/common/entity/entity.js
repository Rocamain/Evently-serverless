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
  'eventLocation',
  'eventDateAndTime',
  'eventPrice',
  'eventLink',
]

const BOOKING_PROPERTIES = [
  'id',
  'type',
  'userId',
  'userName',
  'userEmail',
  'eventId',
  'eventDateAndTime',
  'eventOwnerId',
  'eventOwnerName',
  'eventLocation',
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
    console.log(eventDateAndTime)
    this.createdAt =
      createdAt instanceof Date
        ? createdAt.toISOString()
        : new Date(createdAt).toISOString()
    this.id = id || generateId(createdAt, type)
    this.type = stingFormatter(type)

    this.eventId = eventId
    this.eventOwnerId = eventOwnerId
    this.eventOwnerName = eventOwnerName
    this.eventOwnerEmail = stingFormatter(eventOwnerEmail)
    this.eventTitle = eventTitle
    this.eventDescription = eventDescription
    this.eventLocation = eventLocation
    this.eventDateAndTime =
      eventDate && eventTime
        ? generateDate(eventDate, eventTime)
        : eventDateAndTime
    this.eventLink = stingFormatter(eventLink)
    this.eventPrice = eventPrice

    this.userId = userId
    this.userName = userName
    this.userEmail = stingFormatter(userEmail)
  }

  static fromItem(item) {
    const { PK } = item
    item.id = PK
    delete item.PK

    const entity = new Entity({ ...item })
    const entitySanitized = entity.sanitizeItem()
    if (entitySanitized) {
      const { PK, ...restEntity } = entitySanitized
      return { [`${entitySanitized.type}Id`]: PK, ...restEntity }
    }
  }

  toItem() {
    return {
      ...this.sanitizeItem(),
    }
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
            ? (sanitizeEventItem.PK = this.eventId + '-' + this.userEmail)
            : (sanitizeEventItem[property] = this[property])
        })
        return sanitizeEventItem
      }
    }
  }
}
