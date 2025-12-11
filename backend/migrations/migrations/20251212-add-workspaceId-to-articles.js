'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Добавляем колонку workspaceId
    await queryInterface.addColumn('Articles', 'workspaceId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1 // создаём workspace с id=1 по умолчанию
    });

    // Добавляем внешний ключ
    await queryInterface.addConstraint('Articles', {
        fields: ['workspaceId'],
        type: 'foreign key',
        name: 'fk_articles_workspace',
        references: { table: 'Workspaces', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Articles', 'fk_articles_workspace');
    await queryInterface.removeColumn('Articles', 'workspaceId');
}
