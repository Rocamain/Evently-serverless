const createItemLambda = require('../../../src/lambdas/createItem/function')

describe('createItem function', () => {
  test('should respond with statusCode 200 to correct request', async () => {
    // GIVEN

    const headers = {
      'Content-type': 'application/json; charset=UTF-8',
    }

    const body = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://www.website.com',
    }

    // WHEN
    const actual = await createItemLambda.handler({ body, headers })
    console.log(actual)
  })
})
