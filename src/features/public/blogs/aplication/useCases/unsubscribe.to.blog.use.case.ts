import { CommandHandler } from '@nestjs/cqrs';
import { ISubscriptionsRepository } from '../../../subscriptionsRepository/i.subscriptions.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionsForBlogDocument } from '../../schema/subscriptions.for.blog.schema';

export class UnsubscribeToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(UnsubscribeToBlogCommand)
export class UnsubscribeToBlogUseCase {
  constructor(
    private readonly subscriptionsRepository: ISubscriptionsRepository,
    @InjectModel('subscriptionsForBlog')
    private readonly subscriptions: Model<SubscriptionsForBlogDocument>,
  ) {}
  async execute(command: UnsubscribeToBlogCommand) {
    const subscription =
      await this.subscriptionsRepository.getSubscriptionFromBlogIdAndUserId(
        command.blogId,
        command.userId,
      );
    if (subscription) {
      subscription.status = 'Unsubscribed';
      subscription.unsubscriptionDate = new Date().toISOString();
      await this.subscriptionsRepository.saveSubscription(subscription);
    }
  }
}
