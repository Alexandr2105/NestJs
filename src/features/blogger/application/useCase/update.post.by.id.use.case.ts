import { CommandHandler } from '@nestjs/cqrs';
import { UpdatePostByIdDto } from '../../dto/blogger.dto';
import { PostsRepository } from '../../../public/posts/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdatePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public body: UpdatePostByIdDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase {
  constructor(protected postsRepository: PostsRepository) {}

  async execute(command: UpdatePostByIdCommand) {
    const post = await this.postsRepository.getPostId(command.postId);
    if (!post || post.blogId !== command.blogId) {
      throw new NotFoundException();
    } else if (post.userId === command.userId) {
      post.title = command.body.title;
      post.content = command.body.content;
      post.shortDescription = command.body.shortDescription;
      await this.postsRepository.save(post);
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
}
