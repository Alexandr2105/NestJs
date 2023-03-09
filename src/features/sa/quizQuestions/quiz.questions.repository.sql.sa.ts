import { IQuizQuestionsRepositorySa } from './i.quiz.questions.repository.sa';
import { QuestionDocument } from './schema/question.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class QuizQuestionsRepositorySqlSa extends IQuizQuestionsRepositorySa {
  constructor(
    @InjectModel('quizQuestions')
    private readonly quizQuestion: Model<QuestionDocument>,
  ) {
    super();
  }
  async getQuestion(id: string) {
    // return this.quizQuestion.findOne({ id: id });
  }

  getQuestionAllParameters(id: string) {}

  async save(question: QuestionDocument) {}

  async deleteQuestionById(id: string) {}
}
