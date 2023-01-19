import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikesModelDocument = LikesModel & Document;

@Schema()
export class LikesModel {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  status: string;
  @Prop({ required: true })
  createDate: string;
}

export const LikesTypeSchema = SchemaFactory.createForClass(LikesModel);
