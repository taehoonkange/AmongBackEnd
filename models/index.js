const Sequelize = require(`Sequelize`)
const env = process.env.NODE_ENV || `development`;
const config = require(`../config/config`)[env]
const db= {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.Performance = require(`./performance`)(sequelize,Sequelize)
db.User = require(`./user`)(sequelize,Sequelize)
db.Seat = require(`./seat`)(sequelize,Sequelize)
db.Ticket = require(`./ticket`)(sequelize,Sequelize)
db.Comment = require(`./comment`)(sequelize,Sequelize)
db.Board = require(`./board`)(sequelize,Sequelize)


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
