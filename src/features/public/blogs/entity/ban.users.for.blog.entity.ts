import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { BlogEntity } from './blog.entity';

@Entity()
export class BanUsersForBlogEntity {
  @PrimaryColumn()
  blogId: string;
  @PrimaryColumn()
  userId: string;
  @Column()
  isBanned: boolean;
  @Column()
  banReason: string;
  @Column()
  banDate: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @ManyToOne(() => BlogEntity)
  blog: BlogEntity;
}
