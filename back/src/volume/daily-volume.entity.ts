import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DailyVolumeEntity {
  @PrimaryColumn()
  date: Date;
  @Column()
  transactions: number;
  @Column()
  amount: string;
}
