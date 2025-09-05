import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from './app.config';

const baseDir = process.env.NODE_ENV == 'production' ? 'dist' : 'src';

console.log('Database Host:', config.database.host);
console.log('Database User:', config.database.user);
console.log('Database Name:', config.database.database);

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: 3306,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  entities: [`${baseDir}/**/*.entity{.ts,.js}`],
  synchronize: false,
  logging: false,
  migrations: [`${baseDir}/migrations/*.{ts,js}`],
  migrationsTableName: 'migrations',
});
