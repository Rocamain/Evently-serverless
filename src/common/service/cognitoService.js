const CognitoAdapter = require('../adapter/cognitoAdapter')
const S3Adapter = require('../adapter/s3Adapter')

module.exports = class S3Service {
  constructor() {
    this.CognitoAdapter = new CognitoAdapter()
    this.S3Adapter = new S3Adapter()
  }

  async createNewUser({ name, surname, email, password, file }) {
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
}
