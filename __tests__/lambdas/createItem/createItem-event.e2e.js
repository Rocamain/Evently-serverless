process.env.NODE_ENV = 'test'
const { readFileSync } = require('node:fs')
const generateDate = require('../../../src/common/service/utils/generateDate')
const { eventRequest, bookingRequest } = require('../utils/request')
const eventPayload = require('../utils/eventPayload')
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

const event = {}
describe('createItem function', () => {
  test('should respond with statusCode 201 to correct request item Event', async () => {
    // GIVEN
    const payload = { ...eventPayload }

    //WHEN

    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response

    const { createdAt, eventId, userId, ...responseData } = data.data
    event.eventId = eventId

    event.eventDateAndTime = responseData.eventDateAndTime
    event.eventOwnerName = responseData.eventOwnerName
    event.eventOwnerId = responseData.eventOwnerId
    event.eventOwnerName = responseData.eventOwnerName
    event.eventOwnerId = responseData.eventOwnerId
    event.eventTitle = responseData.eventTitle
    event.eventCategory = responseData.eventCategory
    event.eventOwnerId = responseData.eventOwnerId
    event.eventLocationId = responseData.eventLocationId
    delete payload.eventPictures
    payload.eventPictures = ['placeholder_picture-1']

    payload.eventDateAndTime = generateDate(
      payload.eventDate,
      payload.eventTime,
    )
    delete payload.eventDate
    delete payload.eventTime

    // THEN
    expect(status).toBe(201)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
    expect(responseData).toEqual(payload)
    expect(typeof eventId).toBe('string')
    expect(userId).toBe('event')
  })
  test('should respond with statusCode 201 to correct request item Booking', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'create_Item_Owner_Id_userId_1',
      userName: 'John Doe',
      userEmail: 'user_id_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN
    const { status, data } = await bookingRequest(payload, API_BASE_URL)
    const {
      type,
      userId,
      userName,
      userEmail,
      bookingId,
      createdAt,
      eventId,
      eventDateAndTime,
      eventTitle,
      eventOwnerId,
      eventOwnerName,
      eventCategory,
      eventLocationId,
    } = data.data

    // THEN
    expect(status).toBe(201)
    expect(userId).toBe(payload.userId)
    expect(userName).toBe(payload.userName)
    expect(userEmail).toBe(payload.userEmail)
    expect(type).toBe('booking')
    expect(typeof bookingId).toBe('string')
    expect(eventId).toBe(event.eventId)
    expect(eventDateAndTime).toBe(event.eventDateAndTime)
    expect(eventOwnerId).toBe(event.eventOwnerId)
    expect(eventLocationId).toBe(event.eventLocationId)
    expect(eventOwnerName).toBe(event.eventOwnerName)
    expect(eventTitle).toBe(event.eventTitle)
    expect(eventCategory).toBe(event.eventCategory)
    expect(new Date(createdAt)).toBeInstanceOf(Date)
  })

  // ERRORS ON BOOKING.

  test('should respond with statusCode 400 to incorrect request item Booking that already exist', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'create_Item_Owner_Id_userId_1',
      userName: 'John Doe',
      userEmail: 'user_id_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN

    const { status, data } = await bookingRequest(payload, API_BASE_URL)

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
    const { status, data } = await bookingRequest(payload, API_BASE_URL)
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
      // type property not added Error here
      userId: 'userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: 'event.eventId',
    }

    // WHEN
    const { status, data } = await bookingRequest(payload, API_BASE_URL)

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
      type: 'not accepted type', // Error here
      userId: 'userId_1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: 'event.eventId',
    }

    // WHEN
    const { status, data } = await bookingRequest(payload, API_BASE_URL)

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
  test('should respond with statusCode 400 to incorrect request item Booking, missing userId', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      // Missing propery userId Error here
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN

    const { status, data } = await bookingRequest(payload, API_BASE_URL)

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: "must have required property 'userId'.",
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request item Booking, eventId missing', async () => {
    // GIVEN

    const payload = {
      type: 'booking',
      userId: 'user_id 1',
      userName: 'John Doe',
      userEmail: 'userId_1@fakeemail.com',
      // eventId property not added Error here
    }

    // WHEN

    const { status, data } = await bookingRequest(payload, API_BASE_URL)

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: "must have required property 'eventId'.",
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, empty payload', async () => {
    // GIVEN
    const payload = {}

    // WHEN
    const { status, data } = await bookingRequest(payload, API_BASE_URL)

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        name: 'UnsupportedMediaTypeError',
        message: 'Invalid or malformed multipart/form-data was provided',
      },
    })
  })

  test('should respond with statusCode 400 to incorrect request, Type not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    // Error on uploading a non webp extiention picture
    payload.eventPictures = {
      buffer: Buffer.from(
        readFileSync(
          '__tests__/lambdas/utils/image/event_jpg_image.jpg',
          (err, data) => {
            if (err) throw err
            return data
          },
        ),
      ),
      fileName: 'event_jpg_image.jpg',
    }

    // WHEN
    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response

    //THEN
    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message:
          'eventPictures/0/mimetype must be equal to one of the allowed values: image/webp.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventOwnerId not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    delete payload.eventOwnerId
    // WHEN
    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response

    //THEN
    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: "must have required property 'eventOwnerId'.",
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventOwnerEmail not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    payload.eventOwnerEmail = 'javierfakeemail.com'
    // WHEN
    const { status, data } = await eventRequest(payload, API_BASE_URL)

    // THEN
    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventOwnerEmail, must match format email.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventDate not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    payload.eventDate = '2030/23/15'

    // WHEN
    const { status, data } = await eventRequest(payload, API_BASE_URL)

    // THEN

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventDate must match format YYYY/MM/DD.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventTime not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    payload.eventTime = '25:45'
    // WHEN
    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventTime must match format HH:MM.',
        name: 'ValidationException',
      },
    })
  })
  test('should respond with statusCode 400 to incorrect request, eventPrice not valid', async () => {
    // GIVEN
    const payload = { ...eventPayload }
    payload.eventPrice = true
    // WHEN
    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response
    console.log(data)

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
    const payload = { ...eventPayload }
    payload.eventLink = 'website.com'

    // WHEN
    const response = await eventRequest(payload, API_BASE_URL)

    const { status, data } = response

    expect(status).toBe(400)
    expect(data).toEqual({
      error: {
        message: 'eventLink, must match format uri.',
        name: 'ValidationException',
      },
    })
  })
})
