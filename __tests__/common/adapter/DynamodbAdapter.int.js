const DynamoDbAdapter = require('../../../src/common/adapter/dynamoDbAdapter')
const client = new DynamoDbAdapter()

describe('Integration Test for on Adapter ', () => {
  jest.setTimeout(30000000)

  afterAll(() => {
    client.documentClient.destroy()
  })

  test('create, delete an item and query', async () => {
    const createParams = {
      Item: { PK: 'SampleId', userId: 'event' },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
      ConditionExpression: 'attribute_not_exists(PK)',
    }
    const deleteParams = {
      TableName: 'aws-evently-local',
      Key: { PK: 'SampleId', userId: 'event' },
      ReturnConsumedCapacity: 'TOTAL',
    }

    const createResults = await client.create(createParams)

    const deleteResults = await client.delete(deleteParams)
    const check = await client.queryByField(process.env.tableName, {
      field: 'PK',
      value: 'SampleId',
    })

    // EXPECTS
    expect(createResults).toBeTruthy()
    expect(createResults.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(createResults.ConsumedCapacity.CapacityUnits).toBe(1)
    expect(deleteResults.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(deleteResults.ConsumedCapacity.CapacityUnits).toBe(1)
    expect(check.Count).toBe(0)
  })
  test('create, get, delete an item and query', async () => {
    const paramsCreate = {
      Item: {
        PK: 'SampleId',
        userId: 'event',
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
    }
    const paramsDelete = {
      Key: {
        PK: 'SampleId',
        userId: 'event',
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
    }
    const paramsGet = {
      Key: {
        PK: 'SampleId',
        userId: 'event',
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
    }

    const createResults = await client.create(paramsCreate)
    const getResults = await client.get(paramsGet)
    const deleteResults = await client.delete(paramsDelete)
    const check = await client.queryByField(process.env.tableName, {
      field: 'PK',
      value: 'SampleId',
    })

    // EXPECTS
    expect(createResults).toBeTruthy()
    expect(createResults.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(createResults.ConsumedCapacity.CapacityUnits).toBe(1)
    expect(getResults.Item.PK).toBe('SampleId')
    expect(getResults.Item.userId).toBe('event')
    expect(deleteResults.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(deleteResults.ConsumedCapacity.CapacityUnits).toBe(1)
    expect(check.Count).toBe(0)
  })

  test('create two items with same id, delete by batch id and query', async () => {
    const paramsCreateSameID1 = {
      Item: {
        PK: 'SampleId',
        userId: 'event',
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
    }
    const paramsCreateSameID2 = {
      Item: {
        PK: 'SampleId',
        userId: 'SampleUserId',
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: process.env.tableName,
    }

    const batchWriteCommand = {
      RequestItems: {
        [process.env.tableName]: [
          { DeleteRequest: { Key: paramsCreateSameID1.Item } },
          { DeleteRequest: { Key: paramsCreateSameID2.Item } },
        ],
      },
      ReturnConsumedCapacity: 'TOTAL',
    }

    const createResultsSameID1 = await client.create(paramsCreateSameID1)
    const createResultsSameID2 = await client.create(paramsCreateSameID2)

    const deleteBatchSameID = await client.batchDelete(batchWriteCommand)
    const check = await client.queryByField(process.env.tableName, {
      field: 'PK',
      value: 'SampleId',
    })

    expect(createResultsSameID1).toBeTruthy()
    expect(createResultsSameID1.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(createResultsSameID1.ConsumedCapacity.CapacityUnits).toBe(1)
    expect(createResultsSameID2).toBeTruthy()
    expect(createResultsSameID2.ConsumedCapacity.TableName).toMatch(
      process.env.tableName,
    )
    expect(createResultsSameID2.ConsumedCapacity.CapacityUnits).toBe(1)

    expect(deleteBatchSameID.ConsumedCapacity[0].CapacityUnits).toBe(2)
    expect(deleteBatchSameID.UnprocessedItems).toEqual({})
    expect(check.Count).toBe(0)
  })
})