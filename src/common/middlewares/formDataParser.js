const parser = require('lambda-multipart-parser')

function formDataParser() {
  const formDataParserBefore = async ({ event, context }) => {
    console.log('Parsing Body') // Log the event to see its structure
    if (context.functionName.includes('create-item')) {
      try {
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
    if (context.functionName.includes('join')) {
      const body = await parser.parse(event)

      event.body = { ...body }
    }
  }
  return {
    before: formDataParserBefore,
  }
}

module.exports = formDataParser
