import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createApp } from './common/helper/createApp';

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'), 10) || 3000;
  await app.listen(port, () => {
    console.log(`App started at ${port} port`);
  });
}

bootstrap();
