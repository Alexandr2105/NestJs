import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createApp } from './common/helper/createApp';
import { settings } from './settings';
import { TelegramAdapter } from './common/adapters/telegram.adapter';

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule, { rawBody: true });
  const app = createApp(rawApp);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'), 10) || 3000;
  await app.listen(port, () => {
    console.log(`App started at ${port} port`);
  });
  const telegramAdapter = await app.resolve(TelegramAdapter);
  let baseUrl = settings.CURRENT_APP_BASE_URL;
  if (true) {
    //пока пусть будет true
    baseUrl = await telegramAdapter.connectToNgrok();
  }
  await telegramAdapter.sendOurHookForTelegram(
    baseUrl + '/integrations/telegram/webhook',
  );
}

bootstrap();
