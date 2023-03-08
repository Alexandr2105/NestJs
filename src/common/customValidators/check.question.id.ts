import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IQuizQuestionsRepositorySa } from '../../features/sa/quizQuestions/i.quiz.questions.repository.sa';

@ValidatorConstraint({ async: true })
@Injectable()
export class CheckQuestionId implements ValidatorConstraintInterface {
  constructor(
    private readonly questionRepository: IQuizQuestionsRepositorySa,
  ) {}

  async validate(id: string): Promise<boolean> {
    const result = await this.questionRepository.getQuestion(id);
    if (!result) throw new NotFoundException();
    return true;
  }
}
