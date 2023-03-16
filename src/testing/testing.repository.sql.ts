import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ITestingRepository } from './i.testing.repository';

@Injectable()
export class TestingRepositorySql extends ITestingRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }
  async deleteAllCollection() {
    await this.dataSource.query(`DELETE FROM public."EmailConfirmations"`);
    await this.dataSource.query(`DELETE FROM public."RefreshTokenData"`);
    await this.dataSource.query(`DELETE FROM public."CountAttempts"`);
    await this.dataSource.query(`DELETE FROM public."LikesModel"`);
    await this.dataSource.query(`DELETE FROM public."BanUsers"`);
    await this.dataSource.query(`DELETE FROM public."BanUsersForBlog"`);
    await this.dataSource.query(`DELETE FROM public."Comments"`);
    await this.dataSource.query(`DELETE FROM public."Posts"`);
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
    await this.dataSource.query(`DELETE FROM public."Users"`);
    await this.dataSource.query(`DELETE FROM public."QuizQuestions"`);
    await this.dataSource.query(`DELETE FROM public."PairQuizGame"`);
  }
}
