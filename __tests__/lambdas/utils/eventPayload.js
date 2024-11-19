const { readFileSync } = require('node:fs')
const eventPayload = {
  type: 'event',
  eventOwnerId: 'create_Item_Owner_Id-1',
  eventOwnerName: 'Javier Roca',
  eventOwnerEmail: 'javier@fakeemail.com',
  eventOwnerPicture: 'https://website.com/owner-picture.webp',
  eventTitle: 'Event 3',
  eventDescription: 'This is a description.',
  eventCategory: 'Other',
  eventLocationId: 'ChIJ6ZXJxFYmd0gRvy4yDcwXaf8',
  eventLocationAddress: 'Overthorpe Rd, Banbury OX16 4PN, UK',
  eventLocationLat: '52.0638765',
  eventLocationLng: '-1.3143039',
  eventDate: '2030-09-25',
  eventTime: '12:55',
  eventPrice: 0,
  eventLink: 'https://website.com',
  eventPictures: {
    buffer: Buffer.from(
      readFileSync(
        '__tests__/lambdas/utils/image/event_image.webp',
        (err, data) => {
          if (err) throw err
          return data
        },
      ),
    ),
    fileName: 'event_image.webp',
  },
}

module.exports = eventPayload
