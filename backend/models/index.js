import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
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

// Импорт всех моделей
const files = fs.readdirSync(__dirname).filter(
    file => file.indexOf('.') !== 0 && file !== path.basename(__filename) && file.slice(-3) === '.js'
);

for (const file of files) {
    const module = await import(path.join(__dirname, file));
    const model = Object.values(module)[0]; // Берём первый экспорт (класс модели)
    model.associate && model.associate(db);
    db[model.name] = model;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
