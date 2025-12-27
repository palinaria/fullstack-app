import { Sequelize } from 'sequelize';
import configFile from '../config/config.js';

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

export const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,
        logging: false
    }
);
