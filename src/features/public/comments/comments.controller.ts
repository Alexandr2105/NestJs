import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
  Headers,
  NotFoundException,
  HttpCode,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repostitory';
import { UsersRepository } from '../../sa/users/users.repository';
import { Jwt } from '../auth/jwt';
import { CheckUserId, UpdateCommentDto } from './dto/comment.dto';
import { LikeStatusDto } from '../../../common/helper/like.status.dto';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(Jwt) protected jwtService: Jwt,
  ) {}

  @Get(':id')
  async getComment(@Param('id') commentId: string, @Headers() headers) {
    let comment;
    if (headers.authorization) {
      const userId: any = this.jwtService.getUserIdByToken(
        headers.authorization.split(' ')[1],
      );
      comment = await this.commentsService.getLikesInfo(commentId, userId);
    } else {
      comment = await this.commentsService.getLikesInfo(commentId, 'null');
    }
    if (comment) {
      return comment;
    } else {
      throw new NotFoundException();
    }
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
    const putComment = await this.commentsService.updateCommentById(
      param.commentId,
      body,
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
    const lakeStatus = await this.commentsService.createLikeStatus(
      commentId,
      userId,
      body.likeStatus,
      user.login,
    );
    if (lakeStatus) return;
  }
}
