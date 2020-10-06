const Sequelize = require("sequelize");
const ConfigDB = require("../config/database");

const User = require("../models/User");
const Photo = require("../models/Photo");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");

const connection = new Sequelize(ConfigDB);

//Models
User.init(connection);
Photo.init(connection);
Like.init(connection);
Comment.init(connection);
Follow.init(connection);

//Associate
User.associate(connection.models);
Photo.associate(connection.models);
Like.associate(connection.models);
Comment.associate(connection.models);
Follow.associate(connection.models);


module.exports = connection;