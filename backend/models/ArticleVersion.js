'use strict';

module.exports = (sequelize, DataTypes) => {
    const ArticleVersion = sequelize.define('ArticleVersion', {
        articleId: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        files: { type: DataTypes.JSON, defaultValue: [] },
        versionNumber: { type: DataTypes.INTEGER, allowNull: false }
    }, {});

    ArticleVersion.associate = models => {
        ArticleVersion.belongsTo(models.Article, { foreignKey: 'articleId', as: 'article' });
    };

    return ArticleVersion;
};
