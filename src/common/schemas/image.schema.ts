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
  @Prop({ required: true })
  key: string;
  @Prop({ required: true })
  width: number;
  @Prop({ required: true })
  height: number;
  @Prop({ required: true })
  fileSize: number;
  @Prop({ required: true })
  folderName: string;
}

export const ImageSchema = SchemaFactory.createForClass(ImageModel);
