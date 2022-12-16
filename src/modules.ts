import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlogsTypeSchema,
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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'blogs', schema: BlogsTypeSchema }]),
    MongooseModule.forFeature([{ name: 'posts', schema: PostsTypeSchema }]),
    MongooseModule.forFeature([{ name: 'users', schema: UsersTypeSchema }]),
    MongooseModule.forFeature([
      { name: 'comments', schema: CommentsTypeSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'likeStatuses', schema: LikesTypeSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'emailConfirmation', schema: EmailConfirmationSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'refreshTokenData', schema: RefreshTokenDataSchema },
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
