import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './app.config';
import { User } from '../entities/User';
import { Session } from '../entities/Session';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: 3306,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  entities: [User, Session],
  synchronize: false,
  logging: false,
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
});
