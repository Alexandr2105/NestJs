import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsTypeSchema } from '../helper/allTypes';
import { BlogsController } from './blogs.controller';
import { QueryRepository } from '../queryReposytories/query-Repository';
import { BlogsRepository } from './blogs.repository';
import { QueryCount } from '../helper/query.count';
import { BlogsService } from './blogs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'blogs', schema: BlogsTypeSchema }]),
  ],
  controllers: [BlogsController],
  providers: [QueryRepository, BlogsRepository, QueryCount, BlogsService],
})
export class BlogsModule {}
