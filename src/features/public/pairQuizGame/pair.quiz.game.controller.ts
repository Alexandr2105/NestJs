import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectCurrentUserOrWaitingSecondPlayerCommand } from './application/useCase/connect.current.user.or.waiting.second.player.use.case';
import { UsersService } from '../../sa/users/application/users.service';
import { GetMyCurrentUseCommand } from './application/useCase/get.my.current.use.case';
import { GetGameByIdCommand } from './application/useCase/get.game.by.id.use.case';
import { CheckGameIdDto, PairQuizGameDto } from './dto/pair.quiz.game.dto';
import { SendResultAnswerCommand } from './application/useCase/send.result.answer.use.case';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { IPairQuizGameRepository } from './i.pair.quiz.game.repository';

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly test: IPairQuizGameRepository,
  ) {}

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('connection')
  async connectionToGame(@Req() req) {
    const userId = req.user.id;
    const userInfo: any = await this.usersService.getUserById(userId);
    return await this.commandBus.execute(
      new ConnectCurrentUserOrWaitingSecondPlayerCommand(
        userInfo?.id,
        userInfo?.login,
      ),
    );
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('my-current/answers')
  async sendAnswer(@Req() req, @Body() body: PairQuizGameDto) {
    const userId = req.user.id;
    return await this.commandBus.execute(
      new SendResultAnswerCommand(userId, body),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-current')
  async returnUnfinishedUserGame(@Req() req) {
    const userId = req.user.id;
    return await this.commandBus.execute(new GetMyCurrentUseCommand(userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getGameById(@Req() req, @Param() param: CheckGameIdDto) {
    const userId = req.user.id;
    return await this.commandBus.execute(
      new GetGameByIdCommand(userId, param.id),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Get('test-my-current/:id')
  async returnUnfinishedUserGameForTest(@Param('id') id) {
    return this.test.getUnfinishedUserGameForTest(id);
  }
}
