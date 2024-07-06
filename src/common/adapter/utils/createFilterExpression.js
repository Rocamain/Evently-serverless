module.exports = ({
  includePast = false,
  eventCategory,
  fromDate,
  toDate,
  searchWords,
  maxPrice,
  value,
  field,
}) => {
  let filterExpression = ''
  let expression = '#field = :value'
  const expressionAttributeNames = {
    '#field': field,
  }
  const expressionAttributeValues = {
    ':value': value,
  }
  console.log({
    includePast,
    condition: !includePast || includePast !== 'true' || includePast !== true,
  })
  if (includePast === false) {
    expression = '#field = :value AND #field2 > :value2'
    expressionAttributeNames['#field2'] = 'eventDateAndTime'
    expressionAttributeValues[':value2'] = new Date().toISOString()
  }

  if (fromDate) {
    expression = '#field = :value AND #field2 >= :value2'
    expressionAttributeNames['#field2'] = 'eventDateAndTime'
    expressionAttributeValues[':value2'] = new Date(fromDate).toISOString()

    if (toDate) {
      delete expressionAttributeValues[':value2']
      expression = '#field = :value AND #field2 BETWEEN :fromDate AND :toDate'
      expressionAttributeValues[':fromDate'] = new Date(fromDate).toISOString()
      expressionAttributeValues[':toDate'] = new Date(toDate).toISOString()
    }
  }

  if (!fromDate && toDate) {
    expression = '#field = :value AND #field2 BETWEEN :fromDate AND :value2'

    expressionAttributeValues[':fromDate'] = new Date().toISOString()
    expressionAttributeValues[':value2'] = new Date(toDate).toISOString()
    if (includePast) {
      delete expressionAttributeValues[':fromDate']
      expressionAttributeValues[':value2'] = toDate
      expressionAttributeNames['#field2'] = 'eventDateAndTime'
      expression = '#field = :value AND #field2 <= :value2'
    }
  }

  if (eventCategory) {
    filterExpression += ' #field3 = :value3'
    expressionAttributeNames['#field3'] = 'eventCategory'
    expressionAttributeValues[':value3'] = eventCategory
  }

  if (maxPrice) {
    const maxPriceExpression = '#field4 <= :maxPrice'
    expressionAttributeNames['#field4'] = 'eventPrice'
    expressionAttributeValues[':maxPrice'] = maxPrice

    if (filterExpression === '') {
      filterExpression = maxPriceExpression
    } else {
      filterExpression += ` AND ${maxPriceExpression}`
    }
  }

  if (searchWords && searchWords.length > 0) {
    const searchWordsArray = Array.isArray(searchWords[0])
      ? searchWords
      : [searchWords]

    searchWordsArray.forEach((words, index) => {
      if (words.length === 1) {
        const wordExpression = `contains(eventDescription, :searchWord${index})`
        filterExpression += ` AND ${wordExpression}`
        expressionAttributeValues[`:searchWord${index}`] = words[0]
      } else if (words.length > 1) {
        const wordExpressions = words.map((word, wordIndex) => {
          expressionAttributeValues[`:searchWord${index}${wordIndex}`] = word
          return `contains(eventDescription, :searchWord${index}${wordIndex})`
        })

        const chainExpression = `(${wordExpressions.join(' AND ')})`
        filterExpression += ` AND ${chainExpression}`
      }
    })

    // Remove leading 'AND' from filterExpression
    filterExpression = filterExpression.replace(/^ AND /, '')
  }

  return {
    expression,
    expressionAttributeNames,
    expressionAttributeValues,
    filterExpression,
  }
}
