const generateId = require('./utils/generateId')

module.exports = class EventEntity {
  constructor({
    createdAt = new Date(),
    id,
    eventId,
    eventOwner,
    eventOwnerName,
    eventOwnerEmail,
    name,
    email,
    title,
    description,
    location,
    price,
    date,
    type,
  }) {
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt)
    this.id = id || generateId(createdAt, type)
    this.type = type
    this.email = email

    this.eventId = eventId
    this.eventOwner = eventOwner
    this.eventOwnerEmail = eventOwnerEmail
    this.eventOwnerName = eventOwnerName

    this.name = name
    this.title = title
    this.description = description
    this.location = location
    this.price = price
    this.date = date
  }

  key() {
    return {
      PK: this.id,
    }
  }

  static fromItem(item) {
    return new EventEntity({
      id: item.PK,
      createdAt: item.createdAt,
      type: item.type,
      email: item.email,
      title: item.title,
      description: item.description,
      location: item.location,
      price: item.price,
      date: item.date,
      eventId: item.eventId,
      eventOwner: item.eventOwner,
      eventOwnerEmail: item.eventOwnerEmail,
      eventOwnerName: item.eventOwnerName,
    })
  }

  toItem() {
    return {
      ...this.key(),
      createdAt: this.createdAt.toISOString(),
      type: this.type,
      email: this.email,
      title: this.title,
      description: this.description,
      location: this.location,
      price: this.price,
      date: this.date,
      eventId: this.eventId,
      eventOwner: this.eventOwner,
      eventOwnerEmail: this.eventOwnerEmail,
      eventOwnerName: this.eventOwnerName,
    }
  }

  getSchema() {
    switch (this.type) {
      case 'event': {
        const eventSchema = {}
        return eventSchema
      }

      case 'booking': {
        const bookingSchema = {}
        return bookingSchema
      }

      default: {
        const error = new Error()
        error.msg = 'type is required'
        error.statusCode = 400
        return error
      }
    }
  }
}
