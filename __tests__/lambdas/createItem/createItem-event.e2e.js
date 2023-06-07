const { default: axios } = require('axios')
const FormData = require('form-data')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('createItem function', () => {
  const event = {}
  test('should respond with statusCode 201 to correct request item Event', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: 'create_Item_Owner_Id',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com',
    }
    const form = new FormData()
    form.append('data', JSON.stringify(payload))
    // WHEN
    const { status, data } = await axios.post(`${API_BASE_URL}/item`, form)

    const { eventId, createdAt, ...response } = data.data
    event.eventId = data.data.eventId.split('-')[0]

    // THEN

    expect(status).toBe(201)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
    expect(createdAt).toBe(new Date(createdAt).toISOString())
    expect(response).toEqual(response)
    expect(eventId).toContain('-event')
  })
  test('should respond with statusCode 201 to correct request item Booking', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'create_Item_Owner_Id_userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))
    const { status, data } = await axios.post(`${API_BASE_URL}/item`, form)

    const { createdAt } = data.data

    // THEN
    expect(status).toBe(201)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
  })

  // ERRORS ON BOOKING.

  test('should respond with statusCode 400 to incorrect request item Booking that already exist', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'create_Item_Owner_Id_userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)

    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'Entry already exist',
        name: 'ConditionalCheckFailedException',
      },
    })
  })

  test('should respond with statusCode 400 to incorrect request item Booking for event that does not exist', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: "I don't exist",
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'Event does not exist',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request item Booking, Missing Type', async () => {
    // GIVEN

    const payload = {
      // Error here
      userId: 'userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: "I don't exist",
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: "must have required property 'type'.",
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request item Booking, Type not valid', async () => {
    // GIVEN

    const payload = {
      type: '', // Error here
      userId: 'userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: "I don't exist",
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message:
          'type must be equal to one of the allowed values: event, booking.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request item Booking, userId not valid', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: true, // Error here
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: "I don't exist",
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'userId, must be string.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request item Booking, eventId not valid', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'user_id 1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: 111, // Error here
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventId, must be string.',
        name: 'ValidationException',
      },
    })
  })

  // ERRORS ON EVENT.

  test('should respond with statusCode 400 to incorrect request, Missing Type', async () => {
    // GIVEN
    const payload = {}

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: "must have required property 'type'.",
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, Type not valid', async () => {
    // GIVEN
    const payload = {
      type: 'evnt', // Error here
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
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message:
          'type must be equal to one of the allowed values: event, booking.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventOwnerId not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: 2, // Error here
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)

      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventOwnerId, must be string.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventOwnerEmail not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javierfakeemail.com', // Error here
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'must match format email.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventDate not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '41-05-2023', // Error here
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://website.com',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'must match format DD-MM-YYYY.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventTime not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '21-05-2023',
      eventTime: '25:55', // Error here
      eventPrice: 1,
      eventLink: 'https://website.com',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'must match format HH:MM.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventPrice not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventLocation: 'Online',
      eventCategory: 'other',
      eventDate: '21-05-2023',
      eventTime: '22:55',
      eventPrice: false, // Error here
      eventLink: 'https://website.com',
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventPrice, must be number.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventLink not valid', async () => {
    // GIVEN
    const payload = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '21-05-2023',
      eventTime: '22:55',
      eventPrice: false,
      eventLink: 'website.com', // Error here
    }

    // WHEN
    const form = new FormData()
    form.append('data', JSON.stringify(payload))

    const { response } = await axios
      .post(`${API_BASE_URL}/item`, form)
      .catch((err) => err)
    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventPrice, must be number.',
        name: 'ValidationException',
      },
    })
  })
})
