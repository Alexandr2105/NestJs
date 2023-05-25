import { SubscriptionsForBlogDocument } from '../blogs/schema/subscriptions.for.blog.schema';

export abstract class ISubscriptionsRepository {
  abstract getSubscriptionFromBlogIdAndUserId(blogId: string, userId: string);
  abstract getSubscriptionsCountFromBlogId(blogId: string);
  abstract getSubscriptionsFromBlogId(blogId: string, status: string);
  abstract saveSubscription(subscriptions: SubscriptionsForBlogDocument);
}
