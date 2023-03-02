import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
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
  @Column({ default: null })
  postId: string;
  @Column({ default: null })
  commentId: string;

  @ManyToOne(() => UserEntity, (u) => u.likeStatus, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => PostEntity, (p) => p.likeStatus, { onDelete: 'CASCADE' })
  post: PostEntity;
  @ManyToOne(() => CommentEntity, (c) => c.likeStatus, { onDelete: 'CASCADE' })
  comment: CommentEntity;
}
