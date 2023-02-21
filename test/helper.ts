import {
  CreateBlogDto,
  CreatePostForBlogDto,
} from '../src/features/blogger/blogs/dto/blogger.dto';
import { Blog } from '../src/features/public/blogs/schema/blogs.schema';
import { CreateUserDto } from '../src/features/sa/users/dto/user.dto';

export class Helper {
  blog = async (
    blogInputData: CreateBlogDto,
    accessToken: string,
    test: any,
  ) => {
    const blog = await test
      .post('/blogger/blogs/')
      .auth(accessToken, { type: 'bearer' })
      .send(blogInputData)
      .expect(201);
    expect(blog.body).toEqual({
      id: blog.body.id,
      name: blog.body.name,
      description: blog.body.description,
      websiteUrl: blog.body.websiteUrl,
      createdAt: blog.body.createdAt,
      isMembership: false,
    });
    return blog.body;
  };

  post = async (
    postInputData: CreatePostForBlogDto,
    accessToken: string,
    test: any,
    blog: Blog,
  ) => {
    const post = await test
      .post('/blogger/blogs/' + blog.id + '/posts')
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(201);
    expect(post.body).toEqual({
      id: post.body.id,
      title: post.body.title,
      shortDescription: post.body.shortDescription,
      content: post.body.content,
      blogId: post.body.blogId,
      blogName: post.body.blogName,
      createdAt: post.body.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
    return post.body;
  };

  user = async (
    userInputData: CreateUserDto,
    login: string,
    password: string,
    test: any,
  ) => {
    const user = await test
      .post('/sa/users')
      .auth(login, password, { type: 'basic' })
      .send(userInputData)
      .expect(201);
    expect(user.body).toEqual({
      id: user.body.id,
      login: user.body.login,
      email: user.body.email,
      createdAt: user.body.createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
    return user.body;
  };
  // comment = async () => {};
  // blog1 = async () => {};
}
