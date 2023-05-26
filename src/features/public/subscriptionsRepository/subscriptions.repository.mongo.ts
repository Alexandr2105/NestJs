import { ISubscriptionsRepository } from './i.subscriptions.repository';
import { Injectable } from '@nestjs/common';
import { SubscriptionsForBlogDocument } from '../blogs/schema/subscriptions.for.blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubscriptionsRepositoryMongo extends ISubscriptionsRepository {
  constructor(
    @InjectModel('subscriptionsForBlog')
    private readonly subscriptionsCollection: Model<SubscriptionsForBlogDocument>,
  ) {
    super();
  }

  async getSubscriptionFromBlogIdAndUserId(blogId: string, userId: string) {
    return this.subscriptionsCollection.findOne({
      blogId: blogId,
      userId: userId,
    });
  }

  async getSubscriptionsCountFromBlogId(blogId: string) {
    const subscriptions = await this.subscriptionsCollection.find({
      blogId: blogId,
    });
    return subscriptions.length;
  }

  async getSubscriptionsFromBlogId(blogId: string) {
    return this.subscriptionsCollection
      .find({
        blogId: blogId,
        status: 'Subscribed',
      })
      .select('userId');
  }

  async saveSubscription(subscriptions: SubscriptionsForBlogDocument) {
    await subscriptions.save();
  }
}
