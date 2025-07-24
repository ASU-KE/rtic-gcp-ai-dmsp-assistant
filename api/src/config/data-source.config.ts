import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import config from './app.config';

const options: DataSourceOptions & SeederOptions = {
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
  migrationsTableName: 'migrations',
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  seedTracking: false,
  factories: ['src/database/factories/**/*{.ts,.js}'],
};

export const AppDataSource = new DataSource(options);
