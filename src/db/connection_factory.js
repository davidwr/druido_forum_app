var pg = require('pg')
require('../../bootstrap')

var DataBase = new pg.Pool(CONFIG.db)

module.exports.executeSql = function (sql, interpolations, callback) {
  if (_.isFunction(interpolations)) {
    callback = interpolations
    interpolations = []
  }

  DataBase.connect(function (err, connection, closeConnection) {
    if (err) {
      DataBase.on('error', function () {
        log.error('Connection error', err.message, err.stack)
      })
      return callback(err)
    }
    connection.query(sql, interpolations, function (err, result) {
      closeConnection()
      return callback(err, result)
    })
  })
}

module.exports.getPool = DataBase
