import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  Length,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckQuestionId } from '../../../../common/customValidators/check.question.id';
import { CheckArrayCorrectAnswer } from '../../../../common/customValidators/check.array.correct.answer';

export class QuizQuestionsDto {
  @Transform(({ value }) => value.trim())
  @Length(10, 500)
  body: string;
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(CheckArrayCorrectAnswer)
  correctAnswers: [];
}

export class QuizQuestionCheckId {
  @Validate(CheckQuestionId)
  id: string;
}

export class QuizQuestionCheckStatus {
  @IsBoolean()
  published: boolean;
}
