const EntityService = require('../../../src/common/service/entityService')

describe('Integration Test for CRUD Operations on Service', () => {
  jest.setTimeout(30000000)

  const service = new EntityService()

  test('create and delete an item event', async () => {
    const body = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is test 1 event',
      eventLocation: 'Online',
      eventDate: '23-04-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'hpps://webste.com',
    }

    const createResult = await service.create(body)

    const [eventId, userId] = createResult.data.eventId.split('-')
    const itemEventStoredInDb = await service.get(eventId, userId)
    const itemEventDeleted = await service.delete(eventId, userId)

    // EXPECTS
    expect(itemEventStoredInDb).toBeTruthy()
    expect(createResult).toEqual(itemEventStoredInDb)
    expect(itemEventDeleted.message).toBe('Items deleted')
  })
  test('create an event and booking with eventID, queryByIndex userId on booking and delete an item event which also delete booking', async () => {
    const eventBody = {
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

    const createEvent = await service.create(eventBody)

    const [eventId, userId] = createEvent.data.eventId.split('-')

    const bookingBody = {
      type: 'booking',
      userId: 'userId_1',
      userName: 'User Name 1',
      userEmail: 'userId_1@fakeemail.com',
      eventId,
    }

    const createBooking = await service.create(bookingBody)

    const itemEventStoredInDb = await service.get(eventId, userId)
    const queryByEventUserId = await service.queryByGlobalIndex(
      bookingBody.userId,
      true,
    )

    const itemEventDeleted = await service.delete(eventId, userId)
    const itemBookingStoredInDb = await service.get(
      createBooking.data.bookingId,
      createBooking.data.userId,
    )

    // EXPECTS

    expect(createBooking).toBeTruthy()
    expect(queryByEventUserId).toBeTruthy()
    expect(createEvent).toEqual(itemEventStoredInDb)
    expect(createBooking.data).toEqual(JSON.parse(queryByEventUserId).data[0])
    expect(itemEventDeleted.message).toBe('Items deleted')
    expect(itemBookingStoredInDb.data).toEqual({})
  })
  test('create an event and booking with eventID and delete an item event which also delete booking', async () => {})
})
