
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Comment extends Model {}

Comment.init(
    {
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        articleId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Comment'
    }
);
