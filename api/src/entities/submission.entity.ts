import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column()
  @Expose()
  username!: string;

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
