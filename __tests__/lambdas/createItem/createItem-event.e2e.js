const { default: axios } = require('axios')

// axios.defaults.baseURL = ``

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

    // WHEN
    const actual = await axios.post('http://localhost:3000/item', payload)

    // THEN
    expect(actual.status).toBe(201)
  })
})
