import { IQuizQuestionsRepositorySa } from './i.quiz.questions.repository.sa';
import { QuestionDocument } from './schema/question.schema';

export class QuizQuestionsRepositoryTypeormSa extends IQuizQuestionsRepositorySa {
  constructor() {
    super();
  }

  async getQuestion(questionId: string) {}

  async save(question: QuestionDocument) {}

  async deleteQuestionById(id: string) {}
}
