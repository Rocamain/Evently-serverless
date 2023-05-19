module.exports = ({ pastBookings, field, value }) => {
  const FIVE_MINUTES = 300000
  const expression =
    pastBookings === true
      ? '#field = :value'
      : '#field = :value AND #field2 >= :value2'

  const expressionAttributeNames =
    pastBookings === true
      ? {
          '#field': field,
        }
      : {
          '#field': field,
          '#field2': 'eventDateAndTime',
        }

  const expressionAttributeValues =
    pastBookings === true
      ? {
          ':value': value,
        }
      : {
          ':value': value,
          ':value2': new Date(
            new Date().getTime() + FIVE_MINUTES,
          ).toISOString(),
        }
  return { expression, expressionAttributeNames, expressionAttributeValues }
}
