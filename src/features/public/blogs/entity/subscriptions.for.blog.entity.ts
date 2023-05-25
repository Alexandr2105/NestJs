import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../../sa/users/entity/user.entity';
import { BlogEntity } from './blog.entity';

@Entity()
export class SubscriptionsForBlogEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  blogId: string;
  @Column()
  userId: string;
  @Column()
  subscriptionDate: string;
  @Column()
  status: 'Subscribed' | 'Unsubscribed' | 'None';
  @Column({ default: null })
  unsubscriptionDate: string;

  @ManyToOne(() => UserEntity, (u) => u.subscriptions, { onDelete: 'CASCADE' })
  user: UserEntity;
  @ManyToOne(() => BlogEntity, (b) => b.subscriptions, { onDelete: 'CASCADE' })
  blog: BlogEntity;
}
