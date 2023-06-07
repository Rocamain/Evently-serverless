const getSchema = require('../entity/utils/getSchema')
const validateSchema = require('./utils/validateSchema')

const bodyValidation = () => {
  const bodyValidationBefore = async ({ event, context }) => {
    const { data } = event.body
    const schema = getSchema(data.type)

    validateSchema(data, schema)
  }

  return {
    before: bodyValidationBefore,
  }
}

module.exports = bodyValidation
