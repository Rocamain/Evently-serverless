const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const [id, userId] = event.pathParameters.id.split('-')

  const myEntityService = new EntityService()

  const response = await myEntityService.delete(id, userId)

  return {
    statusCode: 203,
    'Content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Credentials': true,
    body: JSON.stringify(response),
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
