import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import configFile from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};

import { Article } from './article.js';
import { ArticleVersion } from './articleVersion.js';
import { Comment } from './comment.js';
import { Workspace } from './workspace.js';

db.Article = Article;
db.ArticleVersion = ArticleVersion;
db.Comment = Comment;
db.Workspace = Workspace;

Object.values(db).forEach(model => {
    if (model.associate) {
        model.associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
