const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
  GetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider')

const { USER_POOL_ID, REGION } = process.env

module.exports = class CognitoAdapter {
  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: REGION,
    })
    this.region = REGION
    this.userPoolId = USER_POOL_ID
  }

  async createUser({ name, surname, email, password }) {
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
    const result = await this.client.send(command)

    if (result?.User) {
      await this.setUserPassword({ email, password })
      return result.User.Username
    }
  }

  async setUserPassword({ email, password }) {
    const command = new AdminSetUserPasswordCommand({
      Password: password,
      UserPoolId: this.userPoolId,
      Username: email,
      Permanent: true,
    })
    await this.client.send(command)
  }

  async setUserProfilePicture({ userId, profilePhoto }) {
    const updateCommand = new AdminUpdateUserAttributesCommand({
      Username: userId,
      UserPoolId: this.userPoolId,
      UserAttributes: [
        {
          Name: 'picture',
          Value: profilePhoto,
        },
      ],
    })
    await this.client.send(updateCommand)
  }

  async loginUser({ email, password }) {
    const loginCommand = new AdminInitiateAuthCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
    await this.client.send(loginCommand)
  }
  async getUser({ accessToken }) {
    const getUserCommand = new GetUserCommand({
      AccessToken: accessToken,
    })
    const res = await this.client.send(getUserCommand)
    console.log('here, res', res)
    return res
  }
}
