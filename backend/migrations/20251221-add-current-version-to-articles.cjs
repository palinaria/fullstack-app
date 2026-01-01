'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Articles', 'currentVersionId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'ArticleVersionsList',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Articles', 'currentVersionId');
    }
};
