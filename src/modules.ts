import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/public/blogs/blogs.controller';
import { QueryRepository } from './features/public/queryReposytories/query.repository';
import { BlogsRepository } from './features/public/blogs/blogs.repository';
import { QueryCount } from './common/helper/query.count';
import { PostsController } from './features/public/posts/posts.controller';
import { PostsRepository } from './features/public/posts/posts.repository';
import { UsersController } from './features/sa/users/users.controller';
import { UsersService } from './features/sa/users/application/users.service';
import { UsersRepository } from './features/sa/users/users.repository';
import { CommentsController } from './features/public/comments/comments.controller';
import { CommentsService } from './features/public/comments/comments.service';
import { CommentsRepository } from './features/public/comments/comments.repostitory';
import { TestingController } from './testing/testing.controller';
import { TestingRepository } from './testing/testing.repository';
import { AuthController } from './features/public/auth/auth.controller';
import { Jwt } from './features/public/auth/jwt';
import { AuthService } from './features/public/auth/auth.service';
import { EmailManager } from './common/manager/email-manager';
import { EmailAdapter } from './common/adapters/email-adapter';
import { SecurityDevicesService } from './features/public/securityDevices/security-devices.service';
import { SecurityDevicesRepository } from './features/public/securityDevices/security.devices.repository';
import { BlogSchema } from './features/public/blogs/schema/blogs.schema';
import { PostSchema } from './features/public/posts/schema/posts.schema';
import { CommentSchema } from './features/public/comments/schema/comment.schema';
import { UserSchema } from './features/sa/users/schema/user';
import { SecurityDevicesController } from './features/public/securityDevices/security.devices.controller';
import { RefreshTokenSchema } from './common/schemas/refresh.token.data.schema';
import { EmailConfirmationSchema } from './common/schemas/email.confirmation.schema';
import { CountAttemptSchema } from './common/schemas/count.attempt.schema';
import { LikesTypeSchema } from './common/schemas/like.type.schema';
import { AuthRepository } from './features/public/auth/auth.repository';
import { CheckBlogIdForBlog } from './common/customValidator/check.blog.id.for.blog';
import { CheckLikeStatus } from './common/customValidator/check.like.status';
import { CheckIdComment } from './common/customValidator/check.id.comment';
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
import { CreateBlogUseCase } from './features/blogger/application/useCase/create.blog.use.case';
import { DeleteBlogUseCase } from './features/blogger/application/useCase/delete.blog.use.case';
import { GetBlogIdUseCase } from './features/public/blogs/aplication/useCases/get.blog.id.use.case';
import { UpdateBlogUseCase } from './features/blogger/application/useCase/update.blog.use.case';
import { CreateUserUseCase } from './features/sa/users/application/useCases/create.user.use.case';
import { BloggerController } from './features/blogger/blogger.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdatePostByIdUseCase } from './features/blogger/application/useCase/update.post.by.id.use.case';
import { DeletePostByIdUseCase } from './features/blogger/application/useCase/delete.post.by.id.use.case';
import { GetPostIdUseCase } from './features/public/posts/aplication/useCase/get.post.id.use.case';
import { CreatePostByIdUseCase } from './features/blogger/application/useCase/create.post.by.id.use.case';
import { CreateCommentByPostUseCase } from './features/public/posts/aplication/useCase/create.comment.by.post.use.case';
import { CreateLikeStatusUseCase } from './features/public/posts/aplication/useCase/create.like.status.use.case';
import { BunUserSchema } from './features/sa/users/schema/banUser';
import { BanUserUseCase } from './features/sa/users/application/useCases/ban.user.use.case';
import { BlogsControllerSa } from './features/sa/blogs/blogs.controller.sa';
import { CheckUserIdSa } from './common/customValidator/check.user.id.sa';
import { CheckBlogIdSa } from './common/customValidator/check.blog.id.sa';
import { UpdateBlogOwnerUseCase } from './features/sa/blogs/aplication/useCase/update.blog.owner.use.case';

const Strategies = [LocalStrategy, JwtStrategy, BasicStrategy, RefreshStrategy];
const Validators = [
  CheckBlogIdForBlog,
  CheckLikeStatus,
  CheckIdComment,
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
  CreateLikeStatusUseCase,
  BanUserUseCase,
  UpdateBlogOwnerUseCase,
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
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
    SecurityDevicesController,
    BloggerController,
    BlogsControllerSa,
  ],
  providers: [
    QueryCount,
    BlogsRepository,
    QueryRepository,
    PostsRepository,
    UsersService,
    UsersRepository,
    CommentsService,
    CommentsRepository,
    TestingRepository,
    Jwt,
    AuthService,
    EmailManager,
    EmailAdapter,
    SecurityDevicesService,
    SecurityDevicesRepository,
    AuthRepository,
    ...Strategies,
    ...Validators,
    CountAttemptGuard,
    ...UseCases,
  ],
})
export class Modules {}
