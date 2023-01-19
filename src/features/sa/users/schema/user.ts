import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  public id: string;
  @Prop({ required: true })
  public login: string;
  @Prop({ required: true })
  public password: string;
  @Prop({ required: true })
  public email: string;
  @Prop({ required: true })
  public createdAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
