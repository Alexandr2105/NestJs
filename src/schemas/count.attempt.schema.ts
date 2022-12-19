import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountAttemptDocument = CountAttempt & Document;

@Schema()
export class CountAttempt {
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  iat: number;
  @Prop({ required: true })
  method: string;
  @Prop({ required: true })
  originalUrl: string;
  @Prop({ required: true })
  countAttempt: number;
}

export const CountAttemptSchema = SchemaFactory.createForClass(CountAttempt);
