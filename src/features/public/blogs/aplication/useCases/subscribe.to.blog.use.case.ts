import { CommandHandler } from '@nestjs/cqrs';
import { ISubscriptionsRepository } from '../../../subscriptionsRepository/i.subscriptions.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import { SubscriptionsForBlogDocument } from '../../schema/subscriptions.for.blog.schema';

export class SubscribeToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase {
  constructor(
    private readonly subscriptionsRepository: ISubscriptionsRepository,
    @InjectModel('subscriptionsForBlog')
    private readonly subscriptions: Model<SubscriptionsForBlogDocument>,
  ) {}
  async execute(command: SubscribeToBlogCommand) {
    const subscription =
      await this.subscriptionsRepository.getSubscriptionFromBlogIdAndUserId(
        command.blogId,
        command.userId,
      );
    if (!subscription) {
      const newSubscription = new this.subscriptions();
      newSubscription.id = uuid4();
      newSubscription.blogId = command.blogId;
      newSubscription.userId = command.userId;
      newSubscription.subscriptionDate = new Date().toISOString();
      newSubscription.status = 'Subscribed';
      await this.subscriptionsRepository.saveSubscription(newSubscription);
    } else {
      subscription.status = 'Subscribed';
      subscription.subscriptionDate = new Date().toISOString();
      subscription.unsubscriptionDate = null;
      await this.subscriptionsRepository.saveSubscription(subscription);
    }
  }
}
