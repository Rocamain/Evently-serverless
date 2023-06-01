const createItemLambda = require('../../../src/lambdas/createItem/function')

describe('createItem function', () => {
  test('should respond with statusCode 200 to correct request', async () => {
    // GIVEN

    const headers = {
      'Content-Type':
        'multipart/form-data; boundary=--------------------------940071923899278094915217',
    }

    const body = {
      type: 'event',
      eventOwnerId: '2',
      eventOwnerName: 'Javier Roca',
      eventOwnerEmail: 'javier@fakeemail.com',
      eventTitle: 'Event 3',
      eventDescription: 'This is a description.',
      eventCategory: 'other',
      eventLocation: 'Online',
      eventDate: '23-05-2023',
      eventTime: '12:55',
      eventPrice: 1,
      eventLink: 'https://www.website.com',
    }

    const form = new FormData()
    form.append('data', JSON.stringify(body))

    // WHEN
    const actual = await createItemLambda.handler({
      event: {
        body: Buffer.from(JSON.stringify(form)),
        headers,
      },
    })

    console.log(actual)
  })
})
