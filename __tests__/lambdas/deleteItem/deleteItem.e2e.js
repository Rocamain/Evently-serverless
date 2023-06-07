const { default: axios } = require('axios')
const FormData = require('form-data')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('deleteItem function', () => {
  const event = {}
  const firstBooking = {}

  test('should respond with statusCode 201 to correct request item Event', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '1',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 1',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2030',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com/Event_1',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { status, data } = await axios.post(`${API_BASE_URL}/item`, form)

    const { eventId, createdAt, ...response } = data.data
    event.eventId = data.data.eventId
    event.eventOwnerId = data.data.eventOwnerId.split('-')[0]

    // THEN
    expect(status).toBe(201)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
    expect(createdAt).toBe(new Date(createdAt).toISOString())
    expect(response).toEqual(response)
    expect(eventId).toContain('-event')
  })
  test('should respond with statusCode 201 to correct create request item booking, and 27 bookings to that event', async () => {
    // GIVEN
    const [eventId] = event.eventId.split('-')
    const payload = {
      type: 'booking',
      userId: undefined,
      userName: undefined,
      userEmail: 'userId_1@fakeemail.com',
      eventId,
    }

    // WHEN

    const bookings = new Array(27).fill().map((_, i) => {
      const booking = { ...payload } // Create a new object with the same properties as payload
      booking.userId = 'id_' + (i + 1) // Update the userId property for each element
      booking.userName = 'name_' + (i + 1) // Update the userName property for each element
      return booking
    })

    const bookingsResponse = await Promise.all(
      bookings.map((bookingPayload) => {
        const form = new FormData()
        form.append('data', JSON.stringify(bookingPayload))
        return axios.post(`${API_BASE_URL}/item`, form)
      }),
    )

    firstBooking.data = bookingsResponse[0].data.data

    // THEN
    bookingsResponse.forEach((booking) => {
      const { data, status } = booking

      const { bookingId, userId, eventId } = data.data

      expect(status).toBe(201)
      expect(bookingId).toBe(`${eventId}-${userId}`)
    })
  })
  test('should pass with statuscode 203 for a delete request of booking and 203 deleteBatch of an event and all bookings of that event ', async () => {
    // WHEN

    const { data: dataByOwnerId } = await axios.get(
      `${API_BASE_URL}/items/byOwner/${event.eventOwnerId}`,
      {
        params: { limit: 30 },
      },
    )

    const { data: deleteBookingOneData, status: deleteBookingOneStatus } =
      await axios.delete(`${API_BASE_URL}/item/${firstBooking.data.bookingId}`)
    const { data: dataByOwnerIdAfterData, status: dataByOwnerIdAfterStatus } =
      await axios.delete(`${API_BASE_URL}/item/${event.eventId}`)
    const { data: dataByOwnerIdAfter } = await axios.get(
      `${API_BASE_URL}/items/byOwner/${event.eventOwnerId}`,
      {
        params: { limit: 30 },
      },
    )

    expect(deleteBookingOneStatus).toBe(203)
    expect(deleteBookingOneData.data.message).toBe('Item deleted')
    expect(dataByOwnerId.data.length).toBe(28)
    expect(dataByOwnerIdAfterStatus).toBe(203)
    expect(dataByOwnerIdAfterData.data.message).toBe('Items deleted')
    expect(dataByOwnerIdAfter.data.length).toBe(0)
  })
})
