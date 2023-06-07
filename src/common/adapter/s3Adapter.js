const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')

const { BUCKET_NAME } = process.env

module.exports = class S3Adapter {
  constructor() {
    this.client = new S3Client({ region: process.env.REGION })
  }

  async save(Bucket, { file, id }) {
    const width = 600

    try {
      const filename = file.filename.split('.')[0]
      const resizeScreen = await sharp(file.content)
        .resize(width)
        .withMetadata()
        .toFormat('webp')
        .toBuffer()

      const Key = `${id}/${filename}.webp`

      const command = new PutObjectCommand({
        Bucket,
        Body: resizeScreen,
        Key,
      })

      await this.client.send(command)

      return {
        link: `https://${BUCKET_NAME}.s3.amazonaws.com/${Key}`,
      }
    } catch (err) {
      return { error: 'something happened', err }
    }
  }
}
