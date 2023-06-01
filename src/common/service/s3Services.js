const S3Adapter = require('../adapter/s3Adapter')

const { BUCKET_NAME } = process.env
module.exports = class S3Service {
  constructor(s3Adapter) {
    this.S3Adapter = s3Adapter || new S3Adapter()
    this.Bucket = BUCKET_NAME
  }

  async saveFile({ files, userId }) {
    try {
      const response = await Promise.all(
        files.map((file) => this.S3Adapter.save(this.Bucket, { file, userId })),
      )

      return response
    } catch (error) {
      console.log('service', error)
      return { error }
    }
  }
}
