const schemaJS = JSON.stringify({
  TableName: process.env.tableName,
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' },
    { AttributeName: 'userId', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' },
    { AttributeName: 'eventOwnerId', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'eventDateAndTime', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'eventOwnerId',
      KeySchema: [
        { AttributeName: 'eventOwnerId', KeyType: 'HASH' },
        { AttributeName: 'eventDateAndTime', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'userId',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'eventDateAndTime', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
})

module.exports = schemaJS
