import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Article extends Model {

    static associate(models) {

    }
  }

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
        modelName: 'Article',
      }
  );

  return Article;
};
