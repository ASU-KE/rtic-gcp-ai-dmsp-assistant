import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import config from '../../config/app.config';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: config.roles.USER })
  role!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;
}
