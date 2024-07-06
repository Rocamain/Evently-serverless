const middy = require('@middy/core')
const httpErrorHandler = require('@middy/http-error-handler')
const EntityService = require('../../common/service/entityService')
const bodyValidation = require('../../common/middlewares/requestBodyValidator')
const multipartBodyParser = require("@middy/http-multipart-body-parser");
const customErrors = require('../../common/middlewares/customError')
const S3Service = require('../../common/service/s3Services')
const queryParser = require('../utils/queryParser')

const handler = async (event, context) => {
  console.log(`Starting Lambda function ${context.functionName}`)

  const {
    //  files,
    data,
  } = event.body
  // const { IS_OFFLINE } = process.env

  data.id = event.pathParameters.id.split('-')[0]

  const myEntityService = new EntityService()

  const { id } = event.pathParameters

  // data.eventPhotos = []
  // due to limitation of number of requests to AWS, on development will not make a call to the service
  // if (!IS_OFFLINE && data.eventPhotos.length > 0) {
  //   const s3Service = new S3Service()

  //   const eventPhotos = await s3Service.saveFile({
  //     files,
  //     id: data.id,
  //   })
  //   data.eventPhotos = eventPhotos
  // }

  const response = await myEntityService.update(data, id)

  return {
    statusCode: 202,
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
  .use(multipartBodyParser())
  .use(bodyValidation())
  .use(customErrors())
  .use(httpErrorHandler())
  .handler(handler)
