const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const bodyValidation = require('../../common/middlewares/requestBodyValidator')
const formDataParser = require('../../common/middlewares/formDataParser')
const customErrors = require('../../common/middlewares/customError')

const myEntityService = new EntityService()

const createEntity = {
  event: async (data, files) => await myEntityService.createEvent(data, files),
  booking: async (data) => await myEntityService.createBooking(data),
}

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { files, data } = event.body

  const response = await createEntity[data.type](data, files)

  return {
    statusCode: 201,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  }
}

module.exports.handler = middy()
  .use(formDataParser())
  .use(bodyValidation())
  .use(customErrors())
  .use(httpErrorHandler())
  .handler(handler)
  .use(customErrors())
