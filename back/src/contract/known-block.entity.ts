import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class KnownBlockEntity {
  @PrimaryColumn()
  block: string;
}
