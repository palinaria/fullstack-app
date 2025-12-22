import { Sequelize } from 'sequelize';
import configFile from '../config/config.cjs';

const config = configFile.development;

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
