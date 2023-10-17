import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransferEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  from: string;
  @Column()
  to: string;
  @Column()
  value: string;
  @Column()
  block: string;
}
