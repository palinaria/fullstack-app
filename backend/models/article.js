import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../services/db.js';

export class Article extends Model {
    static associate(models) {
        Article.hasMany(models.ArticleVersion, {
            foreignKey: 'articleId',
            as: 'versions'
        });

        Article.belongsTo(models.ArticleVersion, {
            foreignKey: 'currentVersionId',
            as: 'currentVersion'
        });
    }
}

Article.init(
    {
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currentVersionId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Article',
        tableName: 'Articles'
    }
);
