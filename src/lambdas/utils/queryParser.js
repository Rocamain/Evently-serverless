const generateDate = require('../../common/entity/utils/generateDate')
const { ACCEPTED_QUERIES } = require('../../constants/constants')
module.exports = (params) => {
  const query = {}

  const paramsChecked = createExclusiveStartKey(params)

  Object.keys(paramsChecked).forEach((key) => {
    if (ACCEPTED_QUERIES.includes(key)) {
      switch (key) {
        case 'fromDate':
        case 'toDate': {
          const date = paramsChecked[key]
          query[key] = generateDate(date, '00:00')

          break
        }
        case 'limit':
        case 'maxPrice':
          query[key] = Number(paramsChecked[key])
          break

        case 'includePast':
          query[key] = paramsChecked[key] === 'true'
          break
        default:
          query[key] = paramsChecked[key]
      }
    }
  })

  return query
}

const createExclusiveStartKey = (params) => {
  const LAST_KEYS = [
    'lastPK',
    'lastEventDateAndTime',
    'lastUserId',
    'lastEventOwnerId',
  ]

  params.exclusiveStartKey = {}
  Object.keys(params).forEach((key) => {
    if (LAST_KEYS.includes(key)) {
      if (key === 'lastPK') {
        params.exclusiveStartKey.PK = params[key]
        delete params.PK
      } else {
        const firstChar = key[4].toLowerCase()
        const newKey = firstChar + key.substring(5)

        params.exclusiveStartKey[newKey] = params[key]
        delete params[key]
      }
    }
  })

  if (Object.keys(params.exclusiveStartKey).length === 0) {
    delete params.exclusiveStartKey
  }

  return params
}
