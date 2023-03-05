import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class BanUsersEntity {
  @PrimaryColumn()
  userId: string;
  @Column()
  isBanned: boolean;
  @Column()
  banReason: string;
  @Column()
  banDate: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}
