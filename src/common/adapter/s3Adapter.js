const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
require('sharp')

const sharp = require('sharp')

const { BUCKET_NAME } = process.env

module.exports = class S3Adapter {
  constructor() {
    this.client = new S3Client({ region: process.env.REGION })
    this.Bucket = BUCKET_NAME
  }

  async saveProfilePhoto({ file, userId }) {
    console.log('saving profile picture', { file })

    const profilePicture = await sharp(file.content)
      .withMetadata()
      .resize(100, 100, {
        kernel: sharp.kernel.cubic,
        fit: 'cover',
      })
      .webp({ quality: 100 })
      .toBuffer()
    const fileName = `${userId}/profilePicture.webp`
    return await this.save({ file: profilePicture, fileName })
  }

  async saveEventPhoto({ file, eventId, picId }) {
    console.log('S# save photo adapter:', { file, eventId, picId })
    const width = 350
    const profilePicture = await sharp(file.content)
      .withMetadata()
      .resize({ width })
      .webp()
      .toBuffer()
    const fileName = `${eventId}/${picId}.webp`
    return await this.save({ file: profilePicture, fileName })
  }

  async save({ file, fileName }) {
    console.log('saving file', fileName)

    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Body: file,
      Key: fileName,
    })

    await this.client.send(command)

    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
  }
}
