import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';

@Controller('integrations/telegram')
export class TelegramController {
  @HttpCode(204)
  @Post('webhook')
  async telegramHook(@Body() payload: any) {
    console.log(payload);
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-bot-link')
  async getLinkWithAuthCode() {
    return { link: 's' };
  }
}
