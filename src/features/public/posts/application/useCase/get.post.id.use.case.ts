import { CommandHandler } from '@nestjs/cqrs';
import { IPostsRepository } from '../../i.posts.repository';

export class GetPostIdCommand {
  constructor(public postId: string, public userId: string) {}
}

@CommandHandler(GetPostIdCommand)
export class GetPostIdUseCase {
  constructor(private readonly postsRepository: IPostsRepository) {}

  async execute(command: GetPostIdCommand) {
    const post = await this.postsRepository.getPostId(command.postId);
    const likesCount = await this.postsRepository.getLikesInfo(command.postId);
    const dislikeCount: any = await this.postsRepository.getDislikeInfo(
      command.postId,
    );
    const myStatus: any = await this.postsRepository.getMyStatus(
      command.userId,
      command.postId,
    );
    const infoLikes = await this.postsRepository.getAllInfoLike(command.postId);
    if (post) {
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikeCount,
          myStatus: myStatus,
          newestLikes: infoLikes.map((a) => {
            return {
              addedAt: a.createDate,
              userId: a.userId,
              login: a.login,
            };
          }),
        },
      };
    } else {
      return false;
    }
  }
}
