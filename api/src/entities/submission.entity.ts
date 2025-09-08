import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column()
  @Expose()
  email!: string;

  @Column()
  @Expose()
  firstName!: string;

  @Column()
  @Expose()
  lastName!: string;

  @Column('text')
  @Expose()
  dmspText!: string;

  @Column('text')
  @Expose()
  llmResponse!: string;

  @CreateDateColumn()
  @Expose()
  submittedAt!: Date;
}
