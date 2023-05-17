const customErrors = () => {
  const customErrors = async ({ error }) => {
    if (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        error = {}
        error.name = 'Conditional check failed exception'
        error.message = 'Entry already exist'
      }
      return { statusCode: 400, body: JSON.stringify({ error }) }
    }
  }

  return {
    onError: customErrors,
  }
}

module.exports = customErrors
