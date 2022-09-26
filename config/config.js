const dotenv = require(`dotenv`);

dotenv.config();

module.exports =
{
  "development": {
    "username": process.env.MYSQLDB_USER,
    "password": process.env.MYSQLDB_ROOT_PASSWORD,
    "database": "among_development",
    "host": process.env.MYSQL_HOST,
    "dialect": "mysql",
    "timezone": "+09:00",
  },
  "test": {
    "username": process.env.MYSQLDB_USER,
    "password": process.env.MYSQLDB_ROOT_PASSWORD,
    "database": "among_test",
    "host": process.env.MYSQL_HOST,
    "dialect": "mysql",

  },
  "production": {
    "username": process.env.MYSQLDB_USER,
    "password": process.env.MYSQLDB_ROOT_PASSWORD,
    "database": "among_production",
    "host": process.env.MYSQL_HOST,
    "dialect": "mysql",

  }
}
