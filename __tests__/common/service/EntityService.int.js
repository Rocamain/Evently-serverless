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
    const itemStoredInDb = await service.get(eventId, userId)

    // EXPECTS
    expect(itemStoredInDb).toBeTruthy()
    expect(createResult).toEqual(itemStoredInDb)
  })
})
