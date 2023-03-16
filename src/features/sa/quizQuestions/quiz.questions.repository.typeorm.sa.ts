import { IQuizQuestionsRepositorySa } from './i.quiz.questions.repository.sa';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from './entity/quiz.question.entity';
import { Repository } from 'typeorm';

export class QuizQuestionsRepositoryTypeormSa extends IQuizQuestionsRepositorySa {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private readonly questionsRepository: Repository<QuizQuestionEntity>,
  ) {
    super();
  }

  async getQuestion(questionId: string) {
    return this.questionsRepository.findOne({
      where: { id: questionId },
    });
  }

  getQuestionAllParameters(id: string) {
    return this.questionsRepository.findOne({
      where: { id: id },
    });
  }

  async save(question: QuizQuestionEntity) {
    await this.questionsRepository.save(question);
  }

  async deleteQuestionById(id: string) {
    const result = await this.questionsRepository.delete({ id: id });
    return result.affected === 1;
  }

  async getRandomQuestions(count: number) {
    return this.questionsRepository
      .createQueryBuilder('QuizQuestions')
      .select()
      .orderBy('RANDOM()')
      .take(count)
      .getMany();
  }
}
