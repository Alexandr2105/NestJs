import { IQuizQuestionsRepositorySa } from './i.quiz.questions.repository.sa';
import { QuestionDocument } from './schema/question.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class QuizQuestionsRepositoryMongoSa extends IQuizQuestionsRepositorySa {
  constructor(
    @InjectModel('quizQuestions')
    private readonly quizQuestion: Model<QuestionDocument>,
  ) {
    super();
  }
  async getQuestion(id: string) {
    return this.quizQuestion.findOne({ id: id }).select('-_id -__v');
  }

  async getQuestionAllParameters(id: string) {
    return this.quizQuestion.findOne({ id: id });
  }

  async save(question: QuestionDocument) {
    await question.save();
  }

  async deleteQuestionById(id: string): Promise<boolean> {
    const result = await this.quizQuestion.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async getRandomQuestions(count: number) {
    const randomQuestionsAll = await this.quizQuestion.aggregate([
      { $sample: { size: count } },
    ]);
    const randomQuestions = [];
    const correctAnswers = [];
    for (const a of randomQuestionsAll) {
      randomQuestions.push({ id: a.id, body: a.body });
      correctAnswers.push(a.correctAnswers);
    }
    return { randomQuestions, correctAnswers };
  }
}
