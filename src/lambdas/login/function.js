const middy = require('@middy/core')
const httpHeaderNormalizer = require('@middy/http-header-normalizer')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { USER_POOL_ID, REGION, CLIENT_ID } = process.env
  const { email, password } = JSON.parse(event.body)

  const client = new CognitoIdentityProviderClient({ region: REGION })

  const command = new AdminInitiateAuthCommand({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  })

  const result = await client.send(command)

  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      msg: 'Login successful',
      ...result.AuthenticationResult,
    }),
  }
}
module.exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(customErrors())
  .use(httpErrorHandler())
