import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createApp } from './common/helper/createApp';
// import * as ngrok from 'ngrok';
// import { settings } from './settings';

// async function connectToNgrok() {
//   const url = await ngrok.connect(3000);
//   return url;
// }

export async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = createApp(rawApp);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'), 10) || 3000;
  await app.listen(port, () => {
    console.log(`App started at ${port} port`);
  });
  // let baseUrl = settings.CURRENT_APP_BASE_URL;
  // if (true) {
  //   baseUrl = await connectToNgrok();
  // }
}

bootstrap();
