'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      workspaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Workspaces', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      currentVersionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'ArticleVersionsList', key: 'id' }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Articles');
  }
};
