'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model:"users",
          key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      photo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model: "photos",
          key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      body:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at:{
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at:{
        type: Sequelize.DATE,
        allowNull: false
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable('comments');
  }
};
