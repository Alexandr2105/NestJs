import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryCount } from '../../../common/helper/query.count';
import { JwtAuthGuard } from '../../../common/guard/jwt.auth.guard';
import { CreateBlogCommand } from './application/useCases/create.blog.use.case';
import { GetBlogIdSpecialCommand } from '../../public/blogs/aplication/useCases/get.blog.id.special.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogCommand } from './application/useCases/update.blog.use.case';
import { DeleteBlogCommand } from './application/useCases/delete.blog.use.case';
import {
  CheckBlogId,
  CreateBlogDto,
  CreatePostForBlogDto,
  UpdateBlogDto,
  UpdatePostByIdDto,
} from './dto/blogger.dto';
import { UpdatePostByIdCommand } from './application/useCases/update.post.by.id.use.case';
import { DeletePostByIdCommand } from './application/useCases/delete.post.by.id.use.case';
import { CreatePostByIdCommand } from './application/useCases/create.post.by.id.use.case';
import { IQueryRepository } from '../../public/queryReposytories/i.query.repository';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPictureForPostCommand } from '../../public/posts/application/useCase/upload.picture.for.post.user.case';
import { CheckPicture } from '../../../common/customValidators/check.picture';
import { UploadPictureForBlogCommand } from './application/useCases/upload.picture.for.blog.use.case';

@Controller('blogger/blogs')
export class BlogsControllerBlogger {
  constructor(
    private readonly queryCount: QueryCount,
    private readonly queryRepository: IQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getBlogs(@Query() dataQuery, @Req() req) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryBlogsAuthUser(query, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('comments')
  async getAllCommentsForAllPost(@Query() dataQuery, @Req() req) {
    const query = this.queryCount.queryCheckHelper(dataQuery);
    return await this.queryRepository.getQueryAllInfoForBlog(
      query,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() body: UpdateBlogDto,
    @Req() req,
  ) {
    const updateBlog = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, body, req.user.id),
    );
    if (updateBlog) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Req() req) {
    const result = await this.commandBus.execute(
      new DeleteBlogCommand(blogId, req.user.id),
    );
    if (result) {
      return;
    } else {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(@Body() body: CreateBlogDto, @Req() req) {
    const createBlog = await this.commandBus.execute(
      new CreateBlogCommand(body, req.user.id),
    );
    return this.commandBus.execute(
      new GetBlogIdSpecialCommand(createBlog.id, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:blogId/posts')
  async createPostsForBlog(
    @Param() param: CheckBlogId,
    @Body() body: CreatePostForBlogDto,
    @Req() req,
  ) {
    return await this.commandBus.execute(
      new CreatePostByIdCommand(
        {
          title: body.title,
          content: body.content,
          shortDescription: body.shortDescription,
        },
        param.blogId,
        req.user.id,
      ),
    );
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Put('/:blogId/posts/:postId')
  async updatePostById(
    @Param() param,
    @Body() body: UpdatePostByIdDto,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdatePostByIdCommand(param.blogId, param.postId, body, req.user.id),
    );
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete('/:blogId/posts/:postId')
  async deletePostById(@Param() param, @Req() req) {
    await this.commandBus.execute(
      new DeletePostByIdCommand(param.blogId, param.postId, req.user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:blogId/images/wallpaper')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBackgroundWallpaperForBlog(
    @Param('blogId') blogId: string,
    @Req() req,
    @UploadedFile() wallpaper: Express.Multer.File,
  ) {
    await new CheckPicture().validateWallpaperForBlog(wallpaper);
    return await this.commandBus.execute(
      new UploadPictureForBlogCommand(
        blogId,
        req.user.id,
        wallpaper.originalname,
        wallpaper.buffer,
        'wallpaper',
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:blogId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainSquareImageForBlog(
    @Param('blogId') blogId: string,
    @Req() req,
    @UploadedFile() main: Express.Multer.File,
  ) {
    await new CheckPicture().validateMainSquareForBlog(main);
    return await this.commandBus.execute(
      new UploadPictureForBlogCommand(
        blogId,
        req.user.id,
        main.originalname,
        main.buffer,
        'main',
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:blogId/posts/:postId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImagineForPost(
    @Param() param,
    @Req() req,
    @UploadedFile() wallpaper: Express.Multer.File,
  ) {
    await new CheckPicture().validateMainForPost(wallpaper);
    return await this.commandBus.execute(
      new UploadPictureForPostCommand(
        param.blogId,
        req.user.id,
        param.postId,
        wallpaper.originalname,
        wallpaper.buffer,
        `main`,
      ),
    );
  }

  // @Get('/images/wallpaper')
  // async forTest() {
  //   return await readTextFileAsync(
  //     path.join('common', 'views', 'avatars', 'change-page.html'),
  //   );
  // }
  //
  // @Post('/wallpaper')
  // @UseInterceptors(FileInterceptor('avatar'))
  // async forTestPost(@UploadedFile() avatarFile: Express.Multer.File) {
  //   await checkDirectoryAsync(path.join('common', 'content', '10'));
  //   await saveFileAsync(
  //     path.join('common', 'content', '10', avatarFile.originalName),
  //     avatarFile.buffer,
  //   );
  //   console.log(avatarFile);
  //   return 'avatar saved';
  // }
}
