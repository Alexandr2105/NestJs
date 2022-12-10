import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repostitory';
import { UsersRepository } from '../users/users.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
  ) {}

  @Get(':id')
  async getComment(@Param('id') commentId: string, @Res() res) {
    const comment = await this.commentsService.getLikesInfo(commentId);
    if (comment) {
      res.send(comment);
    } else {
      res.sendStatus(404);
    }
  }

  // async deleteComment(req: Request, res: Response) {
  //   const delComment = await this.commentsService.deleteCommentById(
  //     req.params.commentId,
  //   );
  //   if (!delComment) {
  //     res.sendStatus(404);
  //   } else {
  //     res.sendStatus(204);
  //   }
  // }

  // async updateComment(req: Request, res: Response) {
  //   const putComment = await this.commentsService.updateCommentById(
  //     req.params.commentId,
  //     req.body.content,
  //   );
  //   if (!putComment) {
  //     res.sendStatus(404);
  //   } else {
  //     res.sendStatus(204);
  //   }
  // }

  // async updateLikeStatusForComment(req: Request, res: Response) {
  //   const comment = await this.commentsRepository.getCommentById(
  //     req.params.commentId,
  //   );
  //   if (!comment) {
  //     res.sendStatus(404);
  //     return;
  //   }
  //   const userId: any = await this.jwtService.getUserIdByToken(
  //     req.headers.authorization!.split(' ')[1],
  //   );
  //   const user: any = await this.usersRepository.getUserId(userId!.toString());
  //   const lakeStatus = await this.commentsService.createLikeStatus(
  //     req.params.commentId,
  //     userId.toString(),
  //     req.body.likeStatus,
  //     user.login,
  //   );
  //   if (lakeStatus) res.sendStatus(204);
  // }
}
