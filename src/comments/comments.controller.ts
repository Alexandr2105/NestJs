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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repostitory';
import { UsersRepository } from '../users/users.repository';
import { Jwt } from '../application/jwt';
import { UpdateCommentDto } from './dto/comment.dto';
import { LikeStatusDto } from '../helper/like.status.dto';
import { JwtAuthGuard } from '../guard/jwt.auth.guard';

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
      comment = await this.commentsService.getLikesInfo(
        commentId,
        userId.toString(),
      );
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
  async deleteComment(@Param('commentId') commentId: string) {
    const delComment = await this.commentsService.deleteCommentById(commentId);
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
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentDto,
  ) {
    const putComment = await this.commentsService.updateCommentById(
      commentId,
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
    const user: any = await this.usersRepository.getUserId(userId.toString());
    const lakeStatus = await this.commentsService.createLikeStatus(
      commentId,
      userId.toString(),
      body.likeStatus,
      user.login,
    );
    if (lakeStatus) return;
  }
}
