const CognitoAdapter = require('../adapter/cognitoAdapter')
const S3Adapter = require('../adapter/s3Adapter')

module.exports = class CognitoService {
  constructor() {
    this.CognitoAdapter = new CognitoAdapter()
    this.S3Adapter = new S3Adapter()
  }

  async createNewUser({ name, surname, email, password, file }) {
    console.log('creating user ')
    try {
      const userId = await this.CognitoAdapter.createUser({
        name,
        surname,
        email,
        password,
      })

      if (file) {
        const profilePhoto = await this.S3Adapter.saveProfilePhoto({
          file,
          userId,
        })

        if (profilePhoto) {
          return await this.CognitoAdapter.setUserProfilePicture({
            userId,
            profilePhoto,
          })
        }
      }
    } catch (error) {
      console.log('service create user error', error)
      throw error
    }
  }
  async getuser(accessToken) {
    try {
      const user = await this.CognitoAdapter.getUser({ accessToken })
      console.log('Service resturning user', user)
      return user
    } catch (error) {
      console.log('service get user error', error)
      throw error
    }
  }
}
