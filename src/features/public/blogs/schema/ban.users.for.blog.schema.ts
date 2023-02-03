import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BanUsersForBlogDocument = BanUsersForBlog & Document;

@Schema()
export class BanUsersForBlog {
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ required: true })
  banReason: string;
  @Prop({ required: true })
  banDate: string;
}

export const BanUsersForBlogSchema =
  SchemaFactory.createForClass(BanUsersForBlog);
