const generateDate = require('../../common/entity/utils/generateDate')

module.exports = (headers) => {
  const acceptedQueries = [
    'pastBookings',
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
  Object.keys(headers).forEach((key) => {
    if (acceptedQueries.includes(key)) {
      if (key === 'fromDate' || key === 'toDate') {
        const date = JSON.parse(headers[key])

        query[key] = generateDate(date, '00:00')
      } else {
        query[key] = JSON.parse(headers[key])
      }
    }
  })

  return query
}
