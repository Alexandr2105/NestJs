import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BanUsersDocument = BanUsers & Document;

@Schema()
export class BanUsers {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ required: true })
  banReason: string;
  @Prop({ required: true })
  banDate: string;
}

export const BunUserSchema = SchemaFactory.createForClass(BanUsers);
