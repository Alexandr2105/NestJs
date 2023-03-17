import { Transform } from 'class-transformer';
import { Length } from 'class-validator';

export class PairQuizGameDto {
  @Transform(({ value }) => value.toString().trim())
  answer: string | number;
}

export class CheckGameIdDto {
  @Transform(({ value }) => value.trim())
  @Length(13)
  id: string;
}
