const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const createErrorMsg = require('./createErrorMsg')
const {
  TIME_REGEX,
  DATE_REGEX,
  PRICE_REGEX,
  ISO_DATE_REGEX,
} = require('../../../constants/constants')

const ajv = new Ajv()

ajv.addFormat('HH:MM', TIME_REGEX)
ajv.addFormat('DD-MM-YYYY', DATE_REGEX)
ajv.addFormat('positive integer', PRICE_REGEX)
ajv.addFormat('ISO8601', ISO_DATE_REGEX)
ajv.addFormat('boolean', {
  validate: (value) => {
    if (
      value === 'false' ||
      value === false ||
      value === 'true' ||
      value === true
    ) {
      return true
    }

    return false
  },
})

addFormats(ajv)

const validateSchema = (data, schema) => {
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid === false) {
    const error = new Error()

    error.name = 'ValidationException'
    error.message = createErrorMsg(validate.errors[0])

    throw error
  }
}

module.exports = validateSchema
