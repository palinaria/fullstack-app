import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../services/db.js';

export class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  }
);
