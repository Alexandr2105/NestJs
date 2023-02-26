import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Modules } from './modules';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    Modules,
    // TypeOrmModule.forFeature([
    // Blog,
    // Post,
    // User,
    // Comment,
    // LikesModel,
    // EmailConfirmation,
    // RefreshTokenData,
    // CountAttempt,
    // BanUsers,
    // ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
