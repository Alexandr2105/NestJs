import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/public/blogs/blogs.controller';
import { QueryRepositoryMongo } from './features/public/queryReposytories/query.repository.mongo';
import { BlogsRepositoryMongo } from './features/public/blogs/blogs.repository.mongo';
import { QueryCount } from './common/helper/query.count';
import { PostsController } from './features/public/posts/posts.controller';
import { PostsRepository } from './features/public/posts/posts.repository';
import { UsersController } from './features/sa/users/users.controller';
import { UsersService } from './features/sa/users/application/users.service';
import { UsersRepositoryMongo } from './features/sa/users/users.repository.mongo';
import { CommentsController } from './features/public/comments/comments.controller';
import { CommentsService } from './features/public/comments/application/comments.service';
import { CommentsRepository } from './features/public/comments/comments.repostitory';
import { TestingController } from './testing/testing.controller';
import { TestingRepositoryMongo } from './testing/testing.repository.mongo';
import { AuthController } from './features/public/auth/auth.controller';
import { Jwt } from './features/public/auth/jwt';
import { EmailManager } from './common/manager/email-manager';
import { EmailAdapter } from './common/adapters/email-adapter';
import { SecurityDevicesService } from './features/public/securityDevices/application/security-devices.service';
import { SecurityDevicesRepositoryMongo } from './features/public/securityDevices/security.devices.repository.mongo';
import { Blog, BlogSchema } from './features/public/blogs/schema/blogs.schema';
import { Post, PostSchema } from './features/public/posts/schema/posts.schema';
import {
  Comment,
  CommentSchema,
} from './features/public/comments/schema/comment.schema';
import { User, UserSchema } from './features/sa/users/schema/user';
import { SecurityDevicesController } from './features/public/securityDevices/security.devices.controller';
import {
  RefreshTokenData,
  RefreshTokenSchema,
} from './common/schemas/refresh.token.data.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './common/schemas/email.confirmation.schema';
import {
  CountAttempt,
  CountAttemptSchema,
} from './common/schemas/count.attempt.schema';
import { LikesModel, LikesTypeSchema } from './common/schemas/like.type.schema';
import { AuthRepositoryMongo } from './features/public/auth/auth.repository.mongo';
import { CheckBlogIdForBlog } from './common/customValidator/check.blog.id.for.blog';
import { CheckLikeStatus } from './common/customValidator/check.like.status';
import { BasicStrategy } from './common/strategies/basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './common/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { RefreshStrategy } from './common/strategies/refresh.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { CheckUserForComments } from './common/customValidator/check.user.for.comments';
import { CheckUserSecurityDevice } from './common/customValidator/check.user.security.device';
import { CheckCode } from './common/customValidator/check.code';
import { CheckRecoveryCode } from './common/customValidator/check.recovery.code';
import { CheckEmailConfirmation } from './common/customValidator/check.email.confirmation';
import { CheckOriginalEmail } from './common/customValidator/check.origin.email';
import { CheckOriginalLogin } from './common/customValidator/check.original.login';
import { CheckIdForBlog } from './common/customValidator/check.id.for.blog';
import { CountAttemptGuard } from './common/guard/count.attempt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateBlogUseCase } from './features/blogger/blogs/application/useCases/create.blog.use.case';
import { DeleteBlogUseCase } from './features/blogger/blogs/application/useCases/delete.blog.use.case';
import { GetBlogIdUseCase } from './features/public/blogs/aplication/useCases/get.blog.id.use.case';
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
import { BanUsers, BunUserSchema } from './features/sa/users/schema/banUsers';
import { UpdateBanUserUseCase } from './features/sa/users/application/useCases/update.ban.user.use.case';
import { BlogsControllerSa } from './features/sa/blogs/blogs.controller.sa';
import { CheckUserIdSa } from './common/customValidator/check.user.id.sa';
import { CheckBlogIdSa } from './common/customValidator/check.blog.id.sa';
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
import { IBlogsRepository } from './features/public/blogs/i.blog.repository';
import { ITestingRepository } from './testing/i.testing.repository';
import { TestingRepositorySql } from './testing/testing.repository.sql';
import { ISecurityDevicesRepository } from './features/public/securityDevices/i.security.devices.repository';
import { SecurityDevicesRepositorySql } from './features/public/securityDevices/security.devices.repository.sql';
import { IAuthRepository } from './features/public/auth/i.auth.repository';
import { UsersRepositorySql } from './features/sa/users/users.repository.sql';
import { IUsersRepository } from './features/sa/users/i.users.repository';
import { QueryRepositorySql } from './features/public/queryReposytories/query.repository.sql';
import { IQueryRepository } from './features/public/queryReposytories/i.query.repository';

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
];
const UseCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  GetBlogIdUseCase,
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
];
const MongoRepositories = [
  AuthRepositoryMongo,
  BlogsRepositoryMongo,
  TestingRepositoryMongo,
  SecurityDevicesRepositoryMongo,
  UsersRepositoryMongo,
  QueryRepositoryMongo,
];
const SqlRepositories = [
  AuthRepositorySql,
  TestingRepositorySql,
  SecurityDevicesRepositorySql,
  UsersRepositorySql,
  QueryRepositorySql,
];
const AbstractClassesSql = [
  // {
  //   provide: IBlogsRepository,
  //   useClass: BlogsRepositoryMongo,
  // },
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
        entities: [
          Blog,
          Post,
          User,
          Comment,
          LikesModel,
          EmailConfirmation,
          RefreshTokenData,
          CountAttempt,
          BanUsers,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
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
  ],
  providers: [
    QueryCount,
    PostsRepository,
    UsersService,
    CommentsService,
    CommentsRepository,
    Jwt,
    EmailManager,
    EmailAdapter,
    SecurityDevicesService,
    ...Strategies,
    ...Validators,
    CountAttemptGuard,
    ...UseCases,
    ...SqlRepositories,
    ...MongoRepositories,
    ...AbstractClassesSql,
  ],
})
export class Modules {}
