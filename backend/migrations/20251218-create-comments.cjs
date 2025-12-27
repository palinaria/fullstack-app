export async function up(queryInterface, Sequelize) {
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
            allowNull: false
        },
        workspaceId: {
            type: Sequelize.INTEGER,
            allowNull: false
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

    await queryInterface.addConstraint('Comments', {
        fields: ['articleId'],
        type: 'foreign key',
        references: { table: 'Articles', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Comments', {
        fields: ['workspaceId'],
        type: 'foreign key',
        references: { table: 'Workspaces', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('Comments');
}
