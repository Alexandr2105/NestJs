import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './blogs/blogs.controller';
import { QueryRepository } from './queryReposytories/query-Repository';
import { BlogsRepository } from './blogs/blogs.repository';
import { QueryCount } from './helper/query.count';
import { BlogsService } from './blogs/blogs.service';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repostitory';
import { TestingController } from './testing/testing.controller';
import { TestingRepository } from './testing/testing.repository';
import { AuthController } from './auth/auth.controller';
import { JwtService } from './application/jwt-service';
import { AuthService } from './auth/auth.service';
import { EmailManager } from './manager/email-manager';
import { EmailAdapter } from './adapters/email-adapter';
import { SecurityDevicesService } from './securityDevices/security-devices.service';
import { SecurityDevicesRepository } from './securityDevices/security.devices.repository';
import { BlogSchema } from './blogs/schema/blogs.schema';
import { PostSchema } from './posts/schema/posts.schema';
import { CommentSchema } from './comments/schema/comment.schema';
import { UserSchema } from './users/schema/user';
import { SecurityDevicesController } from './securityDevices/security.devices.controller';
import { RefreshTokenSchema } from './schemas/refresh.token.data.schema';
import { EmailConfirmationSchema } from './schemas/email.confirmation.schema';
import { CountAttemptSchema } from './schemas/count.attempt.schema';
import { LikesTypeSchema } from './schemas/like.type.schema';
import { AuthRepository } from './auth/auth.repository';
import { CheckBlogIdForBlog } from './customValidator/check.blog.id.for.blog';
import { CheckBlogIdForPost } from './customValidator/check.blog.id.for.post';
import { CheckLikeStatus } from './customValidator/check.like.status';
import { CheckIdComment } from './customValidator/check.id.comment';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'blogs', schema: BlogSchema },
      { name: 'posts', schema: PostSchema },
      { name: 'users', schema: UserSchema },
      { name: 'comments', schema: CommentSchema },
      { name: 'likeStatuses', schema: LikesTypeSchema },
      { name: 'emailConfirmations', schema: EmailConfirmationSchema },
      { name: 'refreshTokenData', schema: RefreshTokenSchema },
      { name: 'countAttempts', schema: CountAttemptSchema },
    ]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
    SecurityDevicesController,
  ],
  providers: [
    QueryCount,
    BlogsService,
    BlogsRepository,
    QueryRepository,
    PostsService,
    PostsRepository,
    UsersService,
    UsersRepository,
    CommentsService,
    CommentsRepository,
    TestingRepository,
    JwtService,
    AuthService,
    EmailManager,
    EmailAdapter,
    SecurityDevicesService,
    SecurityDevicesRepository,
    AuthRepository,
    CheckBlogIdForBlog,
    CheckBlogIdForPost,
    CheckLikeStatus,
    CheckIdComment,
  ],
})
export class Modules {}
