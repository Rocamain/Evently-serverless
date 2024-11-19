const middy = require('@middy/core')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const CognitoService = require('../../common/service/cognitoService')
const httpHeaderNormalizer = require('@middy/http-header-normalizer')
const httpJsonBodyParser = require('@middy/http-json-body-parser')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)
  const { authorization } = event.headers
  const accessToken = authorization.split(' ')[1]
  console.log(accessToken)
  if (!accessToken) {
    return {
      statusCode: 401,
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Credentials': true,
      },
      body: { message: 'Access forbidden' },
    }
  }
  const cognitoService = new CognitoService()

  const data = await cognitoService.getuser(accessToken)
  console.log(`${context.functionName} function complete`)
  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  }
}

module.exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(customErrors())
  .use(httpErrorHandler())
