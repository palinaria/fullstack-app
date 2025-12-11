
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Workspace extends Model {}

Workspace.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Workspace'
    }
);
