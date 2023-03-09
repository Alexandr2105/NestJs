import { CommandHandler } from '@nestjs/cqrs';
import { IQuizQuestionsRepositorySa } from '../../i.quiz.questions.repository.sa';

export class UpdateStatusForQuestionSaCommand {
  constructor(public id: string, public status: boolean) {}
}

@CommandHandler(UpdateStatusForQuestionSaCommand)
export class UpdateStatusForQuestionSaUseCase {
  constructor(
    private readonly questionRepository: IQuizQuestionsRepositorySa,
  ) {}

  async execute(command: UpdateStatusForQuestionSaCommand) {
    const question = await this.questionRepository.getQuestionAllParameters(
      command.id,
    );
    question.published = command.status;
    question.updatedAt = new Date().toISOString();
    return this.questionRepository.save(question);
  }
}
