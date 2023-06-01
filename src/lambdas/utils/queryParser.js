const generateDate = require('../../common/entity/utils/generateDate')

module.exports = (params) => {
  const acceptedQueries = [
    'includePast',
    'exclusiveStartKey',
    'eventCategory',
    'limit',
    'fromDate',
    'toDate',
    'searchWords',
    'maxPrice',
  ]

  const query = {}

  Object.keys(params).forEach((key) => {
    if (acceptedQueries.includes(key)) {
      switch (key) {
        case 'fromDate':
        case 'toDate': {
          const date = params[key]
          query[key] = generateDate(date, '00:00')
          break
        }
        case 'limit':
        case 'maxPrice':
          query[key] = Number(params[key])
          break
        case 'exclusiveStartKey':
          query[key] = JSON.parse(params[key])
          break
        case 'includePast':
          query[key] = params[key] === 'true'
          break
        default:
          query[key] = params[key]
      }
    }
  })

  return query
}
