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

        Article.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author'
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
      },
      authorId: {
          type: DataTypes.INTEGER,
          allowNull: false
      }
  },
  {
      sequelize,
      modelName: 'Article',
      tableName: 'Articles'
  }
);
