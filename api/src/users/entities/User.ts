import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import config from '../../config';

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

  @Column('int')
  age!: number;

  @Column({ default: config.roles.USER })
  role!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;
}
