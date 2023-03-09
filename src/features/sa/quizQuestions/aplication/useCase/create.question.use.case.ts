import { QuizQuestionsDto } from '../../dto/quiz.questions.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { IQuizQuestionsRepositorySa } from '../../i.quiz.questions.repository.sa';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schema/question.schema';

export class CreateQuestionCommand {
  constructor(public body: QuizQuestionsDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase {
  constructor(
    private readonly quizRepository: IQuizQuestionsRepositorySa,
    @InjectModel('quizQuestions')
    private readonly quizQuestion: Model<QuestionDocument>,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<Question> {
    const newQuestion = new this.quizQuestion(command.body);
    newQuestion.id = +new Date() + '';
    newQuestion.published = false;
    newQuestion.createdAt = new Date().toISOString();
    newQuestion.updatedAt = null;
    await this.quizRepository.save(newQuestion);
    return newQuestion;
  }
}
