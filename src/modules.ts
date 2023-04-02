import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/public/blogs/blogs.controller';
import { QueryRepositoryMongo } from './features/public/queryReposytories/query.repository.mongo';
import { BlogsRepositoryMongo } from './features/public/blogs/blogs.repository.mongo';
import { QueryCount } from './common/helper/query.count';
import { PostsController } from './features/public/posts/posts.controller';
import { PostsRepositoryMongo } from './features/public/posts/posts.repository.mongo';
import { UsersController } from './features/sa/users/users.controller';
import { UsersService } from './features/sa/users/application/users.service';
import { UsersRepositoryMongo } from './features/sa/users/users.repository.mongo';
import { CommentsController } from './features/public/comments/comments.controller';
import { CommentsService } from './features/public/comments/application/comments.service';
import { CommentsRepositoryMongo } from './features/public/comments/comments.repostitory.mongo';
import { TestingController } from './testing/testing.controller';
import { TestingRepositoryMongo } from './testing/testing.repository.mongo';
import { AuthController } from './features/public/auth/auth.controller';
import { Jwt } from './features/public/auth/jwt';
import { EmailManager } from './common/manager/email-manager';
import { EmailAdapter } from './common/adapters/email-adapter';
import { SecurityDevicesService } from './features/public/securityDevices/application/security-devices.service';
import { SecurityDevicesRepositoryMongo } from './features/public/securityDevices/security.devices.repository.mongo';
import { BlogSchema } from './features/public/blogs/schema/blogs.schema';
import { PostSchema } from './features/public/posts/schema/posts.schema';
import { CommentSchema } from './features/public/comments/schema/comment.schema';
import { UserSchema } from './features/sa/users/schema/user';
import { SecurityDevicesController } from './features/public/securityDevices/security.devices.controller';
import { RefreshTokenSchema } from './common/schemas/refresh.token.data.schema';
import { EmailConfirmationSchema } from './common/schemas/email.confirmation.schema';
import { CountAttemptSchema } from './common/schemas/count.attempt.schema';
import { LikesTypeSchema } from './common/schemas/like.type.schema';
import { AuthRepositoryMongo } from './features/public/auth/auth.repository.mongo';
import { CheckBlogIdForBlog } from './common/customValidators/check.blog.id.for.blog';
import { CheckLikeStatus } from './common/customValidators/check.like.status';
import { BasicStrategy } from './common/strategies/basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './common/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { RefreshStrategy } from './common/strategies/refresh.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { CheckUserForComments } from './common/customValidators/check.user.for.comments';
import { CheckUserSecurityDevice } from './common/customValidators/check.user.security.device';
import { CheckCode } from './common/customValidators/check.code';
import { CheckRecoveryCode } from './common/customValidators/check.recovery.code';
import { CheckEmailConfirmation } from './common/customValidators/check.email.confirmation';
import { CheckOriginalEmail } from './common/customValidators/check.origin.email';
import { CheckOriginalLogin } from './common/customValidators/check.original.login';
import { CheckIdForBlog } from './common/customValidators/check.id.for.blog';
import { CountAttemptGuard } from './common/guard/count.attempt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateBlogUseCase } from './features/blogger/blogs/application/useCases/create.blog.use.case';
import { DeleteBlogUseCase } from './features/blogger/blogs/application/useCases/delete.blog.use.case';
import { GetBlogIdSpecialUseCase } from './features/public/blogs/aplication/useCases/get.blog.id.special.use.case';
import { UpdateBlogUseCase } from './features/blogger/blogs/application/useCases/update.blog.use.case';
import { CreateUserUseCase } from './features/sa/users/application/useCases/create.user.use.case';
import { BlogsControllerBlogger } from './features/blogger/blogs/blogs.controller.blogger';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdatePostByIdUseCase } from './features/blogger/blogs/application/useCases/update.post.by.id.use.case';
import { DeletePostByIdUseCase } from './features/blogger/blogs/application/useCases/delete.post.by.id.use.case';
import { GetPostIdUseCase } from './features/public/posts/application/useCase/get.post.id.use.case';
import { CreatePostByIdUseCase } from './features/blogger/blogs/application/useCases/create.post.by.id.use.case';
import { CreateCommentByPostUseCase } from './features/public/posts/application/useCase/create.comment.by.post.use.case';
import { CreateLikeStatusForPostsUseCase } from './features/public/posts/application/useCase/create.like.status.for.posts.use.case';
import { BunUserSchema } from './features/sa/users/schema/banUsers';
import { UpdateBanUserUseCase } from './features/sa/users/application/useCases/update.ban.user.use.case';
import { BlogsControllerSa } from './features/sa/blogs/blogs.controller.sa';
import { CheckUserIdSa } from './common/customValidators/check.user.id.sa';
import { CheckBlogIdSa } from './common/customValidators/check.blog.id.sa';
import { UpdateBlogOwnerUseCase } from './features/sa/blogs/aplication/useCase/update.blog.owner.use.case';
import { CreateLikeStatusForCommentsUseCase } from './features/public/comments/application/useCase/create.like.status.for.comments.use.case';
import { GetLikesInfoUseCase } from './features/public/comments/application/useCase/get.likes.Info.use.case';
import { UpdateCommentByIdUseCase } from './features/public/comments/application/useCase/update.comment.by.id.use.case';
import { UpdateInfoAboutDeviceUserUseCase } from './features/public/securityDevices/application/useCase/update.info.about.device.user.use.case';
import { SaveInfoAboutDevicesUserUseCase } from './features/public/securityDevices/application/useCase/save.info.about.devices.user.use.case';
import { GetNewConfirmationCodeUseCase } from './features/public/auth/application/useCase/get.new.confirmation.code.use.case';
import { CreateEmailConfirmationUseCae } from './features/public/auth/application/useCase/create.email.confirmation.use.cae';
import { UsersControllerBlogger } from './features/blogger/users/users.controller.blogger';
import { UpdateBanStatusForBlogUseCase } from './features/blogger/users/application/useCases/update.ban.status.for.blog.use.case';
import { UpdateBanStatusForBlogSaUseCase } from './features/sa/blogs/aplication/useCase/update.ban.status.for.blog.sa.use.case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanUsersForBlogSchema } from './features/public/blogs/schema/ban.users.for.blog.schema';
import { AuthRepositorySql } from './features/public/auth/auth.repository.sql';
import { IBlogsRepository } from './features/public/blogs/i.blogs.repository';
import { ITestingRepository } from './testing/i.testing.repository';
import { TestingRepositorySql } from './testing/testing.repository.sql';
import { ISecurityDevicesRepository } from './features/public/securityDevices/i.security.devices.repository';
import { SecurityDevicesRepositorySql } from './features/public/securityDevices/security.devices.repository.sql';
import { IAuthRepository } from './features/public/auth/i.auth.repository';
import { UsersRepositorySql } from './features/sa/users/users.repository.sql';
import { IUsersRepository } from './features/sa/users/i.users.repository';
import { QueryRepositorySql } from './features/public/queryReposytories/query.repository.sql';
import { IQueryRepository } from './features/public/queryReposytories/i.query.repository';
import { ICommentsRepository } from './features/public/comments/i.comments.repository';
import { CommentsRepositorySql } from './features/public/comments/comments.repository.sql';
import { IPostsRepository } from './features/public/posts/i.posts.repository';
import { PostsRepositorySql } from './features/public/posts/posts.repository.sql';
import { GetBlogIdUseCase } from './features/public/blogs/aplication/useCases/get.blog.id.use.case';
import { BlogsRepositorySql } from './features/public/blogs/blogs.repository.sql';
import { CheckPostId } from './common/customValidators/check.post.id';
import { BlogEntity } from './features/public/blogs/entity/blog.entity';
import { UserEntity } from './features/sa/users/entity/user.entity';
import { PostEntity } from './features/public/posts/entity/post.entity';
import { CommentEntity } from './features/public/comments/entity/comment.entity';
import { LikeStatusEntity } from './common/entity/like.status.entity';
import { EmailConfirmationEntity } from './common/entity/email.confirmation.entity';
import { RefreshTokenDataEntity } from './common/entity/refresh.token.data.entities';
import { CountAttemptEntity } from './common/entity/count.attempt.entity';
import { BanUsersForBlogEntity } from './features/public/blogs/entity/ban.users.for.blog.entity';
import { BanUsersEntity } from './features/sa/users/entity/banUsers.entity';
import { BlogsRepositoryTypeorm } from './features/public/blogs/blogs.repository.typeorm';
import { AuthRepositoryTypeorm } from './features/public/auth/auth.repository.typeorm';
import { SecurityDevicesRepositoryTypeorm } from './features/public/securityDevices/security.devices.repository.typeorm';
import { UsersRepositoryTypeorm } from './features/sa/users/users.repository.typeorm';
import { QueryRepositoryTypeorm } from './features/public/queryReposytories/query.repository.typeorm';
import { CommentsRepositoryTypeorm } from './features/public/comments/comments.repository.typeorm';
import { PostsRepositoryTypeorm } from './features/public/posts/posts.repository.typeorm';
import { TestingRepositoryTypeorm } from './testing/testing.repository.typeorm';
import { CheckQuestionId } from './common/customValidators/check.question.id';
import { QuizQuestionsControllerSa } from './features/sa/quizQuestions/quiz.questions.controller.sa';
import { CreateQuestionUseCase } from './features/sa/quizQuestions/aplication/useCase/create.question.use.case';
import { QuizQuestionsRepositoryMongoSa } from './features/sa/quizQuestions/quiz.questions.repository.mongo.sa';
import { QuizQuestionsRepositorySqlSa } from './features/sa/quizQuestions/quiz.questions.repository.sql.sa';
import { QuizQuestionsRepositoryTypeormSa } from './features/sa/quizQuestions/quiz.questions.repository.typeorm.sa';
import { IQuizQuestionsRepositorySa } from './features/sa/quizQuestions/i.quiz.questions.repository.sa';
import { QuizQuestionEntity } from './features/sa/quizQuestions/entity/quiz.question.entity';
import { QuestionSchema } from './features/sa/quizQuestions/schema/question.schema';
import { DeleteQuestionSaUseCase } from './features/sa/quizQuestions/aplication/useCase/delete.question.sa.use.case';
import { UpdateQuestionSaUseCase } from './features/sa/quizQuestions/aplication/useCase/update.question.sa.use.case';
import { UpdateStatusForQuestionSaUseCase } from './features/sa/quizQuestions/aplication/useCase/update.status.for.question.sa.use.case';
import { CheckArrayCorrectAnswer } from './common/customValidators/check.array.correct.answer';
import { PairQuizGameSchema } from './features/public/pairQuizGame/schema/pair.quiz.game.schema';
import { PairQuizGameEntity } from './features/public/pairQuizGame/entity/pair.quiz.game.entity';
import { PairQuizGameController } from './features/public/pairQuizGame/pair.quiz.game.controller';
import { PairQuizGameRepositoryMongo } from './features/public/pairQuizGame/pair.quiz.game.repository.mongo';
import { PairQuizGameRepositorySql } from './features/public/pairQuizGame/pair.quiz.game.repository.sql';
import { PairQuizGameRepositoryTypeorm } from './features/public/pairQuizGame/pair.quiz.game.repository.typeorm';
import { IPairQuizGameRepository } from './features/public/pairQuizGame/i.pair.quiz.game.repository';
import { ConnectCurrentUserOrWaitingSecondPlayerUseCase } from './features/public/pairQuizGame/application/useCase/connect.current.user.or.waiting.second.player.use.case';
import { GetGameByIdUseCase } from './features/public/pairQuizGame/application/useCase/get.game.by.id.use.case';
import { GetMyCurrentUseCase } from './features/public/pairQuizGame/application/useCase/get.my.current.use.case';
import { SendResultAnswerUseCase } from './features/public/pairQuizGame/application/useCase/send.result.answer.use.case';
import { GetCurrentUserStaticUseCase } from './features/public/pairQuizGame/application/useCase/get.current.user.static.use.case';
import { StatisticGamesEntity } from './features/public/pairQuizGame/entity/statistic.games.entity';
import { StatisticGamesSchema } from './features/public/pairQuizGame/schema/statistic.games.schema';
import { UploadPictureForBlogUseCase } from './features/blogger/blogs/application/useCases/upload.picture.for.blog.use.case';
import { FileStorageAdapter } from './common/adapters/file.storage.adapter';
import { UploadPictureForPostUserCase } from './features/blogger/blogs/application/useCases/upload.picture.for.post.user.case';
import { FileStorageAdapterS3 } from './common/adapters/file.storage.adapter.s3';

