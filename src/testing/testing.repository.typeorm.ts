import { ITestingRepository } from './i.testing.repository';
import { Repository } from 'typeorm';
import { CommentEntity } from '../features/public/comments/entity/comment.entity';
import { EmailConfirmationEntity } from '../common/entity/email.confirmation.entity';
import { CountAttemptEntity } from '../common/entity/count.attempt.entity';
import { UserEntity } from '../features/sa/users/entity/user.entity';
import { PostEntity } from '../features/public/posts/entity/post.entity';
import { BlogEntity } from '../features/public/blogs/entity/blog.entity';
import { BanUsersEntity } from '../features/sa/users/entity/banUsers.entity';
import { BanUsersForBlogEntity } from '../features/public/blogs/entity/ban.users.for.blog.entity';
import { RefreshTokenDataEntity } from '../common/entity/refresh.token.data.entities';
import { LikeStatusEntity } from '../common/entity/like.status.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../features/sa/quizQuestions/entity/quiz.question.entity';
import { PairQuizGameEntity } from '../features/public/pairQuizGame/entity/pair.quiz.game.entity';
import { StatisticGamesEntity } from '../features/public/pairQuizGame/entity/statistic.games.entity';

@Injectable()
export class TestingRepositoryTypeorm extends ITestingRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsCollection: Repository<CommentEntity>,
    @InjectRepository(EmailConfirmationEntity)
    private readonly registrationUsersCollection: Repository<EmailConfirmationEntity>,
    @InjectRepository(RefreshTokenDataEntity)
    private readonly refreshTokenDataCollection: Repository<RefreshTokenDataEntity>,
    @InjectRepository(CountAttemptEntity)
    private readonly countAttemptCollection: Repository<CountAttemptEntity>,
    @InjectRepository(LikeStatusEntity)
    private readonly likeInfoCollection: Repository<LikeStatusEntity>,
    @InjectRepository(UserEntity)
    private readonly usersCollection: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postsCollection: Repository<PostEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogsCollection: Repository<BlogEntity>,
    @InjectRepository(BanUsersEntity)
    private readonly banUsers: Repository<BanUsersEntity>,
    @InjectRepository(BanUsersForBlogEntity)
    private readonly banUsersForBlogsCollection: Repository<BanUsersForBlogEntity>,
    @InjectRepository(QuizQuestionEntity)
    private readonly questions: Repository<QuizQuestionEntity>,
    @InjectRepository(PairQuizGameEntity)
    private readonly pairQuizGameEntity: Repository<PairQuizGameEntity>,
    @InjectRepository(StatisticGamesEntity)
    private readonly statisticGames: Repository<StatisticGamesEntity>,
  ) {
    super();
  }

  async deleteAllCollection() {
    await this.registrationUsersCollection.query(
      `DELETE FROM public."email_confirmation_entity"`,
    );
    await this.usersCollection.query(`DELETE FROM public."user_entity"`);
    await this.refreshTokenDataCollection.query(
      `DELETE FROM public."refresh_token_data_entity"`,
    );
    await this.countAttemptCollection.query(
      `DELETE FROM public."count_attempt_entity"`,
    );
    await this.likeInfoCollection.query(
      `DELETE FROM public."like_status_entity"`,
    );
    await this.banUsers.query(`DELETE FROM public."ban_users_entity"`);
    await this.banUsersForBlogsCollection.query(
      `DELETE FROM public."ban_users_for_blog_entity"`,
    );
    await this.commentsCollection.query(`DELETE FROM public."comment_entity"`);
    await this.postsCollection.query(`DELETE FROM public."post_entity"`);
    await this.blogsCollection.query(`DELETE FROM public."blog_entity"`);
    await this.questions.query(`DELETE FROM public."quiz_question_entity"`);
    await this.pairQuizGameEntity.query(
      `DELETE FROM public."pair_quiz_game_entity"`,
    );
    await this.statisticGames.query(
      `DELETE FROM public."statistic_games_entity"`,
    );
  }
}
