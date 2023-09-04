const middy = require('@middy/core')
const httpHeaderNormalizer = require('@middy/http-header-normalizer')
const httpJsonBodyParser = require('@middy/http-json-body-parser')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { USER_POOL_ID, REGION } = process.env
  const { email, password, name, surname } = event.body

  const client = new CognitoIdentityProviderClient({ region: REGION })

  const command = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [
      { Name: 'name', Value: name },
      { Name: 'family_name', Value: surname },
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ],
    MessageAction: 'SUPPRESS',
  })

  const result = await client.send(command)

  if (result.User) {
    const command = new AdminSetUserPasswordCommand({
      Password: password,
      UserPoolId: USER_POOL_ID,
      Username: email,
      Permanent: true,
    })
    await client.send(command)

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
}
module.exports.handler = middy(handler)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(customErrors())
  .use(httpErrorHandler())
