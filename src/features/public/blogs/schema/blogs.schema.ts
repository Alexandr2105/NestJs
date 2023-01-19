import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema()
export class Blog {
  @Prop({ required: true })
  public id: string;
  @Prop({ required: true })
  public name: string;
  @Prop({ required: true })
  public websiteUrl: string;
  @Prop({ required: true })
  public description: string;
  @Prop({ required: true })
  public createdAt: string;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
