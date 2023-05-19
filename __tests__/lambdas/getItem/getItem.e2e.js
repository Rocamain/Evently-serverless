const { default: axios } = require('axios')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('getItem function', () => {
  const event = {}
  const booking = {}

  // FIRST WE CREATE SOME ITEMS TO LATER DO A GET REQUEST

  test('should respond with statusCode 201 to correct request item Event', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: 'get_Item_Owner_id_1',
      eventOwnerName: 'Owner_Name_getItem',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com',
    }

    // WHEN
    const { status, data } = await axios.post(`${API_BASE_URL}/item`, payload)

    const response = data.data
    event.data = response

    // THEN
    expect(status).toBe(201)
  })
  test('should respond with statusCode 200 to correct request item Event by Id ', async () => {
    // GIVEN

    const { status, data } = await axios.get(
      `${API_BASE_URL}/item/${event.data.eventId}`,
    )
    // WHEN

    const response = data.data

    // THEN
    expect(status).toBe(200)
    expect(response).toEqual(event.data)
  })
  test('should respond with statusCode 200 to correct request item by Id that does not exist', async () => {
    // GIVEN

    const { status, data } = await axios.get(`${API_BASE_URL}/item/notId`)
    // WHEN

    const response = data.data

    // THEN
    expect(status).toBe(200)
    expect(response).toEqual({})
  })

  test('should respond with statusCode 201 to correct request item Booking', async () => {
    // GIVEN

    const payloadBooking = {
      type: 'booking',
      userId: 'userId_1',
      userName: '2',
      userEmail: 'userId_1@fakeemail.com',
      eventId: event.data.eventId,
    }

    // WHEN
    const { status, data } = await axios.post(
      `${API_BASE_URL}/item`,
      payloadBooking,
    )

    booking.data = data.data

    // THEN
    expect(status).toBe(201)
  })
  test('should respond with statusCode 200 to correct request item Booking by Id ', async () => {
    // GIVEN

    const { status, data } = await axios.get(
      `${API_BASE_URL}/item/${booking.data.bookingId}`,
    )
    // WHEN

    const response = data.data

    // THEN
    expect(status).toBe(200)
    expect(response).toEqual(booking.data)
  })
})
