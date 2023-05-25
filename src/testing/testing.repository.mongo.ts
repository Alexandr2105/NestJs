import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from '../features/public/blogs/schema/blogs.schema';
import { PostDocument } from '../features/public/posts/schema/posts.schema';
import { CommentDocument } from '../features/public/comments/schema/comment.schema';
import { UserDocument } from '../features/sa/users/schema/user';
import { RefreshTokenDocument } from '../common/schemas/refresh.token.data.schema';
import { EmailConfirmationDocument } from '../common/schemas/email.confirmation.schema';
import { CountAttemptDocument } from '../common/schemas/count.attempt.schema';
import { LikesModelDocument } from '../common/schemas/like.type.schema';
import { BanUsersDocument } from '../features/sa/users/schema/banUsers';
import { BanUsersForBlogDocument } from '../features/public/blogs/schema/ban.users.for.blog.schema';
import { ITestingRepository } from './i.testing.repository';
import { QuestionDocument } from '../features/sa/quizQuestions/schema/question.schema';
import { PairQuizGameDocument } from '../features/public/pairQuizGame/schema/pair.quiz.game.schema';
import { StatisticGamesDocument } from '../features/public/pairQuizGame/schema/statistic.games.schema';
import { ImageModelDocument } from '../common/schemas/image.schema';
import { SubscriptionsForBlogDocument } from '../features/public/blogs/schema/subscriptions.for.blog.schema';

@Injectable()
export class TestingRepositoryMongo extends ITestingRepository {
  constructor(
    @InjectModel('comments')
    private readonly commentsCollection: Model<CommentDocument>,
    @InjectModel('emailConfirmations')
    private readonly registrationUsersCollection: Model<EmailConfirmationDocument>,
    @InjectModel('refreshTokenData')
    private readonly refreshTokenDataCollection: Model<RefreshTokenDocument>,
    @InjectModel('countAttempts')
    private readonly countAttemptCollection: Model<CountAttemptDocument>,
    @InjectModel('likeStatuses')
    private readonly likeInfoCollection: Model<LikesModelDocument>,
    @InjectModel('users') private readonly usersCollection: Model<UserDocument>,
    @InjectModel('posts') private readonly postsCollection: Model<PostDocument>,
    @InjectModel('blogs') private readonly blogsCollection: Model<BlogDocument>,
    @InjectModel('banUsers') private readonly banUsers: Model<BanUsersDocument>,
    @InjectModel('banUsersForBlogs')
    private readonly banUsersForBlogsCollection: Model<BanUsersForBlogDocument>,
    @InjectModel('quizQuestions')
    private readonly questions: Model<QuestionDocument>,
    @InjectModel('infoQuizQuestionsGames')
    private readonly infoQuizQuestionsGames: Model<PairQuizGameDocument>,
    @InjectModel('statisticGames')
    private readonly statisticGames: Model<StatisticGamesDocument>,
    @InjectModel('image')
    private readonly image: Model<ImageModelDocument>,
    @InjectModel('subscriptionsForBlog')
    private readonly subscriptionsForBlog: Model<SubscriptionsForBlogDocument>,
  ) {
    super();
  }
  async deleteAllCollection() {
    await this.blogsCollection.deleteMany({});
    await this.postsCollection.deleteMany({});
    await this.usersCollection.deleteMany({});
    await this.commentsCollection.deleteMany({});
    await this.registrationUsersCollection.deleteMany({});
    await this.refreshTokenDataCollection.deleteMany({});
    await this.countAttemptCollection.deleteMany({});
    await this.likeInfoCollection.deleteMany({});
    await this.banUsers.deleteMany({});
    await this.banUsersForBlogsCollection.deleteMany({});
    await this.questions.deleteMany({});
    await this.infoQuizQuestionsGames.deleteMany({});
    await this.statisticGames.deleteMany({});
    await this.image.deleteMany({});
    await this.subscriptionsForBlog.deleteMany({});
  }
}
