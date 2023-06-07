const { default: axios } = require('axios')
const FormData = require('form-data')

// axios.defaults.baseURL = ``
const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}`

describe('getItemBy function', () => {
  const eventToBookOne = {}
  const pastBookingToBookOne = {}

  // FIRST WE CREATE SOME ITEMS TO LATER DO A GET REQUEST
  describe('getItemBy eventOwnerId', () => {
    test('should respond with statusCode 200 to correct request all items byOwner', async () => {
      // GIVEN
      const payloadEventOne = {
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
      const payloadEventTwo = {
        type: 'event',
        eventOwnerId: '1',
        eventOwnerName: 'Javier Roca',
        eventOwnerEmail: 'javier@fakeemail.com',
        eventCategory: 'other',
        eventTitle: 'Event 2',
        eventDescription: 'This is a description.',
        eventLocation: 'Online',
        eventDate: '27-05-2030',
        eventTime: '12:55',
        eventPrice: 5,
        eventLink: 'https://website.com/Event_2',
      }
      const payloadEventThree = {
        type: 'event',
        eventOwnerId: '2',
        eventOwnerName: 'francisco vazquez',
        eventOwnerEmail: 'francisco@fakeemail.com',
        eventTitle: 'Event 3',
        eventDescription: 'This is a description.',
        eventCategory: 'other',
        eventLocation: 'Online',
        eventDate: '25-05-2030',
        eventTime: '12:55',
        eventPrice: 10,
        eventLink: 'https://website.com/Event_3',
      }

      const payloadEventFour = {
        type: 'event',
        eventOwnerId: '1',
        eventOwnerName: 'Javier Roca',
        eventOwnerEmail: 'javier@fakeemail.com',
        eventTitle: 'Event 3',
        eventDescription: 'This is a description.',
        eventCategory: 'other',
        eventLocation: 'Online',
        eventDate: '28-05-2030',
        eventTime: '12:55',
        eventPrice: 10,
        eventLink: 'https://website.com/Event_3',
      }
      // WHEN

      const formOne = new FormData()
      formOne.append('data', JSON.stringify(payloadEventOne))

      const { status: statusOne, data: dataOne } = await axios.post(
        `${API_BASE_URL}/item`,
        formOne,
      )

      const formTwo = new FormData()
      formTwo.append('data', JSON.stringify(payloadEventTwo))

      const { status: statusTwo, data: dataTwo } = await axios.post(
        `${API_BASE_URL}/item`,
        formTwo,
      )

      const formThree = new FormData()
      formThree.append('data', JSON.stringify(payloadEventThree))

      const { status: statusThree, data: dataThree } = await axios.post(
        `${API_BASE_URL}/item`,
        formThree,
      )

      // I will use this variable later to make booking as i need to have access to eventId, randomly generated

      eventToBookOne.data = dataThree.data

      const formFour = new FormData()
      formFour.append('data', JSON.stringify(payloadEventFour))

      const { status: statusFour, data: dataFour } = await axios.post(
        `${API_BASE_URL}/item`,
        formFour,
      )

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(
          `${API_BASE_URL}/items/byOwner/${payloadEventOne.eventOwnerId}`,
        )
      const { status: statusByOwnerIdTwo, data: dataByOwnerIdTwo } =
        await axios.get(
          `${API_BASE_URL}/items/byOwner/${payloadEventThree.eventOwnerId}`,
        )

      const eventsEventOwnerIdOne = {
        data: [{ ...dataOne.data }, { ...dataTwo.data }, { ...dataFour.data }],
      }

      const eventsEventOwnerIdTwo = {
        data: [{ ...dataThree.data }],
      }

      // THEN

      // events created status code
      expect(statusOne).toBe(201)
      expect(statusTwo).toBe(201)
      expect(statusThree).toBe(201)
      expect(statusFour).toBe(201)

      // query by ownerId status code

      expect(statusByOwnerIdOne).toBe(200)
      expect(statusByOwnerIdTwo).toBe(200)

      // check ownerIdData events vs query
      expect(dataByOwnerIdOne).toEqual(eventsEventOwnerIdOne)
      expect(dataByOwnerIdTwo).toEqual(eventsEventOwnerIdTwo)
    })
    test('should respond with statusCode 200 to correct request alls items byOwner with query in params limit and later make a new request that use exclusiveStartKey (pagination wau in dynamodb)', async () => {
      // WHEN

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(`${API_BASE_URL}/items/byOwner/1/`, {
          params: {
            limit: 1,
          },
        })

      const {
        lastEvaluatedKey: { eventOwnerId, PK, userId, eventDateAndTime },
        data: dataOne,
      } = dataByOwnerIdOne

      const { status: statusByOwnerIdTwo, data: dataByOwnerIdTwo } =
        await axios.get(`${API_BASE_URL}/items/byOwner/1`, {
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
      const payloadEventFive = {
        type: 'event',
        eventOwnerId: '1',
        eventOwnerName: 'Javier Roca',
        eventOwnerEmail: 'javier@fakeemail.com',
        eventTitle: 'Event 1',
        eventDescription: 'This is a description.',
        eventCategory: 'travel',
        eventLocation: 'Online',
        eventDate: '23-05-2012',
        eventTime: '12:55',
        eventPrice: 1,
        eventLink: 'https://website.com/Event_1',
      }

      // WHEN

      const formEventFive = new FormData()
      formEventFive.append('data', JSON.stringify(payloadEventFive))

      const { status: statusFive, data: dataFive } = await axios.post(
        `${API_BASE_URL}/item`,
        formEventFive,
      )

      pastBookingToBookOne.data = dataFive.data
      const { status: statusByOwnerIdOnePast, data: dataByOwnerIdOnePast } =
        await axios.get(`${API_BASE_URL}/items/byOwner/1`, {
          params: {
            includePast: true,
          },
        })

      const { status: statusByOwnerIdOne, data: dataByOwnerIdOne } =
        await axios.get(`${API_BASE_URL}/items/byOwner/1`, {
          params: {
            includePast: false,
          },
        })
      // THEN
      expect(statusFive).toBe(201)
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
        `${API_BASE_URL}/items/byOwner/1
          `,
        {
          params: {
            fromDate: '25-05-2030',
          },
        },
      )

      const { data: dataByOwnerIdFromDateToDate } = await axios.get(
        `${API_BASE_URL}/items/byOwner/1
          `,
        {
          params: {
            fromDate: '25-05-2030',
            toDate: '28-05-2030',
          },
        },
      )

      const { data: dataByOwnerIdToDate } = await axios.get(
        `${API_BASE_URL}/items/byOwner/1
          `,
        {
          params: {
            toDate: '27-05-2030',
          },
        },
      )
      const { data: dataByOwnerIdToDateWithPast } = await axios.get(
        `${API_BASE_URL}/items/byOwner/1
          `,
        {
          params: {
            toDate: '27-05-2030',
            includePast: true,
          },
        },
      )

      // THEN
      expect(status).toBe(200)
      expect(dataByOwnerIdFromDate.data.length).toBe(2)
      expect(dataByOwnerIdFromDateToDate.data.length).toBe(1)
      expect(dataByOwnerIdToDate.data.length).toBe(1)
      expect(dataByOwnerIdToDateWithPast.data.length).toBe(2)
    })

    test('should respond with statusCode 400 to incorrect request with query params fromDate wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(
          `${API_BASE_URL}/items/byOwner/1
          `,
          {
            params: {
              fromDate: 'a',
              includePast: true,
            },
          },
        )
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('must match format DD-MM-YYYY.')
    })
    test('should respond with statusCode 400 to incorrect request with query params includePast wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(
          `${API_BASE_URL}/items/byOwner/1
          `,
          {
            params: {
              includePast: 'yeah',
            },
          },
        )
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('must match format boolean.')
    })
    test('should respond with statusCode 400 to incorrect request with query params lastEventDateAndTime wrong format', async () => {
      // WHEN

      const { response } = await axios
        .get(
          `${API_BASE_URL}/items/byOwner/1
          `,
          {
            params: {
              lastEventDateAndTime: 'yeah',
            },
          },
        )
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('must match format ISO8601.')
    })
    test('should respond with statusCode 400 to incorrect request with query params lastEventDateAndTime with missing params', async () => {
      // WHEN

      const { response } = await axios
        .get(
          `${API_BASE_URL}/items/byOwner/1
          `,
          {
            params: {
              lastEventDateAndTime: '2025-03-25T12:55:00.000Z',
            },
          },
        )
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
        .get(
          `${API_BASE_URL}/items/byOwner/1
          `,
          {
            params: {
              limit: 'two',
            },
          },
        )
        .catch((err) => err)
      const { status, data } = response

      // THEN
      expect(status).toBe(400)
      expect(data.error.name).toBe('ValidationException')
      expect(data.error.message).toBe('must match format positive integer.')
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
        eventId: eventToBookOne.data.eventId.split('-')[0],
      }

      // THEN
      const formBookingOne = new FormData()
      formBookingOne.append('data', JSON.stringify(payloadBookingOneUserOne))

      const { status: statusBookingOne, data: dataBookingOne } =
        await axios.post(`${API_BASE_URL}/item`, formBookingOne)

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
      const payloadBookingTwoUserOne = {
        type: 'booking',
        userId: '1',
        userName: 'Javier Roca',
        userEmail: 'javier@fakeemail.com',
        eventId: pastBookingToBookOne.data.eventId.split('-')[0],
      }

      // WHEN
      const formBookingTwo = new FormData()
      formBookingTwo.append('data', JSON.stringify(payloadBookingTwoUserOne))

      const { status: statusBookingTwo, data: dataBookingTwo } =
        await axios.post(`${API_BASE_URL}/item`, formBookingTwo)

      const { status: statusByUserIdOne, data: dataByUserIdOne } =
        await axios.get(
          `${API_BASE_URL}/items/byUser/${payloadBookingTwoUserOne.userId}`,
          {
            params: {
              includePast: true,
            },
          },
        )
      // THEN
      expect(statusBookingTwo).toBe(201)
      expect(statusByUserIdOne).toBe(200)
      expect(dataByUserIdOne.data[0]).toEqual(dataBookingTwo.data)
      expect(dataByUserIdOne.data.length).toBe(2)
    })
  })
})
