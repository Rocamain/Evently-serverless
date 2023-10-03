const getSchema = require('../service/utils/getSchema')
const validateSchema = require('./utils/validateSchema')

const bodyValidation = () => {
  const bodyValidationBefore = async ({ event, context }) => {
    const { data } = event.body
    const id = event.pathParameters?.id

    const isEdit = Boolean(id) && event.requestContext.http.method === 'POST'

    let schema

    if (isEdit) {
      const isEditEvent = id.includes('event')
      if (isEditEvent) {
        schema = getSchema('editEvent')
      }

      schema = getSchema('editEvent')
    } else {
      schema = getSchema(data.type)
    }
    validateSchema(data, schema)
  }
  return {
    before: bodyValidationBefore,
  }
}

module.exports = bodyValidation
