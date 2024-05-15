const mysql = require('mysql2');
const util = require('util');

var db_config = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'multi_version_bible'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Connected to mysql Server!");
    }
  });

  connection.on('error', function (err) {
    console.log('Cannot be connect to Database due to', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

function makeDb() {
  return {
    query(sql, args) {
   
      console.log(sql);
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      console.log("db not connected to localhost");
      return util.promisify(connection.end).call(connection);
    }
  }
}

const db = makeDb();
module.exports = db;
