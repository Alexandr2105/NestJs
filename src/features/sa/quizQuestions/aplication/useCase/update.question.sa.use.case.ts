import { QuizQuestionsDto } from '../../dto/quiz.questions.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { IQuizQuestionsRepositorySa } from '../../i.quiz.questions.repository.sa';

export class UpdateQuestionSaCommand {
  constructor(public body: QuizQuestionsDto, public questionId: string) {}
}

@CommandHandler(UpdateQuestionSaCommand)
export class UpdateQuestionSaUseCase {
  constructor(
    private readonly questionRepository: IQuizQuestionsRepositorySa,
  ) {}

  async execute(command: UpdateQuestionSaCommand): Promise<boolean> {
    const question = await this.questionRepository.getQuestionAllParameters(
      command.questionId,
    );
    question.body = command.body.body;
    question.correctAnswers = command.body.correctAnswers;
    question.updatedAt = new Date().toISOString();
    return await this.questionRepository.save(question);
  }
}
