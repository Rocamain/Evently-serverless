const generateId = require('../service/utils/generateId')
const generateDate = require('../service/utils/generateDate')
const { stingFormatter } = require('../service/utils/stringFormatter')
const {
  ENTITY_EVENT_PROPERTIES,
  ENTITY_BOOKING_PROPERTIES,
} = require('../../constants/constants')

module.exports = class Entity {
  constructor({
    createdAt,
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
    eventLocationId,
    eventLocationLat,
    eventLocationLng,
    eventLocationAddress,
    eventDate,
    eventTime,
    eventDateAndTime,
    eventLink,
    eventPrice,
    eventPictures,
    userId,
    userName,
    userEmail,
    userPicture,
  }) {
    this.id = id || generateId()
    this.createdAt = createdAt || new Date().toISOString()
    this.type = stingFormatter(type)
    this.eventId = eventId
    this.eventOwnerId = eventOwnerId
    this.eventOwnerName = eventOwnerName
    this.eventOwnerEmail = stingFormatter(eventOwnerEmail)
    this.eventTitle = eventTitle
    this.eventDescription = eventDescription
    this.eventCategory = eventCategory
    this.eventLocationId = eventLocationId
    this.eventLocationLat = eventLocationLat
    this.eventLocationLng = eventLocationLng
    this.eventLocationAddress = eventLocationAddress
    this.eventDateAndTime =
      eventDate && eventTime
        ? generateDate(eventDate, eventTime)
        : eventDateAndTime
    this.eventLink = stingFormatter(eventLink)
    this.eventPictures = eventPictures
    this.eventPrice = eventPrice
    this.userId = userId || type
    this.userName = userName
    this.userEmail = stingFormatter(userEmail)
    this.eventOwnerPicture = eventOwnerPicture
    this.userPicture = userPicture
  }

  static fromItem(item) {
    item[`${item.type}Id`] = item.PK

    delete item.PK

    return item
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
        const sanitizeBookingItem = {}
        ENTITY_BOOKING_PROPERTIES.forEach((property) => {
          property === 'id'
            ? (sanitizeBookingItem.PK = this.eventId.split('-')[0])
            : (sanitizeBookingItem[property] = this[property])
        })
        return sanitizeBookingItem
      }
    }
  }
}
