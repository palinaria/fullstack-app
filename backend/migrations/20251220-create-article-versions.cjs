'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ArticleVersionsList', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            articleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Articles', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            version: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            files: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('ArticleVersionsList');
    }
};
