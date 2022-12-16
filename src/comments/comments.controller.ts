import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repostitory';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '../application/jwt-service';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  //TODO: удалить @Req();

  @Get(':id')
  async getComment(@Param('id') commentId: string, @Res() res, @Req() req) {
    let comment;
    if (req.headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        req.headers.authorization!.split(' ')[1],
      );
      comment = await this.commentsService.getLikesInfo(
        commentId,
        userId.toString(),
      );
    } else {
      comment = await this.commentsService.getLikesInfo(commentId, 'null');
    }
    if (comment) {
      res.send(comment);
    } else {
      res.sendStatus(404);
    }
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string, @Res() res) {
    const delComment = await this.commentsService.deleteCommentById(commentId);
    if (!delComment) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  }

  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body,
    @Res() res,
  ) {
    const putComment = await this.commentsService.updateCommentById(
      commentId,
      body.content,
    );
    if (!putComment) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  }

  @Put(':commentId/like-status')
  async updateLikeStatusForComment(
    @Param('commentId') commentId: string,
    @Body() body,
    @Res() res,
    @Req() req,
  ) {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    const userId: any = await this.jwtService.getUserIdByToken(
      req.headers.authorization!.split(' ')[1],
    );
    const user: any = await this.usersRepository.getUserId(userId!.toString());
    const lakeStatus = await this.commentsService.createLikeStatus(
      commentId,
      userId.toString(),
      body.likeStatus,
      user.login,
    );
    if (lakeStatus) res.sendStatus(204);
  }
}
