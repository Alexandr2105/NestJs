import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Modules } from './modules';

const mongoUri = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/tube';

@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forRoot(mongoUri), Modules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
