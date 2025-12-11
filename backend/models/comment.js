import { DataTypes } from "sequelize";
import { sequelize } from "../services/db.js";

export const Comment = sequelize.define("Comment", {
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});
