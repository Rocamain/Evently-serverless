const parser = require('lambda-multipart-parser')

function formDataParser() {
  const formDataParserBefore = async ({ event, context }) => {
    try {
      console.log('Parsing Body') // Log the event to see its structure

      const { files, data } = await parser.parse(event)

      const itemData = JSON.parse(data)

      event.body = { files, data: itemData }
    } catch (err) {
      console.log('FormDataParser Error:', err)
      const error = new Error('Parsing Exception')
      error.message = 'Error on parsing'

      throw error
    }
  }

  return {
    before: formDataParserBefore,
  }
}

module.exports = formDataParser
