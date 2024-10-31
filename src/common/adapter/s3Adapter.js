const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const { BUCKET_NAME } = process.env

module.exports = class S3Adapter {
  constructor() {
    this.client = new S3Client({ region: process.env.REGION })
    this.Bucket = BUCKET_NAME
  }

  async saveProfilePhoto({ file, userId }) {
    console.log('saving profile picture', { file })

    const fileName = `${userId}/profilePicture.webp`
    return await this.save({ file: file.content, fileName })
  }

  async saveEventPhoto({ file, eventId, picId }) {
    console.log('S3 save photo adapter:', { file, eventId, picId })

    try {
      const fileName = `${eventId}/${picId}.webp`
      return await this.save({ file: file.content, fileName })
    } catch (error) {
      return error
    }
  }

  async save({ file, fileName }) {
    console.log('saving file', fileName)

    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Body: file,
      Key: fileName,
    })

    await this.client.send(command)

    return `https://${this.Bucket}.s3.amazonaws.com/${fileName}`
  }
}
