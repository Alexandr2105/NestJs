import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { PostsTypeSchema } from '../helper/allTypes';
import { PostsController } from './posts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'posts', schema: PostsTypeSchema }]),
  ],
  controllers: [PostsController],
  providers: [],
})
export class AppModule {}
