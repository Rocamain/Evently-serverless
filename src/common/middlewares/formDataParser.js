const parser = require('lambda-multipart-parser')

function formDataParser() {
  const formDataParserBefore = async ({ event, context }) => {
    try {
      const { files, data } = await parser.parse(event)

      const itemData = JSON.parse(data)

      event.body = { files, data: itemData }
    } catch (err) {
      const error = {}
      error.name = 'Parsing Exception'
      error.message = 'Error on parsing'

      throw error
    }
  }

  return {
    before: formDataParserBefore,
  }
}

module.exports = formDataParser
