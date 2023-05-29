const schema = require('./schema')
const parsedSchema = JSON.parse(schema)
module.exports = {
  tables: [parsedSchema],
  basePort: 8000,
}
