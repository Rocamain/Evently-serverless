const httpJsonBodyParser = require('@middy/http-json-body-parser')
const middy = require('@middy/core')
const jwt = require('aws-jwt-verify')

const response = {
  statusCode: 200,
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Credentials': true,
  },
}
const handler = async (event, context) => {
  console.log('event', event)
  console.log('event body', event.body)
  const { token, userPoolId, clientId } = event.body

  const { USER_POOL_ID, CLIENT_ID } = process.env
  if (!token || userPoolId !== USER_POOL_ID || clientId !== CLIENT_ID) {
    response.body = JSON.stringify({ verified: false })
    return response
  } else {
    const verifier = jwt.CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId,
    })

    try {
      await verifier.verify(token)
      response.body = JSON.stringify({ verified: true })

      return response
    } catch (error) {
      response.body = JSON.stringify({ verified: false })
      response.statusCode = 401
      return response
    }
  }
}

module.exports.handler = middy().use(httpJsonBodyParser()).handler(handler)
