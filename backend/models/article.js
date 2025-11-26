import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Article extends Model {}

Article.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        files: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        }
    },
    {
        sequelize,
        modelName: 'Article'
    }
);
