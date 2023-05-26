import { ISubscriptionsRepository } from './i.subscriptions.repository';
import { Injectable } from '@nestjs/common';
import { SubscriptionsForBlogDocument } from '../blogs/schema/subscriptions.for.blog.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsForBlogEntity } from '../blogs/entity/subscriptions.for.blog.entity';

@Injectable()
export class SubscriptionsRepositoryTypeorm extends ISubscriptionsRepository {
  constructor(
    @InjectRepository(SubscriptionsForBlogEntity)
    private readonly subscription: Repository<SubscriptionsForBlogEntity>,
  ) {
    super();
  }

  async getSubscriptionFromBlogIdAndUserId(blogId: string, userId: string) {
    return this.subscription.findOneBy({ blogId: blogId, userId: userId });
  }

  async getSubscriptionsCountFromBlogId(blogId: string) {
    const subscriptions = await this.subscription.findBy({
      blogId: blogId,
      status: 'Subscribed',
    });
    return subscriptions.length;
  }

  async getSubscriptionsFromBlogId(blogId: string) {
    return await this.subscription.find({
      where: { blogId: blogId, status: 'Subscribed' },
      select: { userId: true },
    });
  }

  async saveSubscription(subscriptions: SubscriptionsForBlogDocument) {
    await this.subscription.save(subscriptions);
  }
}