const Strategies = [LocalStrategy, JwtStrategy, BasicStrategy, RefreshStrategy];
const Validators = [
  CheckBlogIdForBlog,
  CheckLikeStatus,
  CheckUserForComments,
  CheckUserSecurityDevice,
  CheckCode,
  CheckRecoveryCode,
  CheckEmailConfirmation,
  CheckOriginalEmail,
  CheckOriginalLogin,
  CheckIdForBlog,
  CheckUserIdSa,
  CheckBlogIdSa,
  CheckPostId,
  CheckQuestionId,
  CheckArrayCorrectAnswer,
];
const UseCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  GetBlogIdSpecialUseCase,
  UpdateBlogUseCase,
  CreateUserUseCase,
  UpdatePostByIdUseCase,
  DeletePostByIdUseCase,
  GetPostIdUseCase,
  CreatePostByIdUseCase,
  CreateCommentByPostUseCase,
  CreateLikeStatusForPostsUseCase,
  UpdateBanUserUseCase,
  UpdateBlogOwnerUseCase,
  CreateLikeStatusForCommentsUseCase,
  GetLikesInfoUseCase,
  UpdateCommentByIdUseCase,
  UpdateInfoAboutDeviceUserUseCase,
  SaveInfoAboutDevicesUserUseCase,
  GetNewConfirmationCodeUseCase,
  CreateEmailConfirmationUseCae,
  UpdateBanStatusForBlogUseCase,
  UpdateBanStatusForBlogSaUseCase,
  GetBlogIdUseCase,
  CreateQuestionUseCase,
  DeleteQuestionSaUseCase,
  UpdateQuestionSaUseCase,
  UpdateStatusForQuestionSaUseCase,
  ConnectCurrentUserOrWaitingSecondPlayerUseCase,
  GetGameByIdUseCase,
  GetMyCurrentUseCase,
  SendResultAnswerUseCase,
  GetCurrentUserStaticUseCase,
  UploadPictureForBlogUseCase,
  UploadPictureForPostUserCase,
];
const MongoRepositories = [
  AuthRepositoryMongo,
  BlogsRepositoryMongo,
  TestingRepositoryMongo,
  SecurityDevicesRepositoryMongo,
  UsersRepositoryMongo,
  QueryRepositoryMongo,
  CommentsRepositoryMongo,
  PostsRepositoryMongo,
  QuizQuestionsRepositoryMongoSa,
  PairQuizGameRepositoryMongo,
];
const SqlRepositories = [
  AuthRepositorySql,
  BlogsRepositorySql,
  TestingRepositorySql,
  SecurityDevicesRepositorySql,
  UsersRepositorySql,
  QueryRepositorySql,
  CommentsRepositorySql,
  PostsRepositorySql,
  QuizQuestionsRepositorySqlSa,
  PairQuizGameRepositorySql,
];
const TypeOrmRepositories = [
  AuthRepositoryTypeorm,
  BlogsRepositoryTypeorm,
  TestingRepositoryTypeorm,
  SecurityDevicesRepositoryTypeorm,
  UsersRepositoryTypeorm,
  QueryRepositoryTypeorm,
  CommentsRepositoryTypeorm,
  PostsRepositoryTypeorm,
  QuizQuestionsRepositoryTypeormSa,
  PairQuizGameRepositoryTypeorm,
];
const AbstractClassesSql = [
  {
    provide: IBlogsRepository,
    useClass: BlogsRepositorySql,
  },
  {
    provide: IAuthRepository,
    useClass: AuthRepositorySql,
  },
  {
    provide: ITestingRepository,
    useClass: TestingRepositorySql,
  },
  {
    provide: ISecurityDevicesRepository,
    useClass: SecurityDevicesRepositorySql,
  },
  { provide: IUsersRepository, useClass: UsersRepositorySql },
  { provide: IQueryRepository, useClass: QueryRepositorySql },
  { provide: ICommentsRepository, useClass: CommentsRepositorySql },
  { provide: IPostsRepository, useClass: PostsRepositorySql },
  {
    provide: IQuizQuestionsRepositorySa,
    useClass: QuizQuestionsRepositorySqlSa,
  },
  { provide: IPairQuizGameRepository, useClass: PairQuizGameRepositorySql },
];

