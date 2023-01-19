import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  public id: string;
  @Prop({ required: true })
  public title: string;
  @Prop({ required: true })
  public shortDescription: string;
  @Prop({ required: true })
  public content: string;
  @Prop({ required: true })
  public blogId: string;
  @Prop({ required: true })
  public blogName: string;
  @Prop({ required: true })
  public createdAt: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
