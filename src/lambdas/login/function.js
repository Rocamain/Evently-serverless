const middy = require('@middy/core')
const httpHeaderNormalizer = require('@middy/http-header-normalizer')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  GetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const userAttributes = (attributes) => {
  return attributes.reduce((acc, { Name, Value }) => {
    return { ...acc, [Name]: Value }
  }, {})
}

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)
  console.log(process)
  const { USER_POOL_ID, REGION, CLIENT_ID } = process.env
  const { email, password } = event.body

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
  const userCommand = new GetUserCommand({
    AccessToken: result.AuthenticationResult.AccessToken,
  })

  const { UserAttributes } = await client.send(userCommand)
  const userInfo = userAttributes(UserAttributes)
  console.log(`Login done`)
  return {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Login successful',
      ...result.AuthenticationResult,
      userInfo,
    }),
  }
}
module.exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(customErrors())
  .use(httpErrorHandler())
