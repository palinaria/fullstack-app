import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Workspace extends Model {
    static associate(models) {
        Workspace.hasMany(models.Article, { foreignKey: 'workspaceId', as: 'articles' });
        Workspace.hasMany(models.Comment, { foreignKey: 'workspaceId', as: 'comments' });
    }
}

Workspace.init(
    {
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true }
    },
    {
        sequelize,
        modelName: 'Workspace',
        tableName: 'Workspaces',
        timestamps: true
    }
);
