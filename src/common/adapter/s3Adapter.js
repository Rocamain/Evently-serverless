// On some platforms, including glibc-based Linux, the main thread must call require('sharp') before worker threads are created.
// This is to ensure shared libraries remain loaded in memory until after all threads are complete.
// https://sharp.pixelplumbing.com/install#worker-threads
require('sharp')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')

const { BUCKET_NAME } = process.env

module.exports = class S3Adapter {
  constructor() {
    this.client = new S3Client({ region: process.env.REGION })
  }

  async save(Bucket, { file, id, name }) {
    const width = 300
    console.log('saving file')

    const filename = name
    const resizeScreen = await sharp(file.content)
      .resize(width, 200)
      .withMetadata()
      .webp()
      .toBuffer()

    const Key = `${id}/${filename}.webp`

    const command = new PutObjectCommand({
      Bucket,
      Body: resizeScreen,
      Key,
    })

    await this.client.send(command)
    console.log('file saved!')
    return {
      link: `https://${BUCKET_NAME}.s3.amazonaws.com/${Key}`,
    }
  }
}
