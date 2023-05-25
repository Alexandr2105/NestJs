import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { PostEntity } from '../../posts/entity/post.entity';
import { BanUsersForBlogEntity } from './ban.users.for.blog.entity';
import { ImageEntity } from '../../../../common/entity/image.entity';
import { SubscriptionsForBlogEntity } from './subscriptions.for.blog.entity';

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
  @Column({ default: null })
  banDate: string;
  @Column()
  isMembership: boolean;

  @OneToMany(() => PostEntity, (p) => p.blog, { onDelete: 'CASCADE' })
  posts: PostEntity[];
  @ManyToOne(() => UserEntity, (u) => u.blogs, { onDelete: 'CASCADE' })
  user: UserEntity;
  @OneToMany(() => BanUsersForBlogEntity, (banBlog) => banBlog.blog, {
    onDelete: 'CASCADE',
  })
  banInfoForBlogs: BanUsersForBlogEntity[];
  @OneToMany(() => ImageEntity, (i) => i.blog, { onDelete: 'CASCADE' })
  image: ImageEntity[];
  @OneToMany(() => SubscriptionsForBlogEntity, (s) => s.blog, {
    onDelete: 'CASCADE',
  })
  subscriptions: SubscriptionsForBlogEntity[];
}
