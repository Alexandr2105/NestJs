import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionsForBlogDocument = SubscriptionsForBlog & Document;

@Schema()
export class SubscriptionsForBlog {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  subscriptionDate: string;
  @Prop({ required: true })
  status: 'Subscribed' | 'Unsubscribed' | 'None';
  @Prop({ required: false, default: null })
  unsubscriptionDate: string;
}

export const SubscriptionsForBlogSchema =
  SchemaFactory.createForClass(SubscriptionsForBlog);
