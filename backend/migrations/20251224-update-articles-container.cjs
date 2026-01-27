'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.removeColumn('Articles', 'title');
        await queryInterface.removeColumn('Articles', 'content');
        await queryInterface.removeColumn('Articles', 'files');


    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('Articles', 'title', {
            type: Sequelize.STRING
        });
        await queryInterface.addColumn('Articles', 'content', {
            type: Sequelize.TEXT
        });
        await queryInterface.addColumn('Articles', 'files', {
            type: Sequelize.JSON
        });
    }
};
