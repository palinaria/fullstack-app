import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../services/db.js';

export class ArticleVersion extends Model {
    static associate(models) {
        ArticleVersion.belongsTo(models.Article, {
            foreignKey: 'articleId'
        });
    }
}

ArticleVersion.init(
    {
        articleId: {type: DataTypes.INTEGER, allowNull: false},
        version: {type: DataTypes.INTEGER, allowNull: false},
        title: {type: DataTypes.STRING, allowNull: false},
        content: {type: DataTypes.TEXT, allowNull: false},
        files: {type: DataTypes.JSON, defaultValue: []}
    },
    {
        sequelize,
        modelName: 'ArticleVersion',
        tableName: 'ArticleVersionsList'
    }
);
