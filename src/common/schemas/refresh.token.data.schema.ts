import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshTokenData & Document;

@Schema()
export class RefreshTokenData {
  @Prop({ required: true })
  iat: number;
  @Prop({ required: true })
  exp: number;
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceName: string | undefined;
  @Prop({ required: true })
  userId: string;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenData);
