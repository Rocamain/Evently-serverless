const getSchema = require('../service/utils/getSchema')
const validateSchema = require('./utils/validateSchema')
const sanitizeData = require('./utils/sanitizeData')
const bodyValidation = () => {
  const bodyValidationBefore = async ({ event, context }) => {
    sanitizeData(event.body)
    const data = event.body

    // Determine the schema based on the event type or context
    const id = event.pathParameters?.id && d.includes('event')
    const isEdit = Boolean(id) && event.requestContext.http.method === 'POST'
    let schema

    if (isEdit) {
      const isEditEvent = id.includes('event')
      schema = isEditEvent ? getSchema('editEvent') : getSchema('booking') // Assuming booking is the other edit option
    } else {
      schema = getSchema(data.type)
    }
    console.log({ data })
    // Validate the data against the schema
    validateSchema(data, schema)
  }

  return {
    before: bodyValidationBefore,
  }
}

module.exports = bodyValidation
