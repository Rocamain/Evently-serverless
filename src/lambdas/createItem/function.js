const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const customMiddleware = require('../../common/middlewares/requestBodyValidator')

const myEntityService = new EntityService()

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  return myEntityService.create(event.body)
}

module.exports.handler = middy()
  .use(httpJsonBodyParser())
  .use(customMiddleware())
  .use(httpErrorHandler())
  .handler(handler)
  .use(httpErrorHandler())
