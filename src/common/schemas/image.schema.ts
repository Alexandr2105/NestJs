import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageModelDocument = ImageModel & Document;

@Schema()
export class ImageModel {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: false })
  postId: string;
  @Prop({ required: true })
  url: string;
  @Prop({ required: true })
  bucket: string;
}

export const ImageSchema = SchemaFactory.createForClass(ImageModel);
