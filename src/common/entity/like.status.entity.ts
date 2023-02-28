import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../features/sa/users/entity/user.entity';
import { PostEntity } from '../../features/public/posts/entity/post.entity';
import { CommentEntity } from '../../features/public/comments/entity/comment.entity';

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
  @ManyToOne(() => PostEntity, (p) => p.id, { onDelete: 'CASCADE' })
  post: PostEntity;
  @ManyToOne(() => CommentEntity, (c) => c.id, { onDelete: 'CASCADE' })
  comment: CommentEntity;
}
