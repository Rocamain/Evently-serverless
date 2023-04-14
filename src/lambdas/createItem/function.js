const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EventService = require('../../common/services/eventService')

const handler = async (event, context) => {
  console.log('Starting Lambda function Create Item')
  console.log(context)
  const myEntityService = new EventService()
  return myEntityService.create(event.body)
}

module.exports.handler = middy()
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .handler(handler)
  .use(httpErrorHandler())
