const EntityService = require('../../../src/common/service/entityService')

describe('Integration Test for CRUD Operations on Service', () => {
  jest.setTimeout(30000000)

  const service = new EntityService()

  test.only('create and delete an item event', async () => {
    // WHEN
    const body = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventLocation: 'Online',
      eventDate: '23-04-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://www.website.com',
    }

    // THEN
    const createResult = await service.create(body)

    const { eventId, type } = createResult.data

    const itemEventStoredInDb = await service.get(eventId, type)

    const itemEventDeleted = await service.delete(eventId, type)

    // EXPECTS
    expect(itemEventStoredInDb).toBeTruthy()
    expect(createResult).toEqual(itemEventStoredInDb)
    expect(itemEventDeleted.data.message).toBe('Items deleted')
  })
  test.only('create an event and booking with eventID, queryByIndex userId on booking and delete an item event which also delete booking', async () => {
    //  WHEN
    const eventBody = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2030',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://www.website.com',
    }

    // THEN
    const createEvent = await service.create(eventBody)

    const { eventId } = createEvent.data

    const bookingBody = {
      type: 'booking',
      userId: 'userId_1',
      userName: 'User Name 1',
      userEmail: 'userId_1@fakeemail.com',
      eventId,
    }

    const createBooking = await service.create(bookingBody)

    const itemEventStoredInDb = await service.get(eventId, 'event')

    const queryByEventUserId = await service.queryByGlobalIndex(
      bookingBody.userId,
    )

    const itemEventDeleted = await service.delete(eventId, 'event')

    const itemBookingStoredInDb = await service.get(
      createBooking.data.bookingId,
      createBooking.data.userId,
    )
    // EXPECTS

    expect(createBooking).toBeTruthy()
    expect(queryByEventUserId).toBeTruthy()
    expect(createEvent).toEqual(itemEventStoredInDb)
    // expect(createBooking.data).toEqual(JSON.parse(queryByEventUserId).data[0])
    expect(itemEventDeleted.data.message).toBe('Items deleted')
    expect(itemBookingStoredInDb.data).toEqual({})
  })
})
