var async = require('async')
var execSql = require('../src/db/connection_factory').executeSql

module.exports.up = (next) => {
  async.eachSeries([
    `
    INSERT INTO dd_category (name, description)
      VALUES ('Arts', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Business', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Carrer', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Education', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Environmental', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Finances', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Fun', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Games', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Health', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Home', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Internet', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Kids and Teens', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Law and Legal', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Media', '');

    INSERT INTO dd_category (name, description)
      VALUES ('News', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Politics and Government', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Society and Culture', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Spirituality', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Sports', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Technology', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Traffic & Roads', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Transportation', '');

    INSERT INTO dd_category (name, description)
      VALUES ('Weather', '');
    `
  ], execSql, next)
}

module.exports.down = (next) => {
  async.eachSeries(
    [
      `
      YOUR ARRAY DOWN SQL HERE
      `
    ],
    (sql, cb) => {
      execSql(sql, () => cb())
    },
    next
  )
}
