const customErrors = () => {
  const createErrorResponse = async ({ error }) => {
    if (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        error.message = 'Entry already exist'
      }

      const errorResponse = new ErrorResponse(error)

      return errorResponse
    }
  }

  return {
    onError: createErrorResponse,
  }
}

module.exports = customErrors

class ErrorResponse {
  constructor({ name, message }) {
    this.statusCode = 400
    this.body = JSON.stringify({ error: { name, message } })
  }
}
