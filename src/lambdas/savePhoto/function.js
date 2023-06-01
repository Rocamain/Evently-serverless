const parser = require('lambda-multipart-parser')
const S3Service = require('../../common/service/s3Services')

const handler = async (event, context) => {
  try {
    const { files, userId } = await parser.parse(event)
    const s3Service = new S3Service()

    const filesData = await s3Service.saveFile({ files, userId })

    return filesData
  } catch (err) {
    console.log('lambda', { err })
    return err
  }
}

module.exports.handler = handler
