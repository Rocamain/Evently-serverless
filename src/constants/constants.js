const BODY_EVENT_PROPERTIES = [
  'type',
  'eventOwnerId',
  'eventOwnerName',
  'eventOwnerEmail',
  'eventOwnerPicture',
  'eventTitle',
  'eventDescription',
  'eventCategory',
  'eventLocationId',
  'eventDate',
  'eventPrice',
  'eventLink',
]

const BODY_BOOKING_PROPERTIES = [
  'type',
  'userId',
  'userName',
  'userEmail',
  'eventId',
]

const QUERY_PARAMS = [
  'includePast',
  'exclusiveStartKey',
  'eventCategory',
  'limit',
  'fromDate',
  'toDate',
  'searchWords',
  'maxPrice',
  'exclusiveStartKey',
]

const EVENT_CATEGORIES = [
  'Social',
  'Tech',
  'Cooking',
  'Sports',
  'Games',
  'Professional',
  'Religious',
  'Other',
  'Travel',
]

const KEYS_TO_REMOVE = [
  '$ACTION_REF_2',
  '$ACTION_2:0',
  '$ACTION_2:1',
  '$ACTION_KEY',
]

const TIME_REGEX = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const ENTITY_EVENT_PROPERTIES = [
  'id',
  'createdAt',
  'type',
  'eventOwnerId',
  'eventOwnerName',
  'eventOwnerEmail',
  'eventOwnerPicture',
  'eventTitle',
  'eventDescription',
  'eventCategory',
  'eventLocationId',
  'eventLocationAddress',
  'eventLocationLat',
  'eventLocationLng',
  'eventDateAndTime',
  'eventPrice',
  'eventLink',
  'eventPictures',
  'userId',
]

const ENTITY_BOOKING_PROPERTIES = [
  'id',
  'createdAt',
  'type',
  'userId',
  'userName',
  'userEmail',
  'userPicture',
  'eventId',
  'eventDateAndTime',
  'eventOwnerName',
  'eventOwnerId',
  'eventTitle',
  'eventLocationId',
  'eventCategory',
]

const QUERY_PARAMS_SCHEMA = {
  properties: {
    includePast: { type: 'string', format: 'boolean' },
    eventCategory: { type: 'string', enum: EVENT_CATEGORIES },
    limit: { type: ['number', 'string'] },
    fromDate: { type: 'string', format: 'YYYY-MM-DD' },
    toDate: { type: 'string', format: 'YYYY-MM-DD' },
    searchWords: { type: 'string' },
    maxPrice: { type: 'number' },
    lastPK: { type: 'string' },
    lastEventDateAndTime: { type: 'string', format: 'ISO8601' },
    lastUserId: { type: 'string' },
    lastEventOwnerId: { type: 'string' },
  },
  additionalProperties: false,
}

const EVENT_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['event', 'booking'] },
    eventOwnerId: { type: 'string' },
    eventOwnerName: { type: 'string' },
    eventOwnerEmail: { type: 'string', format: 'email' },
    eventOwnerPicture: { type: 'string', format: 'uri' },
    eventTitle: { type: 'string' },
    eventDescription: { type: 'string' },
    eventLocationId: { type: 'string' },
    eventLocationLat: { type: 'string' },
    eventLocationLng: { type: 'string' },
    eventLocationAddress: { type: 'string' },
    eventCategory: {
      type: 'string',
      enum: EVENT_CATEGORIES,
    },
    eventDate: { type: 'string', pattern: DATE_REGEX.source },
    eventTime: { type: 'string', pattern: TIME_REGEX.source },
    eventPrice: { type: 'number', minimum: 0 },
    eventLink: { type: 'string', format: 'uri' },
    eventPictures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          mimetype: { type: 'string', enum: ['image/webp'] },
          encoding: { type: 'string' },
          truncated: { type: 'boolean' },
        },
        required: ['filename', 'mimetype', 'encoding', 'truncated'],
      },
    },
  },
  required: BODY_EVENT_PROPERTIES,
  additionalProperties: false,
}

const EDIT_EVENT_SCHEMA = {
  type: 'object',
  properties: {
    eventTitle: { type: 'string' },
    eventDescription: { type: 'string' },
    eventLocationId: { type: 'string' },
    eventLocationLat: { type: 'string' },
    eventLocationLng: { type: 'string' },
    eventLocationAddress: { type: 'string' },
    eventCategory: {
      type: 'string',
      enum: EVENT_CATEGORIES,
    },
    eventDate: { type: 'string', format: 'YYYY-MM-DD' },
    eventTime: { type: 'string', format: 'HH:MM' },
    eventPrice: { type: 'number', minimum: 0 },
    eventLink: { type: 'string', format: 'uri' },
  },
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
  required: BODY_BOOKING_PROPERTIES,
  additionalProperties: false,
}

const TYPE_ERROR_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['event', 'booking'] },
  },
  required: ['type'],
}

const ACCEPTED_QUERIES = QUERY_PARAMS

module.exports = {
  TIME_REGEX,
  DATE_REGEX,
  ISO_DATE_REGEX,
  ENTITY_EVENT_PROPERTIES,
  ENTITY_BOOKING_PROPERTIES,
  KEYS_TO_REMOVE,
  QUERY_PARAMS_SCHEMA,
  EVENT_SCHEMA,
  EDIT_EVENT_SCHEMA,
  BOOKING_SCHEMA,
  TYPE_ERROR_SCHEMA,
  ACCEPTED_QUERIES,
}
