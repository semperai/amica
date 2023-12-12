const sqlite3 = require("sqlite3");
const sqlite =  require("sqlite");
const path = require('path');

sqlite.open({filename: path.resolve('amica.db'), driver: sqlite3.Database })
  .then((db) => {
    console.log(db.migrate())
  })

