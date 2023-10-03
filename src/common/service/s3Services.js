const S3Adapter = require('../adapter/s3Adapter')

module.exports = class S3Service {
  constructor() {
    this.S3Adapter = new S3Adapter()
  }

  async saveEventPictures({ files, eventId }) {
    // try {
    const response = await Promise.all(
      files.map((file, index) =>
        this.S3Adapter.saveEventPhoto({
          file,
          eventId,
          picId: `EventPicture${index + 1}`,
        }),
      ),
    )

    return response
    // } catch (error) {
    //   console.log('service photo error', error)
    //   throw error
    // }
  }

  async saveFile({ type, files, id }) {
    // const { IS_OFFLINE } = process.env

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

    // if (!IS_OFFLINE) {
    try {
      const response = await Promise.all(
        files.map((file, index) =>
          this.S3Adapter.saveEventPhoto({
            file,
            id,
            picId: `${type} ${index}`,
          }),
        ),
      )

      return response
    } catch (error) {
      console.log('service photo error', error)
      throw error
    }
    // }
    // return []
  }
}
