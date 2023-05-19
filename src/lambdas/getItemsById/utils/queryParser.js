module.exports = ({ pastBookings, exclusiveStartKey, limit }) => {
  const query = {}

  if (pastBookings) {
    query.pastBookings = JSON.parse(pastBookings)
  }
  if (exclusiveStartKey) {
    query.exclusiveStartKey = JSON.parse(exclusiveStartKey)
  }
  if (limit) {
    query.limit = JSON.parse(limit)
  }

  return query
}
