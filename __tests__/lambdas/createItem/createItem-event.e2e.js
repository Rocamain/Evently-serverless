const { default: axios } = require('axios')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('createItem function', () => {
  test('should respond with statusCode 200 to correct request', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
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

    const { eventId, createdAt, ...response } = data.data

    // THEN
    expect(status).toBe(201)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
    expect(createdAt).toBe(new Date(createdAt).toISOString())
    expect(response).toEqual(response)
    expect(eventId).toContain('-event')
  })
})
