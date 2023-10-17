import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AllowanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  owner: string;
  @Column()
  sender: string;
  @Column()
  value: string;
  @Column()
  block: string;
}
