import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import config from '../config/app.config';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column({ unique: true })
  @Expose()
  username!: string;

  @Column({ unique: true })
  @Expose()
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: config.roles.USER })
  @Expose()
  role!: string;

  @Column()
  @Expose()
  firstName!: string;

  @Column()
  @Expose()
  lastName!: string;
}
