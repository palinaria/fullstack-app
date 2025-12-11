import { DataTypes } from "sequelize";
import { sequelize } from "../services/db.js";

const Workspace = sequelize.define("Workspace", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

});

module.exports = Workspace;
