import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './app.config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: 3306,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  entities: ["src/**/*.entity{.ts,.js}"],
  synchronize: false,
  logging: false,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
});
