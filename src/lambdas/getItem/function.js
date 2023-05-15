const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const id = event.pathParameters.id
  const userId = event.pathParameters.sort
  console.log(event.pathParameters)
  const myEntityService = new EntityService()

  const response = await myEntityService.get(id, userId)

  return {
    statusCode: 200,
    Headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
