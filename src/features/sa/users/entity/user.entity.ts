import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BlogEntity } from '../../../public/blogs/entity/blog.entity';
import { PostEntity } from '../../../public/posts/entity/post.entity';
import { CommentEntity } from '../../../public/comments/entity/comment.entity';
import { LikeStatusEntity } from '../../../../common/entity/like.status.entity';
import { RefreshTokenDataEntity } from '../../../../common/entity/refresh.token.data.entities';
import { BanUsersForBlogEntity } from '../../../public/blogs/entity/ban.users.for.blog.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  login: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @Column()
  ban: boolean;

  @OneToMany(() => BlogEntity, (b) => b.user, { onDelete: 'CASCADE' })
  blogs: BlogEntity[];
  @OneToMany(() => PostEntity, (p) => p.user, { onDelete: 'CASCADE' })
  posts: PostEntity[];
  @OneToMany(() => CommentEntity, (c) => c.user, { onDelete: 'CASCADE' })
  comments: CommentEntity[];
  @OneToMany(() => LikeStatusEntity, (l) => l.user, { onDelete: 'CASCADE' })
  likeStatus: LikeStatusEntity[];
  @OneToMany(() => RefreshTokenDataEntity, (r) => r.user, {
    onDelete: 'CASCADE',
  })
  device: RefreshTokenDataEntity[];
  @OneToMany(() => BanUsersForBlogEntity, (banBlog) => banBlog.user, {
    onDelete: 'CASCADE',
  })
  banInfoForBlogs: BanUsersForBlogEntity[];
}
