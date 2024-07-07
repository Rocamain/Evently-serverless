const { default: axios } = require('axios')
const { eventRequest, bookingRequest } = require('../utils/request')
const eventPayload = require('../utils/eventPayload')

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('getItemBy function', () => {
  const event = {}
  const pastEvent = {}
  const eventOwnerIdOne = 'get_By_Owner_Id_owner_1'
  const eventOwnerIdtwo = 'get_By_Owner_Id_owner_2'

  // FIRST WE CREATE SOME ITEMS TO LATER DO A GET REQUEST
  describe('getItemBy eventOwnerId', () => {
    test('should respond with statusCode 200 to correct request all items byOwner', async () => {
      // GIVEN

      const payloadEventOne = { ...eventPayload }
      payloadEventOne.eventTitle = '1'
      payloadEventOne.eventOwnerId = eventOwnerIdOne
      payloadEventOne.eventDate = '2030-09-25'

      const payloadEventTwo = { ...eventPayload }
      payloadEventTwo.eventTitle = '2'
      payloadEventTwo.eventDate = '2031-09-25'
      payloadEventTwo.eventOwnerId = eventOwnerIdtwo

      const payloadEventThree = { ...eventPayload }
      payloadEventThree.eventTitle = '3'
      payloadEventThree.eventOwnerId = eventOwnerIdOne
      payloadEventThree.eventDate = '2031-09-25'

      const payloadEventFour = { ...eventPayload }
      payloadEventFour.eventTitle = '4'
      payloadEventFour.eventOwnerId = eventOwnerIdOne
      payloadEventFour.eventDate = '2040-09-25'

      // WHEN

      const responseEventOne = await eventRequest(payloadEventOne, API_BASE_URL)
      console.log({ responseEventOne: responseEventOne.data.stackTrace })
      payloadEventOne.eventPictures = ['placeholder_picture-1']
      event.eventId = responseEventOne.data.data.eventId

      const responseEventTwo = await eventRequest(payloadEventTwo, API_BASE_URL)
      payloadEventTwo.eventPictures = ['placeholder_picture-1']

      const responseEventThree = await eventRequest(
        payloadEventThree,
        API_BASE_URL,
      )
      payloadEventThree.eventPictures = ['placeholder_picture-1']

      const responseEventFour = await eventRequest(
        payloadEventFour,
        API_BASE_URL,
      )
      responseEventFour.eventPictures = ['placeholder_picture-1']

      // I will use this variable later to make booking as i need to have access to eventId, randomly generated

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`)

      const { status: statusByOwnerIdTwo, data: dataByOwnerIdTwo } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdtwo}`)
      dataByOwnerIdOne.data.sort((a, b) => a.eventTitle - b.eventTitle)

      const eventsEventOwnerIdOne = {
        data: [
          { ...responseEventOne.data.data },
          { ...responseEventThree.data.data },
          { ...responseEventFour.data.data },
        ],
      }
      console.log({
        dataByOwnerIdOne: dataByOwnerIdOne.data,
        // eventsEventOwnerIdOne: eventsEventOwnerIdOne.data,
      })

      const eventsEventOwnerIdTwo = {
        data: [{ ...responseEventTwo.data.data }],
      }

      // THEN

      // events created status code
      expect(responseEventOne.status).toBe(201)
      expect(responseEventTwo.status).toBe(201)
      expect(responseEventThree.status).toBe(201)
      expect(responseEventFour.status).toBe(201)

      // query by ownerId status code

      expect(statusByOwnerIdOne).toBe(200)
      expect(statusByOwnerIdTwo).toBe(200)

      // check ownerIdData events vs query
      expect(dataByOwnerIdOne).toEqual(eventsEventOwnerIdOne)
      expect(dataByOwnerIdTwo).toEqual(eventsEventOwnerIdTwo)
    })
    test('should respond with statusCode 200 to correct request alls items byOwner with query in params limit and later make a new request that use exclusiveStartKey (pagination in dynamodb)', async () => {
      // WHEN

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}/`, {
          params: {
            limit: 1,
          },
        })

      const {
        lastEvaluatedKey: { eventOwnerId, PK, userId, eventDateAndTime },
        data: dataOne,
      } = dataByOwnerIdOne

      const { status: statusByOwnerIdTwo, data: dataByOwnerIdTwo } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            limit: 4,
            lastPK: PK,
            lastEventOwnerId: eventOwnerId,
            lastUserId: userId,
            lastEventDateAndTime: eventDateAndTime,
          },
        })

      const { data: dataTwo, lastEvaluatedKey: lastEvaluatedKeyTwo } =
        dataByOwnerIdTwo
      // THEN

      expect(statusByOwnerIdOne).toBe(200)
      expect(dataOne.length).toBe(1)
      expect(statusByOwnerIdTwo).toBe(200)
      expect(dataTwo.length).toBe(2)
      expect(lastEvaluatedKeyTwo).toBe(undefined)
    })
    test('should respond with statusCode 200 to correct request alls items byOwner including the past bookings', async () => {
      // GIVEN
      const payloadEventFive = { ...eventPayload }
      payloadEventFive.eventTitle = '1'
      payloadEventFive.eventOwnerId = eventOwnerIdOne
      payloadEventFive.eventDate = '2000-01-24'

      // WHEN

      const responseEventFive = await eventRequest(
        payloadEventFive,
        API_BASE_URL,
      )

      pastEvent.eventId = responseEventFive.data.data.eventId
      payloadEventFive.eventPictures = ['placeholder_picture-1']

      const { status: statusByOwnerIdOnePast, data: dataByOwnerIdOnePast } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            includePast: 'true',
          },
        })

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            includePast: false,
          },
        })

      // THEN
      expect(responseEventFive.status).toBe(201)
      expect(statusByOwnerIdOne).toBe(200)
      expect(dataByOwnerIdOne.data.length).toBe(3)
      expect(statusByOwnerIdOnePast).toBe(200)
      expect(dataByOwnerIdOnePast.data.length).toBe(4)
    })
    test('should respond with statusCode 200 to correct request zero items byOwnerId that does not exist', async () => {
      // WHEN

      const { status, data: dataByOwnerIdNotExist } = await axios.get(
        `${API_BASE_URL}/items/byOwner/eventOwnerThatDoesNotExist
          `,
        {
          params: {
            includePast: true,
          },
        },
      )

      // THEN
      expect(status).toBe(200)
      expect(dataByOwnerIdNotExist.data).toEqual([])
    })

    test('should respond with statusCode 200 to correct request with query params fromDate, toDate and includePast By ownerId', async () => {
      // WHEN

      const { status, data: dataByOwnerIdFromDate } = await axios.get(
        `${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`,
        {
          params: {
            fromDate: '2030-09-26',
          },
        },
      )

      const { data: dataByOwnerIdFromDateToDate } = await axios.get(
        `${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`,
        {
          params: {
            fromDate: '2030-09-25',
            toDate: '2031-09-26',
          },
        },
      )

      const { data: dataByOwnerIdToDate } = await axios.get(
        `${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`,
        {
          params: {
            toDate: '2030-09-26',
          },
        },
      )

      const { data: dataByOwnerIdToDateWithPast } = await axios.get(
        `${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`,
        {
          params: {
            toDate: '2030-09-25',
            includePast: true,
          },
        },
      )
      // THEN
      expect(status).toBe(200)
      expect(dataByOwnerIdFromDate.data.length).toBe(2)
      expect(dataByOwnerIdFromDateToDate.data.length).toBe(2)
      expect(dataByOwnerIdToDate.data.length).toBe(1)
      expect(dataByOwnerIdToDateWithPast.data.length).toBe(1)
    })

    test('should respond with statusCode 400 to incorrect request with query params fromDate wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            fromDate: 'a',
            includePast: true,
          },
        })
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('fromDate, must match format YYYY-MM-DD.')
    })
    test('should respond with statusCode 400 to incorrect request with query params includePast wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            includePast: 'yeah',
          },
        })
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('includePast, must match format boolean.')
    })
    test('should respond with statusCode 400 to incorrect request with query params lastEventDateAndTime wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            lastEventDateAndTime: 'yeah',
          },
        })
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe(
        'lastEventDateAndTime, must match format ISO8601.',
      )
    })
    test('should respond with statusCode 400 to incorrect request with query params lastEventDateAndTime with missing params', async () => {
      // WHEN

      const { response } = await axios
        .get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            lastEventDateAndTime: '2025-03-25T12:55:00.000Z',
          },
        })
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe(
        "Exclusive Start Key must have same size as table's key schema",
      )
    })
    test('should respond with statusCode 400 to incorrect request with query params limit wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(`${API_BASE_URL}/items/byOwner/${eventOwnerIdOne}`, {
          params: {
            limit: 'two',
          },
        })
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('limit, must be number,string.')
    })
  })
  describe('getItemBy userId', () => {
    // FIRST WE CREATE SOME ITEMS TO LATER DO A GET REQUEST
    test('should respond with statusCode 200 to correct request all items byOwner', async () => {
      // GIVEN
      const payloadBookingOneUserOne = {
        type: 'booking',
        userId: '1',
        userName: 'Javier Roca',
        userEmail: 'javier@fakeemail.com',
        eventId: event.eventId,
      }

      // THEN
      const { status: statusBookingOne, data: dataBookingOne } =
        await bookingRequest(payloadBookingOneUserOne, API_BASE_URL)

      const { status: statusByUserIdOne, data: dataByUserIdOne } =
        await axios.get(
          `${API_BASE_URL}/items/byUser/${payloadBookingOneUserOne.userId}`,
          {
            params: {
              includePast: true,
            },
          },
        )
      // THEN

      expect(statusBookingOne).toBe(201)
      expect(statusByUserIdOne).toBe(200)
      expect(dataByUserIdOne.data[0]).toEqual(dataBookingOne.data)
      expect(dataByUserIdOne.data.length).toBe(1)
    })
    test('should respond with statusCode 200 to correct request all items byOwner', async () => {
      // GIVEN
      const payloadBookingTwoPast = {
        type: 'booking',
        userId: '1',
        userName: 'Javier Roca',
        userEmail: 'javier@fakeemail.com',
        eventId: pastEvent.eventId,
      }

      // WHEN
      const { status: statusBookingTwoPast, data: dataBookingTwoPast } =
        await bookingRequest(payloadBookingTwoPast, API_BASE_URL)

      const { status: statusByUserIdOne, data: dataByUserIdOne } =
        await axios.get(
          `${API_BASE_URL}/items/byUser/${payloadBookingTwoPast.userId}`,
          {
            params: {
              includePast: true,
            },
          },
        )
      console.log(dataByUserIdOne.data)
      // THEN
      expect(statusBookingTwoPast).toBe(201)
      expect(statusByUserIdOne).toBe(200)
      expect(dataByUserIdOne.data[0]).toEqual(dataBookingTwoPast.data)
      expect(dataByUserIdOne.data.length).toBe(2)
    })
  })
})
