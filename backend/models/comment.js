import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class Comment extends Model {
    static associate(models) {
        Comment.belongsTo(models.Article, { foreignKey: 'articleId', as: 'article' });
        Comment.belongsTo(models.Workspace, { foreignKey: 'workspaceId', as: 'workspace' });
    }
}

Comment.init(
    {
        text: { type: DataTypes.TEXT, allowNull: false },
        articleId: { type: DataTypes.INTEGER, allowNull: false },
        workspaceId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
        sequelize,
        modelName: 'Comment',
        tableName: 'Comments',
        timestamps: true
    }
);
