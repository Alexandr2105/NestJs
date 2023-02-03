import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Modules } from './modules';
import { User } from './features/sa/users/schema/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './features/public/blogs/schema/blogs.schema';
import { LikesModel } from './common/schemas/like.type.schema';
import { EmailConfirmation } from './common/schemas/email.confirmation.schema';
import { RefreshTokenData } from './common/schemas/refresh.token.data.schema';
import { Post } from './features/public/posts/schema/posts.schema';
import { CountAttempt } from './common/schemas/count.attempt.schema';
import { BanUser } from './features/sa/users/schema/banUser';
import { Comment } from './features/public/comments/schema/comment.schema';
import { MongooseModule } from '@nestjs/mongoose';

const mongoUri = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/tube';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(mongoUri),
    Modules,
    TypeOrmModule.forFeature([
      Blog,
      Post,
      User,
      Comment,
      LikesModel,
      EmailConfirmation,
      RefreshTokenData,
      CountAttempt,
      BanUser,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
