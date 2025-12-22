'use strict';

import { Comment } from '../models/Comment.js';
import { Article } from '../models/Article.js';

export async function up(queryInterface, Sequelize) {
    // Удаляем все комментарии
    await Comment.destroy({ where: {}, truncate: true, restartIdentity: true });

    // Удаляем все статьи
    await Article.destroy({ where: {}, truncate: true, restartIdentity: true });
}

export async function down(queryInterface, Sequelize) {
    // Ничего не делаем
}
