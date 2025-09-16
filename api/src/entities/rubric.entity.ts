import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FundingAgency {
  NSF = 'NSF',
  DOE = 'DOE',
  DOD = 'DOD',
  NIH = 'NIH',
  NASA = 'NASA',
  NOAA = 'NOAA',
  USDA = 'USDA',
  USGS = 'USGS',
}

@Entity()
export class Rubric {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column({
    type: 'enum',
    enum: FundingAgency,
    unique: true,
  })
  @Expose()
  agency!: FundingAgency;

  @Column('text')
  @Expose()
  rubricText!: string;

  @CreateDateColumn()
  @Expose()
  createdAt!: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt!: Date;
}
