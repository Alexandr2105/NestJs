import { IQuizQuestionsRepositorySa } from './i.quiz.questions.repository.sa';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QuizQuestionEntity } from './entity/quiz.question.entity';

export class QuizQuestionsRepositorySqlSa extends IQuizQuestionsRepositorySa {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }
  async getQuestion(id: string) {
    const question = await this.dataSource.query(
      `SELECT * FROM public."QuizQuestions"
            WHERE "id"=$1`,
      [id],
    );
    if (question[0]) {
      return question[0];
    } else {
      return false;
    }
  }

  async getQuestionAllParameters(id: string) {
    const question = await this.dataSource.query(
      `SELECT * FROM public."QuizQuestions" 
            WHERE "id"=$1`,
      [id],
    );
    if (question[0]) {
      return question[0];
    } else {
      return false;
    }
  }

  async save(question: QuizQuestionEntity) {
    if (!(await this.getQuestion(question.id))) {
      await this.dataSource.query(
        `INSERT INTO public."QuizQuestions"(
            "id", "body", "correctAnswers","published", "createdAt", "updatedAt")
        VALUES ($1,$2,to_json($3::text[]), $4, $5, $6 )`,
        [
          question.id,
          question.body,
          question.correctAnswers,
          question.published,
          question.createdAt,
          question.updatedAt,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public."QuizQuestions"
            SET "body"=$1, "correctAnswers"=to_json($2::text[]), "published"=$3, "createdAt"=$4, "updatedAt"=$5
            WHERE "id"=$6`,
        [
          question.body,
          question.correctAnswers,
          question.published,
          question.createdAt,
          question.updatedAt,
          question.id,
        ],
      );
    }
  }

  async deleteQuestionById(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public."QuizQuestions"
            WHERE "id"=$1`,
      [id],
    );
    return result[1] === 1;
  }

  async getRandomQuestions(count: number) {
    return this.dataSource.query(
      `SELECT * FROM public."QuizQuestions"
            ORDER BY RAND() 
            LIMIT $1`,
      [count],
    );
  }
}
