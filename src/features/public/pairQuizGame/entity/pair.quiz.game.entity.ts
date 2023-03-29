import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';

@Entity()
export class PairQuizGameEntity {
  @PrimaryColumn()
  gameId: string;
  @Column()
  playerId1: string;
  @Column()
  playerLogin1: string;
  @Column('json', { default: null })
  answersPlayer1: [
    {
      questionId: string;
      answerStatus: 'Correct' | 'Incorrect';
      addedAt: string;
    },
  ];
  @Column()
  scorePlayer1: number;
  @Column({ default: null })
  playerId2: string;
  @Column({ default: null })
  playerLogin2: string;
  @Column('json', { default: null })
  answersPlayer2: [
    {
      questionId: string;
      answerStatus: 'Correct' | 'Incorrect';
      addedAt: string;
    },
  ];
  @Column({ default: null })
  scorePlayer2: number;
  @Column('json', { default: null })
  questions: [
    {
      id: string;
      body: string;
    },
  ];
  @Column('json', { default: null })
  allAnswers: any[];
  @Column()
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';
  @Column()
  pairCreatedDate: string;
  @Column({ default: null })
  startGameDate: string;
  @Column({ default: null })
  finishGameDate: string;
  @Column({ default: 0 })
  playerCount1: number;
  @Column({ default: 0 })
  playerCount2: number;
  @Column({ default: 0 })
  timerId: number;

  @ManyToOne(() => UserEntity, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerId1', referencedColumnName: 'id' })
  user: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerId2', referencedColumnName: 'id' })
  user2: UserEntity;
}
