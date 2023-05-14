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
      eventDescription: 'This is test 1 event',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'hpps://webste.com',
    }

    console.log({ API_BASE_URL })
    // WHEN
    const actual = await axios.post(`${API_BASE_URL}/item`, payload)

    console.log(actual)
    // THEN
    expect(actual.status).toBe(201)
  })
})
