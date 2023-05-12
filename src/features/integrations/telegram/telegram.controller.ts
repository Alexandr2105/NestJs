import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { TelegramUpdateMessage } from '../../../common/helper/allTypes';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageCommand } from './aplication/useCases/sendMessageUseCase';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly commandBus: CommandBus) {}
  @HttpCode(204)
  @Post('webhook')
  async telegramHook(@Body() payload: TelegramUpdateMessage) {
    console.log(payload);
    await this.commandBus.execute(new SendMessageCommand(payload));
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-bot-link')
  async getLinkWithAuthCode() {
    return { link: 's' };
  }
}
