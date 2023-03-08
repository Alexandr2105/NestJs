import { CommandHandler } from '@nestjs/cqrs';
import { IQuizQuestionsRepositorySa } from '../../i.quiz.questions.repository.sa';

export class DeleteQuestionSaCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionSaCommand)
export class DeleteQuestionSaUseCase {
  constructor(
    private readonly questionRepository: IQuizQuestionsRepositorySa,
  ) {}

  async execute(command: DeleteQuestionSaCommand): Promise<boolean> {
    return await this.questionRepository.deleteQuestionById(command.questionId);
  }
}
