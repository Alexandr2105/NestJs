import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class CountAttemptEntity {
  @PrimaryColumn()
  ip: string;
  @Column()
  iat: number;
  @Column()
  method: string;
  @Column()
  originalUrl: string;
  @Column()
  countAttempt: number;
}
