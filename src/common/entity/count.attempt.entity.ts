import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class CountAttemptEntity {
  @PrimaryColumn()
  ip: string;
  @Column()
  iat: string;
  @Column()
  method: string;
  @Column()
  originalUrl: string;
  @Column()
  countAttempt: number;
}
