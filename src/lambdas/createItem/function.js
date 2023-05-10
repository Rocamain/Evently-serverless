const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const customMiddleware = require('../../common/middlewares/requestBodyValidator')

const myEntityService = new EntityService()

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const response = await myEntityService.create(event.body)

  return {
    statusCode: 201,
    'Content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, DELETE, GET',
    'Access-Control-Allow-Credentials': true,
    body: JSON.stringify(response),
  }
}

module.exports.handler = middy()
  .use(httpJsonBodyParser())
  .use(customMiddleware())
  .use(httpErrorHandler())
  .handler(handler)
  .use(httpErrorHandler())
