import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { PostEntity } from '../../posts/entity/post.entity';
import { LikeStatusEntity } from '../../../../common/entity/like.status.entity';

@Entity()
export class CommentEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  idPost: string;
  @Column()
  content: string;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  createdAt: string;

  @ManyToOne(() => UserEntity, (u) => u.comments, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => PostEntity, (p) => p.comments, { onDelete: 'CASCADE' })
  post: PostEntity;
  @OneToMany(() => LikeStatusEntity, (l) => l.id, { onDelete: 'CASCADE' })
  likeStatus: LikeStatusEntity;
}
