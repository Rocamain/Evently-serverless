const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)
  const id = event.pathParameters.id

  const myEntityService = new EntityService()
  const pastBookings =
    event.multiValueQueryStringParameters?.pastBookings[0] === 'true'

  const response = await myEntityService.queryByGlobalIndex(id, pastBookings)

  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: response,
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
