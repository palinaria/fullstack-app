import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';

// Чтение конфигурации БД
const configPath = path.join(process.cwd(), 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Инициализация Sequelize соединяет твой сервер с PostgreSQL.Работает через js с Базой даной Article.findAll()
export const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: config.development.dialect
    }
);
