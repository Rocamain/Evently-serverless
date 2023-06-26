const BODY_EVENT_PROPERTIES = [
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

module.exports = {
  TIME_REGEX: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/,
  DATE_REGEX:
    /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,

  ISO_DATE_REGEX: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,

  ENTITY_EVENT_PROPERTIES: [
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
    'eventPhotos',
    'userId',
  ],
  ENTITY_BOOKING_PROPERTIES: [
    'id',
    'createdAt',
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
  ],
  QUERY_PARAMS_SCHEMA: {
    properties: {
      includePast: { type: 'string', format: 'boolean' },
      eventCategory: { type: 'string', enum: EVENT_CATEGORIES },
      limit: { type: 'number' || 'string' },
      fromDate: { type: 'string', format: 'DD-MM-YYYY' },
      toDate: { type: 'string', format: 'DD-MM-YYYY' },
      searchWords: { type: 'string' },
      maxPrice: { type: 'number' },
      lastPK: { type: 'string' },
      lastEventDateAndTime: { type: 'string', format: 'ISO8601' },
      lastUserId: { type: 'string' },
      lastEventOwnerId: { type: 'string' },
    },

    additionalProperties: false,
  },
  EVENT_SCHEMA: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['event', 'booking'] },
      eventOwnerId: { type: 'string' },
      eventOwnerName: { type: 'string' },
      eventOwnerEmail: { type: 'string', format: 'email' },
      eventTitle: { type: 'string' },
      eventDescription: { type: 'string' },
      eventLocation: { type: 'string' },
      eventCategory: {
        type: 'string',
        enum: EVENT_CATEGORIES,
      },
      eventDate: { type: 'string', format: 'DD-MM-YYYY' },
      eventTime: { type: 'string', format: 'HH:MM' },
      eventPrice: { type: 'number', minimum: 0 },
      eventLink: { type: 'string', format: 'uri' },
    },
    required: BODY_EVENT_PROPERTIES,
    additionalProperties: false,
  },
  BOOKING_SCHEMA: {
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
  },

  TYPE_ERROR_SCHEMA: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['event', 'booking'] },
    },
    required: ['type'],
  },
  ACCEPTED_QUERIES: QUERY_PARAMS,
}
