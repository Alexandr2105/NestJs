import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsArray } from 'class-validator';

export type PairQuizGameDocument = PairQuizGame & Document;

@Schema()
export class PairQuizGame {
  @Prop({ required: true })
  gameId: string;
  @Prop({ required: true })
  playerId1: string;
  @Prop({ required: true })
  playerLogin1: string;
  @IsArray()
  @Prop({ default: null })
  answersPlayer1: [
    {
      questionId: string;
      answerStatus: 'Correct' | 'Incorrect';
      addedAt: string;
    },
  ];
  @Prop({ required: true })
  scorePlayer1: number;
  @Prop({ default: null })
  playerId2: string;
  @Prop({ default: null })
  playerLogin2: string;
  @IsArray()
  @Prop({ default: null })
  answersPlayer2: [
    {
      questionId: string;
      answerStatus: 'Correct' | 'Incorrect';
      addedAt: string;
    },
  ];
  @Prop({ default: null })
  scorePlayer2: number;
  @IsArray()
  @Prop({ default: null })
  questions: [
    {
      id: string;
      body: string;
    },
  ];
  @Prop({ default: null })
  allAnswers: any[];
  @Prop({ required: true })
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';
  @Prop({ required: true })
  pairCreatedDate: string;
  @Prop({ default: null })
  startGameDate: string;
  @Prop({ default: null })
  finishGameDate: string;
  @Prop({ default: 0 })
  playerCount1: number;
  @Prop({ default: 0 })
  playerCount2: number;
}

export const PairQuizGameSchema = SchemaFactory.createForClass(PairQuizGame);
