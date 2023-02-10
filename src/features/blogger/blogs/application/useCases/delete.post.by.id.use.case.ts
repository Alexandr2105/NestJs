import { CommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryMongo } from '../../../../public/posts/posts.repository.mongo';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeletePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase {
  constructor(protected postsRepository: PostsRepositoryMongo) {}
  async execute(command: DeletePostByIdCommand) {
    const post = await this.postsRepository.getPostId(command.postId);
    if (!post || post.blogId !== command.blogId) {
      throw new NotFoundException();
    } else if (post.userId === command.userId) {
      await this.postsRepository.deletePostId(post.id);
    } else {
      throw new ForbiddenException();
    }
  }
}
