const Sequelize = require("sequelize");
const ConfigDB = require("../config/database");

const User = require("../models/User");

const connection = new Sequelize(ConfigDB);

User.init(connection);

module.exports = connection;