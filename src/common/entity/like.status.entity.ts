import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../features/sa/users/entity/user.entity';

@Entity()
export class LikeStatusEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  userId: string;
  @Column()
  login: string;
  @Column()
  status: string;
  @Column()
  createDate: string;

  @ManyToOne(() => UserEntity, (u) => u.likeStatus, { onDelete: 'CASCADE' })
  user: UserEntity;
}
