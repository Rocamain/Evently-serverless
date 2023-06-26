const getSchema = require('../entity/utils/getSchema')
const validateSchema = require('./utils/validateSchema')

const paramsValidator = () => {
  const paramsValidatorBefore = async ({ event, context }) => {
    const data = event.queryStringParameters

    const schema = getSchema('query')
    const isByUser = event.rawPath.includes('byUser')

    if (isByUser) {
      delete schema.lastEventOwnerId
    }

    return validateSchema(data, schema)
  }
  return {
    before: paramsValidatorBefore,
  }
}
module.exports = paramsValidator
