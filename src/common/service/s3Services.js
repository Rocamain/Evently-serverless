const S3Adapter = require('../adapter/s3Adapter')

const { BUCKET_NAME } = process.env
module.exports = class S3Service {
  constructor(s3Adapter) {
    this.S3Adapter = s3Adapter || new S3Adapter()
    this.Bucket = BUCKET_NAME
  }

  async saveFile({ files, id }) {
    const { IS_OFFLINE } = process.env

    // due to limitation of number of requests to AWS, on development will not make a call to the service
    if (files.length === 0 || !id) {
      const message = !id ? 'id is required' : 'photo file is required'
      return {
        statusCode: 400,
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message,
        }),
      }
    }

    if (!IS_OFFLINE) {
      try {
        const response = await Promise.all(
          files.map((file, index) =>
            this.S3Adapter.save(this.Bucket, {
              file,
              id,
              name: `photo ${index}`,
            }),
          ),
        )

        return response
      } catch (error) {
        console.log('service photo', error)
        throw error
      }
    }
    return []
  }
}
