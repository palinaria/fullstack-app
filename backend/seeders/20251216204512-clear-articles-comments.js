export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Comments', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });

        await queryInterface.bulkDelete('ArticleVersionsList', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });

        await queryInterface.bulkDelete('Articles', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    },

    async down() {}
};
