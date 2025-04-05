import { DataTypes, Model, Sequelize } from 'sequelize';
import config from '../../config';

export interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password: string;
  age: number;
  role: string;
  firstName: string;
  lastName: string;
}

export class UserInstance extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public age!: number;
  public role!: string;
  public firstName!: string;
  public lastName!: string;
}

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
  model: null as unknown as typeof UserInstance,

  initialise: (sequelize: Sequelize) => {
    UserService.model = sequelize.define('user', UserModel) as typeof UserInstance;
  },

  createUser: (user: UserAttributes) => {
    return UserService.model.create(user);
  },

  findUser: (query: Partial<UserAttributes>) => {
    return UserService.model.findOne({
      where: query,
    });
  },

  updateUser: (query: Partial<UserAttributes>, updatedValue: Partial<UserAttributes>) => {
    return UserService.model.update(updatedValue, {
      where: query,
    });
  },

  findAllUsers: (query: Partial<UserAttributes>) => {
    return UserService.model.findAll({
      where: query,
    });
  },

  deleteUser: (query: Partial<UserAttributes>) => {
    return UserService.model.destroy({
      where: query,
    });
  },
};

export default UserService;
