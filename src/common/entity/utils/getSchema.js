const {
  EVENT_SCHEMA,
  BOOKING_SCHEMA,
  TYPE_ERROR_SCHEMA,
  QUERY_PARAMS_SCHEMA,
} = require('../../../constants/constants')

const getSchema = (type) => {
  switch (type) {
    case 'event': {
      return EVENT_SCHEMA
    }

    case 'booking': {
      return BOOKING_SCHEMA
    }
    case 'query': {
      return QUERY_PARAMS_SCHEMA
    }

    default: {
      return TYPE_ERROR_SCHEMA
    }
  }
}

module.exports = getSchema
