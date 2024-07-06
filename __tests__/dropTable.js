const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:8000',
  region: 'localhost',
  accessKeyId: 'fakeAccessKeyId', // can be anything for local development
  secretAccessKey: 'fakeSecretAccessKey', // can be anything for local development
})

const tableName = 'YourTableName'

const params = {
  TableName: tableName,
}

dynamodb.deleteTable(params, (err, data) => {
  if (err) {
    console.error(
      'Unable to delete table. Error JSON:',
      JSON.stringify(err, null, 2),
    )
  } else {
    console.log(
      'Deleted table. Table description JSON:',
      JSON.stringify(data, null, 2),
    )
  }
})
