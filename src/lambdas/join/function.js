const middy = require('@middy/core')

const formDataParser = require('../../common/middlewares/formDataParser')
const customErrors = require('../../common/middlewares/customError')
const httpErrorHandler = require('@middy/http-error-handler')
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const S3Service = require('../../common/service/s3Services')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { USER_POOL_ID, REGION } = process.env
  const { email, password, name, surname, files } = event.body

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
    console.log('user created')
    const command = new AdminSetUserPasswordCommand({
      Password: password,
      UserPoolId: USER_POOL_ID,
      Username: email,
      Permanent: true,
    })
    await client.send(command)

    const s3Service = new S3Service()

    const profilePhoto = await s3Service.saveFile({
      type: 'profilePhoto',
      files,
      id: result.User.Username,
    })

    const updateCommand = new AdminUpdateUserAttributesCommand({
      Username: result.User.Username,
      UserPoolId: USER_POOL_ID,

      UserAttributes: [
        // AttributeListType // required
        {
          // AttributeType
          Name: 'picture', // required
          Value: profilePhoto[0].link,
        },
      ],
    })
    await client.send(updateCommand)

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
module.exports.handler = middy()
  .use(formDataParser())
  .use(customErrors())
  .use(httpErrorHandler())
  .handler(handler)
