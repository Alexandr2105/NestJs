import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { TelegramUpdateMessage } from '../../../common/helper/allTypes';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageCommand } from './aplication/useCases/send.message.use.case';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly commandBus: CommandBus) {}

  @HttpCode(204)
  @Post('webhook')
  async telegramHook(@Body() payload: TelegramUpdateMessage) {
    await this.commandBus.execute(new SendMessageCommand(payload));
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-bot-link')
  async getLinkWithAuthCode(@Req() req) {
    const code = req.user.id;
    return { link: `https://t.me/MyFirstBackendBot?start=code=${code}` };
    //Чтобы пройти тест верх должен быть закоменчен
    // return { link: `https://t.me/MyFirstBackendBot?code=${code}` };
  }
}