const AbstractClassesMongo = [
  {
    provide: IBlogsRepository,
    useClass: BlogsRepositoryMongo,
  },
  {
    provide: IAuthRepository,
    useClass: AuthRepositoryMongo,
  },
  {
    provide: ITestingRepository,
    useClass: TestingRepositoryMongo,
  },
  {
    provide: ISecurityDevicesRepository,
    useClass: SecurityDevicesRepositoryMongo,
  },
  { provide: IUsersRepository, useClass: UsersRepositoryMongo },
  { provide: IQueryRepository, useClass: QueryRepositoryMongo },
  { provide: ICommentsRepository, useClass: CommentsRepositoryMongo },
  { provide: IPostsRepository, useClass: PostsRepositoryMongo },
  {
    provide: IQuizQuestionsRepositorySa,
    useClass: QuizQuestionsRepositoryMongoSa,
  },
  { provide: IPairQuizGameRepository, useClass: PairQuizGameRepositoryMongo },
];

const AbstractClassesTypeorm = [
  {
    provide: IBlogsRepository,
    useClass: BlogsRepositoryTypeorm,
  },
  {
    provide: IAuthRepository,
    useClass: AuthRepositoryTypeorm,
  },
  {
    provide: ITestingRepository,
    useClass: TestingRepositoryTypeorm,
  },
  {
    provide: ISecurityDevicesRepository,
    useClass: SecurityDevicesRepositoryTypeorm,
  },
  { provide: IUsersRepository, useClass: UsersRepositoryTypeorm },
  { provide: IQueryRepository, useClass: QueryRepositoryTypeorm },
  { provide: ICommentsRepository, useClass: CommentsRepositoryTypeorm },
  { provide: IPostsRepository, useClass: PostsRepositoryTypeorm },
  {
    provide: IQuizQuestionsRepositorySa,
    useClass: QuizQuestionsRepositoryTypeormSa,
  },
  { provide: IPairQuizGameRepository, useClass: PairQuizGameRepositoryTypeorm },
];

