const middy = require('@middy/core')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const CognitoService = require('../../common/service/cognitoService')
const multipartBodyParser = require('@middy/http-multipart-body-parser')
const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { email, password, name, surname } = event.body

  const cognitoService = new CognitoService()
  await cognitoService.createNewUser({
    email,
    password,
    name,
    surname,
    file: event.body['profile picture'],
  })

  console.log(`${context.functionName} function complete`)
  return {
    statusCode: 201,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ msg: 'User created' }),
  }
}

module.exports.handler = middy()
  .use(multipartBodyParser())
  .use(customErrors())
  .use(httpErrorHandler())
  .handler(handler)
