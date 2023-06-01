const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const getSchema = require('../entity/utils/getSchema')
const createErrorMsg = require('./utils/createErrorMsg')

const ajv = new Ajv()
const TimeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/
const DateREgex =
  /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/

ajv.addFormat('HH:MM', TimeRegex)
ajv.addFormat('DD-MM-YYYY', DateREgex)
ajv.addFormat('price', {
  validate: (price) => Number(price) >= 0,
})

addFormats(ajv)

const bodyValidation = () => {
  const bodyValidationBefore = async ({ event, context }) => {
    const itemData = event.body.data

    const schema = getSchema(itemData.type)
    const validate = ajv.compile(schema)
    const valid = validate(itemData)

    if (valid === false) {
      const msg = createErrorMsg(validate.errors[0])

      const error = {}
      error.name = 'Validation Exception'
      error.message = msg

      return { statusCode: 400, body: JSON.stringify({ error }) }
    }
  }

  return {
    before: bodyValidationBefore,
  }
}

module.exports = bodyValidation
