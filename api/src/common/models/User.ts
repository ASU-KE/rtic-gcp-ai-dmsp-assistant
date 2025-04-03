import { DataTypes } from 'sequelize';
import config from '../../config';

const UserModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: config.roles.USER,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

const UserService = {
  model: null as any,

  initialise: (sequelize: any) => {
    UserService.model = sequelize.define('user', UserModel);
  },

  createUser: (user: any) => {
    return UserService.model.create(user);
  },

  findUser: (query: any) => {
    return UserService.model.findOne({
      where: query,
    });
  },

  updateUser: (query: any, updatedValue: any) => {
    return UserService.model.update(updatedValue, {
      where: query,
    });
  },

  findAllUsers: (query: any) => {
    return UserService.model.findAll({
      where: query,
    });
  },

  deleteUser: (query: any) => {
    return UserService.model.destroy({
      where: query,
    });
  },
};

export default UserService;
