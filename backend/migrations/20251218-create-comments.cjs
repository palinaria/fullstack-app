'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Comments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            articleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Articles', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            workspaceId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Workspaces', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
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
        await queryInterface.dropTable('Comments');
    }
};
