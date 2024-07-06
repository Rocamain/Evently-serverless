const { KEYS_TO_REMOVE } = require('../../../constants/constants')

const sanitizeData = (data) => {
  // Convert eventPrice to a number if it exists
  if (data.type === 'event') {
    if (data.eventPrice) {
      console.log(data.eventPrice)
      data.eventPrice = parseFloat(data.eventPrice)
      console.log(data.eventPrice)
    }
    // Convert eventPhotos to an array if it receives only one photo.
    if (!Array.isArray(data.eventPictures)) {
      console.log({ eventPictures: data.eventPictures })
      data.eventPictures = [data.eventPictures]
    }
  }

  // Remove unwanted keys
  KEYS_TO_REMOVE.forEach((key) => delete data[key])
}

module.exports = sanitizeData
