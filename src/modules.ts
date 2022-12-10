import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlogsTypeSchema,
  CommentsTypeSchema,
  PostsTypeSchema,
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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'blogs', schema: BlogsTypeSchema }]),
    MongooseModule.forFeature([{ name: 'posts', schema: PostsTypeSchema }]),
    MongooseModule.forFeature([{ name: 'users', schema: UsersTypeSchema }]),
    MongooseModule.forFeature([
      { name: 'comments', schema: CommentsTypeSchema },
    ]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    TestingController,
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
  ],
})
export class Modules {}
