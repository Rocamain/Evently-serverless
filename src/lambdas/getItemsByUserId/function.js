const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const customErrors = require('../../common/middlewares/customError')
const EntityService = require('../../common/service/entityService')
const queryParser = require('../utils/queryParser')
const paramsValidator = require('../../common/middlewares/paramsValidator')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName} HOLA AMIGO`)
  const id = event.pathParameters.id

  const myEntityService = new EntityService()

  const queries = queryParser({
    ...event.queryStringParameters,
  })

  const response = await myEntityService.queryByGlobalIndex(id, queries)

  if (queries.withBookings === 'true' && id === 'event') {
    const eventWithBookings = await Promise.all(
      response.data.map(async ({ eventId }) => {
        const myEntityService = new EntityService()

        const response = await myEntityService.get(eventId)

        return response.data
      }),
    )
    return {
      statusCode: 200,
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(eventWithBookings),
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  }
}
module.exports.handler = middy()
  .use(paramsValidator())
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .handler(handler)
  .use(customErrors())
