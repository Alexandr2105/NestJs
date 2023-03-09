import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  Length,
  MinLength,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckQuestionId } from '../../../../common/customValidators/check.question.id';

export class QuizQuestionsDto {
  @Transform(({ value }) => value.trim())
  @Length(10, 500)
  body: string;
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @MinLength(1, { each: true })
  correctAnswers: string[];
}

export class QuizQuestionCheckId {
  @Validate(CheckQuestionId)
  id: string;
}

export class QuizQuestionCheckStatus {
  @IsBoolean()
  published: boolean;
}
