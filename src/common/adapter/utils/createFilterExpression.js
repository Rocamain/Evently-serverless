const RADIUS_OF_EARTH = 3959 // in miles

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function calculateBoundingBox(latitude, longitude, radiusMiles = 25) {
  latitude = parseFloat(latitude)
  longitude = parseFloat(longitude)

  const lat = degreesToRadians(latitude)

  const latRadius = radiusMiles / RADIUS_OF_EARTH
  const minLat = latitude - (latRadius * 180) / Math.PI
  const maxLat = latitude + (latRadius * 180) / Math.PI

  const lonRadius = Math.asin(Math.sin(latRadius) / Math.cos(lat))
  const minLon = longitude - (lonRadius * 180) / Math.PI
  const maxLon = longitude + (lonRadius * 180) / Math.PI

  return {
    minLat: parseFloat(minLat.toFixed(6)),
    maxLat: parseFloat(maxLat.toFixed(6)),
    minLon: parseFloat(minLon.toFixed(6)),
    maxLon: parseFloat(maxLon.toFixed(6)),
  }
}

module.exports = ({
  includePast = false,
  eventCategory,
  fromDate,
  toDate,
  searchWords,
  maxPrice,
  value,
  field,
  radius,
  latitude,
  longitude,
}) => {
  let filterExpression = ''
  let expression = '#field = :value'
  const expressionAttributeNames = {
    '#field': field,
  }
  const expressionAttributeValues = {
    ':value': value,
  }

  // Date filtering conditions
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

  // Event category filtering
  if (eventCategory) {
    filterExpression += ' #field3 = :value3'
    expressionAttributeNames['#field3'] = 'eventCategory'
    expressionAttributeValues[':value3'] = eventCategory
  }

  // Max price filtering
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

  // Search words filtering
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

  // Geolocation filtering (50-mile radius)
  if (latitude && longitude) {
    const { minLat, maxLat, minLon, maxLon } = calculateBoundingBox(
      latitude,
      longitude,
      radius,
    )

    // Corrected this line: removed the colon (:) after the attribute name
    const latLonExpression = `#eventLocationLat BETWEEN :minLat AND :maxLat AND #eventLocationLng BETWEEN :minLon AND :maxLon`
    console.log({ latitude, longitude, minLat, maxLat, minLon, maxLon })
    expressionAttributeNames['#eventLocationLat'] = 'eventLocationLat'
    expressionAttributeNames['#eventLocationLng'] = 'eventLocationLng'
    expressionAttributeValues[':minLat'] = minLat
    expressionAttributeValues[':maxLat'] = maxLat
    expressionAttributeValues[':minLon'] = minLon
    expressionAttributeValues[':maxLon'] = maxLon

    if (filterExpression === '') {
      filterExpression = latLonExpression
    } else {
      filterExpression += ` AND ${latLonExpression}`
    }
  }

  return {
    expression,
    expressionAttributeNames,
    expressionAttributeValues,
    filterExpression,
  }
}
