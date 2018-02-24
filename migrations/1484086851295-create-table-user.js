var async = require('async')
var execSql = require('../src/db/connection_factory').executeSql

module.exports.up = (next) => {
  async.eachSeries([
    `
    CREATE TABLE dd_user (
      id serial PRIMARY KEY,
      username VARCHAR(200) NOT NULL,
      email VARCHAR(500) NOT NULL,
      password VARCHAR(200) NOT NULL,
      name VARCHAR(200) NOT NULL,
      image TEXT,
      hash TEXT NOT NULL,
      confirmed boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL,
      updated_at timestamp,
      CONSTRAINT unique_username UNIQUE (username),
      CONSTRAINT unique_email UNIQUE (email),
      CONSTRAINT unique_hash UNIQUE (hash)
    );

    CREATE TABLE dd_category (
      id serial PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description VARCHAR(200) NOT NULL,
      CONSTRAINT unique_name UNIQUE (name)
    );


    CREATE TABLE dd_post (
      id serial PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      dd_category integer REFERENCES dd_category(id) NOT NULL,
      dd_user integer REFERENCES dd_user(id) NOT NULL,
      created_at timestamp NOT NULL,
      updated_at timestamp,
      CONSTRAINT unique_title_dduser UNIQUE (title, dd_user)
    );

    CREATE TABLE dd_comment (
      id serial PRIMARY KEY,
      message VARCHAR(300) NOT NULL,
      dd_post integer REFERENCES dd_post(id) ON DELETE CASCADE NOT NULL,
      dd_user integer REFERENCES dd_user(id) NOT NULL,
      created_at timestamp NOT NULL,
      updated_at timestamp
    );

    CREATE TABLE dd_relevance (
      id serial PRIMARY KEY,
      positive BOOLEAN NOT NULL,
      dd_comment integer REFERENCES dd_comment(id) ON DELETE CASCADE NOT NULL,
      dd_user integer REFERENCES dd_user(id) NOT NULL,
      created_at timestamp NOT NULL,
      updated_at timestamp,
      CONSTRAINT unique_dduser_ddcomment UNIQUE (dd_user,dd_comment)
    );

    CREATE TABLE dd_like (
      id serial PRIMARY KEY,
      liked BOOLEAN NOT NULL,
      dd_post integer REFERENCES dd_post(id) ON DELETE CASCADE NOT NULL,
      dd_user integer REFERENCES dd_user(id) NOT NULL,
      created_at timestamp NOT NULL,
      updated_at timestamp,
      CONSTRAINT unique_dduser_ddpost UNIQUE (dd_user,dd_post)
    );
    `
  ], execSql, next)
}

module.exports.down = (next) => {
  async.eachSeries(
    [
      `
      `
    ],
    (sql, cb) => {
      execSql(sql, () => cb())
    },
    next
  )
}
