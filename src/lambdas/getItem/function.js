const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const [id, userId] = event.pathParameters.id.split('-')

  if (id) {
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

  return {
    statusCode: 200,
    Headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ data: {} }),
  }
}
module.exports.handler = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
