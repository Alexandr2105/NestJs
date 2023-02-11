import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Headers,
  NotFoundException,
  HttpCode,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from './application/comments.service';
import { Jwt } from '../auth/jwt';
import { CheckUserId, UpdateCommentDto } from './dto/comment.dto';
import { LikeStatusDto } from '../posts/dto/like.status.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentByIdCommand } from './application/useCase/update.comment.by.id.use.case';
import { GetLikesInfoCommand } from './application/useCase/get.likes.Info.use.case';
import { CreateLikeStatusForCommentsCommand } from './application/useCase/create.like.status.for.comments.use.case';
import { IUsersRepository } from '../../sa/users/i.users.repository';
import { ICommentsRepository } from './i.comments.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: ICommentsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: Jwt,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getComment(@Param('id') commentId: string, @Headers() headers) {
    const banUser = await this.usersRepository.getBanUsers();
    let comment;
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      comment = await this.commandBus.execute(
        new GetLikesInfoCommand(commentId, userId),
      );
    } else {
      comment = await this.commandBus.execute(
        new GetLikesInfoCommand(commentId, 'null'),
      );
    }
    if (!comment) throw new NotFoundException();
    banUser.map((a) => {
      if (a.id == comment.userId) throw new NotFoundException();
    });
    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':commentId')
  async deleteComment(@Param() param: CheckUserId, @Req() req) {
    const comment = await this.commentsService.getCommentById(param.commentId);
    if (comment.userId !== req.user.id) throw new ForbiddenException();
    const delComment = await this.commentsService.deleteCommentById(
      param.commentId,
    );
    if (!delComment) {
      throw new NotFoundException();
    } else {
      return;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':commentId')
  async updateComment(
    @Param() param: CheckUserId,
    @Body() body: UpdateCommentDto,
    @Req() req,
  ) {
    const comment = await this.commentsService.getCommentById(param.commentId);
    if (comment.userId !== req.user.id) throw new ForbiddenException();
    const putComment = await this.commandBus.execute(
      new UpdateCommentByIdCommand(param.commentId, body),
    );
    if (!putComment) {
      throw new NotFoundException();
    } else {
      return;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':commentId/like-status')
  async updateLikeStatusForComment(
    @Param('commentId') commentId: string,
    @Body() body: LikeStatusDto,
    @Headers() headers,
  ) {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) throw new NotFoundException();
    const userId: any = await this.jwtService.getUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: any = await this.usersRepository.getUserId(userId);
    const lakeStatus = await this.commandBus.execute(
      new CreateLikeStatusForCommentsCommand(
        commentId,
        userId,
        body.likeStatus,
        user.login,
      ),
    );
    if (lakeStatus) return;
  }
}
