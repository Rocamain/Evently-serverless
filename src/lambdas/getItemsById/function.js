const middy = require('@middy/core')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const queryParser = require('../utils/queryParser')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)
  const id = event.pathParameters.id.split('-')[0]

  const myEntityService = new EntityService()

  const queries = queryParser({
    ...event.queryStringParameters,
  })

  const response = await myEntityService.queryByGlobalIndex(id, queries)

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
