const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/services/entityService')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const id = event.pathParameters.id

  const myEntityService = new EntityService()

  const response = await myEntityService.get(id)

  return {
    statusCode: 200,
    'Content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, DELETE, GET',
    'Access-Control-Allow-Credentials': true,
    body: response,
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
