import { Transform } from 'class-transformer';

export class PairQuizGameDto {
  @Transform(({ value }) => value.trim())
  answer: string;
}
