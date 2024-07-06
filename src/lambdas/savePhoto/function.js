const multipartBodyParser = require("@middy/http-multipart-body-parser");
const S3Service = require('../../common/service/s3Services')
const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const customErrors = require('../../common/middlewares/customError')

const handler = async (event, context) => {
  const { files, id } = await parser.parse(event)
  const s3Service = new S3Service()

  const filesData = await s3Service.saveFile({ files, id })

  return filesData
}

module.exports.handler = middy()
  .use(multipartBodyParser)
  .handler(handler)
  .use(customErrors())
  .use(httpErrorHandler())
