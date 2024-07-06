const { default: axios } = require('axios')
const { eventRequest, bookingRequest } = require('../utils/request')
const eventPayload = require('../utils/eventPayload')
const generateDate = require('../../../src/common/service/utils/generateDate')

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

const event = {}

describe('deleteItem function', () => {
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
  test('should respond with statusCode 201 to correct create request item booking, and 27 bookings to that event', async () => {
    // GIVEN
    const { eventId, eventOwnerId } = event

    // WHEN

    const bookings = new Array(27).fill().map((_, i) => {
      const booking = {
        type: 'booking',
        userId: 'user-id-' + (i + 1),
        userName: 'name_' + (i + 1),
        userEmail: `user-id-${i + 1}@fakeemail.com`,
        eventId,
      }

      return booking
    })

    const bookingsResponse = await Promise.all(
      bookings.map((bookingPayload) =>
        bookingRequest(bookingPayload, API_BASE_URL),
      ),
    )

    // THEN
    bookingsResponse.forEach((booking) => {
      const { data, status } = booking

      const { bookingId, userId, eventId } = data.data

      expect(status).toBe(201)
      expect(typeof bookingId).toBe(`string`)
    })
  })
  test('should pass with statuscode 203 for a delete request of booking and 203 deleteBatch of an event and all bookings of that event ', async () => {
    // WHEN
    const { eventOwnerId, eventId } = event
    const {
      data: { data: dataByOwnerId },
    } = await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerId}`, {
      params: { limit: 30 },
    })

    const { data: deleteBookingOneData, status: deleteBookingOneStatus } =
      await axios.delete(
        `${API_BASE_URL}/item/${dataByOwnerId[0].bookingId}${dataByOwnerId[0].userId}`,
      )

    const { data: dataByOwnerIdAfterData, status: dataByOwnerIdAfterStatus } =
      await axios.delete(`${API_BASE_URL}/item/${eventId}-event`)
    const { data: dataByOwnerIdAfter } = await axios.get(
      `${API_BASE_URL}/items/byOwner/${event.eventOwnerId}`,
      {
        params: { limit: 30 },
      },
    )

    expect(deleteBookingOneStatus).toBe(203)
    expect(deleteBookingOneData.data.message).toBe('Item deleted')
    expect(dataByOwnerId.length).toBe(28)
    expect(dataByOwnerIdAfterStatus).toBe(203)
    expect(dataByOwnerIdAfterData.data.message).toBe('Items deleted')
    expect(dataByOwnerIdAfter.data.length).toBe(0)
  })
})
