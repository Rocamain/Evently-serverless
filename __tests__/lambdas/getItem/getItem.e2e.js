const { default: axios } = require('axios')
const { eventRequest, bookingRequest } = require('../utils/request')
const eventPayload = require('../utils/eventPayload')
const generateDate = require('../../../src/common/service/utils/generateDate')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`
let event = {}
let booking = {}
describe('getItem function', () => {
  // FIRST WE CREATE SOME ITEMS TO LATER DO A GET REQUEST

  test('should respond with statusCode 201 to correct request item Event', async () => {
    // GIVEN
    const payload = { ...eventPayload }

    //WHEN

    const response = await eventRequest(payload, API_BASE_URL)
    const { status, data } = response
    const { createdAt, eventId, userId, ...responseData } = data.data

    event = data.data
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
  test('should respond with statusCode 200 to correct request item Event by Id ', async () => {
    // GIVEN

    const { status, data } = await axios.get(
      `${API_BASE_URL}/item/${event.eventId}-event`,
    )
    // WHEN
    const eventData = data.data

    // THEN
    expect(status).toBe(200)
    expect(eventData).toEqual(event)
  })
  test('should respond with statusCode 200 to correct request item by Id that does not exist', async () => {
    // GIVEN

    const { status, data } = await axios.get(`${API_BASE_URL}/item/notId`)
    // WHEN

    const response = data.data

    // THEN
    expect(status).toBe(200)
    expect(response).toEqual({ items: [], count: 0 })
  })

  test('should respond with statusCode 201 to correct request item Booking', async () => {
    // GIVEN

    const payloadBooking = {
      type: 'booking',
      userId: 'userId_1',
      userName: '2',
      userEmail: 'userId_1@fakeemail.com',
      eventId: event.eventId,
    }

    // WHEN
    const { status, data } = await bookingRequest(payloadBooking, API_BASE_URL)

    booking = data.data

    // THEN
    expect(status).toBe(201)
  })
  test('should respond with statusCode 200 to correct request item Booking by Id ', async () => {
    // GIVEN
    console.log({
      booking,
      a: `${API_BASE_URL}/item/${booking.bookingId}-${booking.userId}`,
    })
    const { status, data } = await axios.get(
      `${API_BASE_URL}/item/${booking.bookingId}-${booking.userId}`,
    )

    // WHEN

    const bookingData = data.data

    // THEN
    expect(status).toBe(200)
    expect(bookingData).toEqual(booking)
  })
})
