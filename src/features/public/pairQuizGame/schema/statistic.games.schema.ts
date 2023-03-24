import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatisticGamesDocument = StatisticGames & Document;

@Schema()
export class StatisticGames {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  sumScore: number;
  @Prop({ required: true })
  avgScores: number;
  @Prop({ required: true })
  gamesCount: number;
  @Prop({ required: true })
  winsCount: number;
  @Prop({ required: true })
  lossesCount: number;
  @Prop({ required: true })
  drawsCount: number;
}

export const StatisticGamesSchema =
  SchemaFactory.createForClass(StatisticGames);
