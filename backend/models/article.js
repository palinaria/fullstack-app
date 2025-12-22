import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Article extends Model {
    static associate(models) {
        Article.hasMany(models.Comment, {
            foreignKey: 'articleId',
            as: 'comments',
            onDelete: 'CASCADE'
        });
        Article.belongsTo(models.Workspace, {
            foreignKey: 'workspaceId',
            as: 'workspace'
        });
    }
}

Article.init(
    {
        title: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        files: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
        workspaceId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
        sequelize,
        modelName: 'Article',
        tableName: 'Articles',
        timestamps: true
    }
);
