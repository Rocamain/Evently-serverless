const FormData = require('form-data')
const { default: axios } = require('axios')

const eventRequest = async (payload, apiUrl) => {
  const formData = new FormData()
  try {
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'eventPictures') {
        formData.append(key, `${value}`)
      } else {
        formData.append('eventPictures', value.buffer, value.fileName)
      }
    })

    const response = await axios.post(`${apiUrl}/item`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response
  } catch (err) {
    if (err.response) {
      return err.response
    }

    return err
  }
}
const bookingRequest = async (payload, apiUrl) => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value)
  })
  try {
    const response = await axios.post(`${apiUrl}/item`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response
  } catch (err) {
    if (err.response) {
      return err.response
    }

    return err
  }
}

module.exports = { eventRequest, bookingRequest }
