import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../common/guard/basic.auth.guard';
import { QueryCount } from '../../../common/helper/query.count';
import {
  QuizQuestionCheckId,
  QuizQuestionCheckStatus,
  QuizQuestionsDto,
} from './dto/quiz.questions.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './aplication/useCase/create.question.use.case';
import { DeleteQuestionSaCommand } from './aplication/useCase/delete.question.sa.use.case';
import { UpdateQuestionSaCommand } from './aplication/useCase/update.question.sa.use.case';
import { UpdateStatusForQuestionSaCommand } from './aplication/useCase/update.status.for.question.sa.use.case';
import { IQueryRepository } from '../../public/queryReposytories/i.query.repository';

@Controller('sa/quiz/questions')
export class QuizQuestionsControllerSa {
  constructor(
    private readonly queryCount: QueryCount,
    private readonly commandBus: CommandBus,
    private readonly queryRepository: IQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllQuestion(@Query() dataQuery) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return this.queryRepository.getAllQuestionSa(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(@Body() body: QuizQuestionsDto) {
    await this.commandBus.execute(new CreateQuestionCommand(body));
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteQuestion(@Param() param: QuizQuestionCheckId) {
    const result = this.commandBus.execute(
      new DeleteQuestionSaCommand(param.id),
    );
    if (!result) return false;
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateQuestion(
    @Param() param: QuizQuestionCheckId,
    @Body() body: QuizQuestionsDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateQuestionSaCommand(body, param.id),
    );
    if (!result) return false;
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  async updateQuestionStatus(
    @Param() param: QuizQuestionCheckId,
    @Body() body: QuizQuestionCheckStatus,
  ) {
    const result = await this.commandBus.execute(
      new UpdateStatusForQuestionSaCommand(param.id, body.published),
    );
    if (!result) return false;
  }
}
