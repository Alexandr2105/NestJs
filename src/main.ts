import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createApp } from './common/helper/createApp';
import * as ngrok from 'ngrok';
import { settings } from './settings';
import axios from 'axios';

async function connectToNgrok() {
  return await ngrok.connect(3000);
}

async function sendOurHookForTelegram(url: string) {
  const token = '6265066689:AAFqPs3vNeCOj46ABJQukcRjZONXatQGBM8';
  await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, { url });
}

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'), 10) || 3000;
  await app.listen(port, () => {
    console.log(`App started at ${port} port`);
  });
  let baseUrl = settings.CURRENT_APP_BASE_URL;
  if (true) {
    baseUrl = await connectToNgrok();
  }
  await sendOurHookForTelegram(baseUrl + '/integrations/telegram/webhook');
}

//6265066689:AAFqPs3vNeCOj46ABJQukcRjZONXatQGBM8

bootstrap();
