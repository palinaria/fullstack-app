export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArticleVersions', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        articleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Articles', key: 'id' },
            onDelete: 'CASCADE'
        },
        title: { type: Sequelize.STRING, allowNull: false },
        content: { type: Sequelize.TEXT, allowNull: false },
        files: { type: Sequelize.JSON, defaultValue: [] },
        versionNumber: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
        updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('ArticleVersions');
}
