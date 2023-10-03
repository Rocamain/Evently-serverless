const middy = require('@middy/core')
const formDataParser = require('../../common/middlewares/formDataParser')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const CognitoService = require('../../common/service/cognitoService')
const cognitoService = CognitoService()

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { email, password, name, surname, files } = event.body

  await cognitoService.createNewUser({
    email,
    password,
    name,
    surname,
    file: files[0],
  })

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

module.exports.handler = middy(handler)
  .use(formDataParser())
  .use(customErrors())
  .use(httpErrorHandler())
