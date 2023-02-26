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

  @OneToMany(() => BlogEntity, (b) => b.user)
  blogs: BlogEntity[];
  @OneToMany(() => PostEntity, (p) => p.user)
  posts: PostEntity[];
  @OneToMany(() => CommentEntity, (c) => c.user)
  comments: CommentEntity[];
  @OneToMany(() => LikeStatusEntity, (l) => l.user)
  likeStatus: LikeStatusEntity[];
  @OneToMany(() => RefreshTokenDataEntity, (r) => r.user)
  device: RefreshTokenDataEntity[];
  @OneToMany(() => BanUsersForBlogEntity, (banBlog) => banBlog.user)
  banInfoForBlogs: BanUsersForBlogEntity[];
}
