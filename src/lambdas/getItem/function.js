const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EventService = require('../../common/services/eventService')

const handler = async (event) => {
  console.log('Starting Lambda function Get Item')
  const id = event.pathParameters.id
  const myEntityService = new EventService()

  const response = await myEntityService.get(id)

  return {
    statusCode: 200,
    'Content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, DELETE, POST, GET',
    'Access-Control-Allow-Credentials': true,
    body: response,
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
