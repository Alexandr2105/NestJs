import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { PostEntity } from '../../posts/entity/post.entity';
import { BanUsersForBlogEntity } from './ban.users.for.blog.entity';

@Entity()
export class BlogEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  websiteUrl: string;
  @Column()
  description: string;
  @Column()
  createdAt: string;
  @Column()
  userId: string;
  @Column()
  banStatus: boolean;
  @Column()
  banDate: string;
  @Column()
  isMembership: boolean;

  @OneToMany(() => PostEntity, (p) => p.user)
  posts: PostEntity[];
  @ManyToOne(() => UserEntity, (u) => u.blogs)
  user: UserEntity;
  @OneToMany(() => BanUsersForBlogEntity, (banBlog) => banBlog.blog)
  banInfoForBlogs: BanUsersForBlogEntity[];
}
