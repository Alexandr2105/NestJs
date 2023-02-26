import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { BlogEntity } from '../../blogs/entity/blog.entity';
import { CommentEntity } from '../../comments/entity/comment.entity';

@Entity()
export class PostEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  blogId: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.posts)
  user: UserEntity;
  @ManyToOne(() => BlogEntity, (b) => b.posts)
  blog: BlogEntity;
  @OneToMany(() => CommentEntity, (c) => c.post)
  comments: CommentEntity[];
}
