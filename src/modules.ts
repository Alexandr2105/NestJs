import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CommentsTypeSchema,
  EmailConfirmationSchema,
  LikesTypeSchema,
  PostsTypeSchema,
  RefreshTokenDataSchema,
  UsersTypeSchema,
} from './helper/allTypes';
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
import { DevicesService } from './helper/devices-service';
import { SecurityDevicesRepository } from './auth/auth.repository';
import { BlogSchema } from './blogs/schema/blogs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'blogs', schema: BlogSchema },
      { name: 'posts', schema: PostsTypeSchema },
      { name: 'users', schema: UsersTypeSchema },
      { name: 'comments', schema: CommentsTypeSchema },
      { name: 'likeStatuses', schema: LikesTypeSchema },
      { name: 'emailConfirmations', schema: EmailConfirmationSchema },
      { name: 'refreshTokenData', schema: RefreshTokenDataSchema },
      { name: 'countAttempts', schema: CommentsTypeSchema },
    ]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
    AuthController,
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
    DevicesService,
    SecurityDevicesRepository,
  ],
})
export class Modules {}
