import { ISubscriptionsRepository } from './i.subscriptions.repository';
import { Injectable } from '@nestjs/common';
import { SubscriptionsForBlogDocument } from '../blogs/schema/subscriptions.for.blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SubscriptionsRepositorySql extends ISubscriptionsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async getSubscriptionFromBlogIdAndUserId(blogId: string, userId: string) {
    const info = await this.dataSource.query(
      `SELECT * FROM public."SubscriptionsForBlog"
            WHERE "blogId"=$1 AND "userId"=$2`,
      [blogId, userId],
    );
    return info[0];
  }

  async getSubscriptionsCountFromBlogId(blogId: string) {
    const info = await this.dataSource.query(
      `SELECT * FROM public."SubscriptionsForBlog"
            WHERE "blogId"=$1 AND "status"='Subscribed'`,
      [blogId],
    );
    return info.length;
  }

  async getSubscriptionsFromBlogId(blogId: string) {
    return this.dataSource.query(
      `SELECT "userId" FROM public."SubscriptionsForBlog"
            WHERE "blogId"=$1 AND "status"='Subscribed'`,
      [blogId],
    );
  }

  async getSubscriptionsFromId(id: string) {
    return this.dataSource.query(
      `SELECT "userId" FROM public."SubscriptionsForBlog"
            WHERE "id"=$1`,
      [id],
    );
  }

  async saveSubscription(subscriptions: SubscriptionsForBlogDocument) {
    if ((await this.getSubscriptionsFromId(subscriptions.id)).length === 0) {
      await this.dataSource.query(
        `INSERT INTO public."SubscriptionsForBlog"
           ("id", "blogId", "userId", "subscriptionDate", "status", "unsubscriptionDate")
            VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          subscriptions.id,
          subscriptions.blogId,
          subscriptions.userId,
          subscriptions.subscriptionDate,
          subscriptions.status,
          subscriptions.unsubscriptionDate,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."SubscriptionsForBlog"
              SET "blogId"=$1,"userId"=$2,"subscriptionDate"=$3,"status"=$4,"unsubscriptionDate"=$5
        WHERE "id"=$6`,
        [
          subscriptions.blogId,
          subscriptions.userId,
          subscriptions.subscriptionDate,
          subscriptions.status,
          subscriptions.unsubscriptionDate,
          subscriptions.id,
        ],
      );
    }
  }
}
