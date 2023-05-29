const EVENT_PROPERTIES = [
  'type',
  'eventOwnerId',
  'eventOwnerName',
  'eventOwnerEmail',
  'eventTitle',
  'eventDescription',
  'eventCategory',
  'eventLocation',
  'eventDate',
  'eventPrice',
  'eventLink',
]
const BOOKING_PROPERTIES = [
  'type',
  'userId',
  'userName',
  'userEmail',
  'eventId',
]

const EVENT_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['event', 'booking'] },
    eventOwnerId: { type: 'string' },
    eventOwnerName: { type: 'string' },
    eventOwnerEmail: { type: 'string', format: 'email' },
    eventTitle: { type: 'string' },
    eventDescription: { type: 'string' },
    eventLocation: { type: 'string' },
    eventCategory: { type: 'string', enum: ['travel', 'other'] },
    eventDate: { type: 'string', format: 'DD-MM-YYYY' },
    eventTime: { type: 'string', format: 'HH:MM' },
    eventPrice: { type: 'number', format: 'price' },
    eventLink: { type: 'string', format: 'uri' },
  },
  required: EVENT_PROPERTIES,
  additionalProperties: false,
}

const BOOKING_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['event', 'booking'] },
    userId: { type: 'string' },
    userName: { type: 'string' },
    userEmail: { type: 'string', format: 'email' },
    eventId: { type: 'string' },
  },
  required: BOOKING_PROPERTIES,
  additionalProperties: false,
}

const TYPE_ERROR_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['event', 'booking'] },
  },
  required: ['type'],
}

const getSchema = (type) => {
  switch (type) {
    case 'event': {
      return EVENT_SCHEMA
    }

    case 'booking': {
      return BOOKING_SCHEMA
    }

    default: {
      return TYPE_ERROR_SCHEMA
    }
  }
}

module.exports = getSchema
