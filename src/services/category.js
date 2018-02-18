const connectionFactory = require('../db/connection_factory')

const find = (id, callback) => {
  var sql = QueryBuilder('dd_category') // eslint-disable-line
    .select('id', 'name')

  if (id) {
    sql.where('id', id)
  }

  sql = sql.toString()
  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)

    if (id) {
      return callback(null, result.rows[0])
    }

    callback(null, result.rows)
  })
}

module.exports = { find }
