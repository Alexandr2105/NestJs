import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';

@Entity()
export class StatisticGamesEntity {
  @PrimaryColumn()
  userId: string;
  @Column()
  login: string;
  @Column()
  sumScore: number;
  @Column()
  avgScores: number;
  @Column()
  gamesCount: number;
  @Column()
  winsCount: number;
  @Column()
  lossesCount: number;
  @Column()
  drawsCount: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  user: UserEntity;
}
