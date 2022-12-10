import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsTypeSchema, PostsTypeSchema } from './helper/allTypes';
import { BlogsController } from './blogs/blogs.controller';
import { QueryRepository } from './queryReposytories/query-Repository';
import { BlogsRepository } from './blogs/blogs.repository';
import { QueryCount } from './helper/query.count';
import { BlogsService } from './blogs/blogs.service';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'blogs', schema: BlogsTypeSchema }]),
    MongooseModule.forFeature([{ name: 'posts', schema: PostsTypeSchema }]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    QueryCount,
    BlogsService,
    BlogsRepository,
    QueryRepository,
    PostsService,
    PostsRepository,
  ],
})
export class Modules {}
