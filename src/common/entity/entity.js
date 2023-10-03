const generateId = require('../service/utils/generateId')
const generateDate = require('../service/utils/generateDate')
const { stingFormatter } = require('../service/utils/stringFormatter')
const {
  ENTITY_EVENT_PROPERTIES,
  ENTITY_BOOKING_PROPERTIES,
} = require('../../constants/constants')

module.exports = class Entity {
  constructor({
    createdAt = new Date(),
    id,
    type,
    eventId,
    eventOwnerId,
    eventOwnerName,
    eventOwnerEmail,
    eventOwnerPicture,
    eventTitle,
    eventDescription,
    eventCategory,
    eventLocation,
    eventDate,
    eventTime,
    eventDateAndTime,
    eventLink,
    eventPrice,
    eventPhotos,
    userId,
    userName,
    userEmail,
    userPicture,
  }) {
    this.id = id || generateId()
    this.createdAt = createdAt
      ? new Date(createdAt).toISOString()
      : new Date().toISOString()
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
    this.eventPhotos = eventPhotos
    this.eventPrice = eventPrice
    this.userId = userId || type
    this.userName = userName
    this.userEmail = stingFormatter(userEmail)
    this.eventOwnerPicture = eventOwnerPicture
    this.userPicture = userPicture
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

        ENTITY_EVENT_PROPERTIES.forEach((property) => {
          property === 'id'
            ? (sanitizeEventItem.PK = this.id)
            : (sanitizeEventItem[property] = this[property])
        })

        return sanitizeEventItem
      }
      case 'booking': {
        const sanitizeEventItem = {}
        ENTITY_BOOKING_PROPERTIES.forEach((property) => {
          property === 'id'
            ? (sanitizeEventItem.PK = this.eventId)
            : (sanitizeEventItem[property] = this[property])
        })
        return sanitizeEventItem
      }
    }
  }
}
