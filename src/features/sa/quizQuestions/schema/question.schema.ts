import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsArray } from 'class-validator';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  body: string;
  @Prop({ required: true })
  @IsArray()
  correctAnswers: string[];
  @Prop({ required: true })
  published: false;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  updatedAt: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
