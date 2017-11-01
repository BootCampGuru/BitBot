 var sqldb = require('mysql');

//   var connection = sqldb.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "sagat99",
//   database: "bitbot"
// });

var connection = sqldb.createConnection({
  host: "rocklobster.cmglveqlnmr0.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "api_user",
  password: "ABC123",
  database: "codingBootcamp_db"
});

module.exports = connection;