const entities = [
  BlogEntity,
  UserEntity,
  PostEntity,
  CommentEntity,
  LikeStatusEntity,
  EmailConfirmationEntity,
  RefreshTokenDataEntity,
  CountAttemptEntity,
  BanUsersForBlogEntity,
  BanUsersEntity,
  QuizQuestionEntity,
  PairQuizGameEntity,
  StatisticGamesEntity,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: 'blogs', schema: BlogSchema },
      { name: 'posts', schema: PostSchema },
      { name: 'users', schema: UserSchema },
      { name: 'comments', schema: CommentSchema },
      { name: 'likeStatuses', schema: LikesTypeSchema },
      { name: 'emailConfirmations', schema: EmailConfirmationSchema },
      { name: 'refreshTokenData', schema: RefreshTokenSchema },
      { name: 'countAttempts', schema: CountAttemptSchema },
      { name: 'banUsers', schema: BunUserSchema },
      { name: 'banUsersForBlogs', schema: BanUsersForBlogSchema },
      { name: 'quizQuestions', schema: QuestionSchema },
      { name: 'infoQuizQuestionsGames', schema: PairQuizGameSchema },
      { name: 'statisticGames', schema: StatisticGamesSchema },
    ]),
    JwtModule.register({}),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          ignoreTLS: true,
          auth: {
            user: configService.get('EMAIL'),
            pass: configService.get('PASSWORD_EMAIL'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        ssl: true,
        host: configService.get('POSTGRES_HOST') || 'localhost',
        port: configService.get('POSTGRES_PORT') || 5432,
        username: configService.get('POSTGRES_USERNAME') || 'postgres',
        password: configService.get('POSTGRES_PASSWORD') || 'sa',
        database: configService.get('POSTGRES_DATABASE') || 'tube',
        entities: [...entities],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
    SecurityDevicesController,
    BlogsControllerBlogger,
    BlogsControllerSa,
    UsersControllerBlogger,
    QuizQuestionsControllerSa,
    PairQuizGameController,
  ],
  providers: [
    QueryCount,
    PostsRepositoryMongo,
    UsersService,
    CommentsService,
    CommentsRepositoryMongo,
    Jwt,
    EmailManager,
    EmailAdapter,
    SecurityDevicesService,
    ...Strategies,
    ...Validators,
    CountAttemptGuard,
    { provide: FileStorageAdapter, useClass: FileStorageAdapterS3 },
    ...UseCases,
    ...SqlRepositories,
    ...MongoRepositories,
    ...TypeOrmRepositories,
    ...AbstractClassesMongo,
  ],
})
export class Modules {}
