const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const getSchema = require('../entity/utils/getSchema')

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
  const bodyValidationBefore = async ({ event }) => {
    const schema = getSchema(event.body.type)
    const validate = ajv.compile(schema)

    const data = event.body
    const valid = validate(data)

    if (valid === false) {
      const msg = `Error on ${
        validate.errors[0].instancePath.split('/')[1]
      }: ${validate.errors[0].message.replaceAll('"', '')}`

      const error = new Error()
      error.message = msg
      error.name = 'Validation Exception'
      throw error
    }
  }

  const bodyValidationOnError = async ({ error }) => {
    if (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        error = {}
        error.message = 'Entry already exist'
        error.name = 'Conditional check failed exception'
      }
      return { statusCode: 400, body: JSON.stringify({ error }) }
    }
  }

  return {
    before: bodyValidationBefore,
    onError: bodyValidationOnError,
  }
}

module.exports = bodyValidation
