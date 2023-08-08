const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const bodyValidation = require('../../common/middlewares/requestBodyValidator')
const formDataParser = require('../../common/middlewares/formDataParser')
const customErrors = require('../../common/middlewares/customError')
const S3Service = require('../../common/service/s3Services')
const generateId = require('../../common/entity/utils/generateId')

const myEntityService = new EntityService()

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const { files, data } = event.body
  const { IS_OFFLINE } = process.env
  if (data.type === 'event') {
    data.id = generateId()
  }
  data.eventPhotos = []
  // due to limitation of number of requests to AWS, on development will not make a call to the service
  if (!IS_OFFLINE) {
    const s3Service = new S3Service()

    const eventPhotos = await s3Service.saveFile({
      files,
      id: data.id,
    })
    data.eventPhotos = eventPhotos
  }

  const response = await myEntityService.create(data)

  return {
    statusCode: 201,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response),
  }
}

module.exports.handler = middy()
  .use(formDataParser())
  .use(bodyValidation())
  .use(customErrors())
  .use(httpErrorHandler())
  .handler(handler)
