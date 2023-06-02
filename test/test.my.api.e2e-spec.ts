import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/common/helper/createApp';
import request from 'supertest';
import { CreateBlogDto } from '../src/features/blogger/blogs/dto/blogger.dto';
import { Blog } from '../src/features/public/blogs/schema/blogs.schema';
import { Post } from '../src/features/public/posts/schema/posts.schema';
import { User } from '../src/features/sa/users/schema/user';
import { Helper } from './helper';
import { MailerService } from '@nestjs-modules/mailer';

describe('Create tests for blogger', () => {
  let newBlog1: Blog = null;
  let newBlog2: Blog = null;
  let newPost1: Post = null;
  let newPost2: Post = null;

  jest.setTimeout(5 * 60 * 1000);
  const user1 = {
    login: 'Alex',
    password: 'QWERTY',
    email: '5030553@gmail.com',
  };
  const user2 = {
    login: 'Alex1',
    password: 'QWERTY',
    email: '50305531@gmail.com',
  };
  let admin: User = null;
  let banUser: User = null;
  let app: INestApplication;
  let test;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create user 1', async () => {
    admin = await new Helper().user(user1, 'admin', 'qwerty', test);
  });

  it('Create user 2', async () => {
    banUser = await new Helper().user(user2, 'admin', 'qwerty', test);
  });

  it('login', async () => {
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });
    expect(response.status).toBe(200);
    const accessToken = response.body;
    expect(accessToken).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken);
  });

  it('Проверка на удаление', async () => {
    const { accessToken } = expect.getState();
    return test
      .get('/blogger/blogs')
      .auth(accessToken, { type: 'bearer' })
      .expect(200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('Create Blog1', async () => {
    const blogInputData: CreateBlogDto = {
      name: '123123',
      description: '12312421421',
      websiteUrl: 'www.any.com',
    };
    const { accessToken } = expect.getState();
    newBlog1 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Создаем новый blog2', async () => {
    const blogInputData: CreateBlogDto = {
      name: 'String',
      description: '421421',
      websiteUrl: 'www.anySite.com',
    };
    const { accessToken } = expect.getState();
    newBlog2 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Создаем новый blog без авторизации', async () => {
    await test
      .post('/blogger/blogs')
      .send({
        name: 'Alex1',
        description: '12312421421',
        websiteUrl: 'www.youtube1.com',
      })
      .expect(401);
  });

  it('Создаем новый blog с неверными данными', async () => {
    const { accessToken } = expect.getState();
    const blog = await test
      .post('/blogger/blogs')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: '',
        description: '',
        websiteUrl: 'www.youtube1',
      })
      .expect(400);
    expect(blog.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
        {
          message: expect.any(String),
          field: 'description',
        },
        { message: expect.any(String), field: 'websiteUrl' },
      ],
    });
  });

  it('Получаем все blogs', async () => {
    const { accessToken } = expect.getState();
    await test
      .get('/blogger/blogs')
      .auth(accessToken, { type: 'bearer' })
      .expect(200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: newBlog2.id,
            name: newBlog2.name,
            description: newBlog2.description,
            websiteUrl: newBlog2.websiteUrl,
            createdAt: newBlog2.createdAt,
            isMembership: false,
            images: {
              wallpaper: null,
              main: [],
            },
          },
          {
            id: newBlog1.id,
            name: newBlog1.name,
            description: newBlog1.description,
            websiteUrl: newBlog1.websiteUrl,
            createdAt: newBlog1.createdAt,
            isMembership: false,
            images: {
              wallpaper: null,
              main: [],
            },
          },
        ],
      });
  });

  it('Получаем все blogs, без авторизации', async () => {
    await test.get('/blogger/blogs').expect(401);
  });

  it('Удаляем blog и проверяем на удаление', async () => {
    const { accessToken } = expect.getState();
    await test.delete('/blogger/blogs/' + newBlog1.id).expect(401);
    await test
      .delete('/blogger/blogs/' + newBlog1.id)
      .auth(accessToken, { type: 'bearer' })
      .expect(204);
    await test
      .get(`/blogger/blogs/${newBlog1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    await test
      .delete('/blogger/blogs/' + newBlog1.id)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .delete(`/blogger/blogs/${newBlog2.id}`)
      .auth(token.accessToken, { type: 'bearer' });
  });

  it('Редактируем blog2', async () => {
    const { accessToken } = expect.getState();
    await test.put('/blogger/blogs/123').expect(401);
    await test
      .put('/blogger/blogs/123')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'Jora',
        websiteUrl: 'www.youtube.com',
        description: 'any string',
      })
      .expect(404);
    const response = await test
      .put('/blogger/blogs/' + newBlog2)
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'Stringasdfasdfasdfasdfsdf',
        websiteUrl: 'asdfde',
        description: '',
      })
      .expect(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
        {
          message: expect.any(String),
          field: 'description',
        },
        { message: expect.any(String), field: 'websiteUrl' },
      ],
    });
    const res = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = res.body;
    await test
      .put('/blogger/blogs/' + newBlog2.id)
      .auth(token.accessToken, { type: 'bearer' })
      .send({
        name: 'Jora',
        websiteUrl: 'www.youtube.com',
        description: 'any string',
      })
      .expect(403);
    await test
      .put('/blogger/blogs/' + newBlog2.id)
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'Jora',
        websiteUrl: 'www.youtube.com',
        description: 'any string',
      })
      .expect(204);
  });

  it('Получаем blog по id', async () => {
    await test.get('/blogs/' + newBlog2.id).expect(200, {
      ...newBlog2,
      name: 'Jora',
      websiteUrl: 'www.youtube.com',
      description: 'any string',
    });
  });

  it('Создаем 2 posts по blogId с авторизацией', async () => {
    const { accessToken } = expect.getState();
    newPost1 = await new Helper().post(
      {
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      },
      accessToken,
      test,
      newBlog2,
    );
    newPost2 = await new Helper().post(
      {
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      },
      accessToken,
      test,
      newBlog2,
    );
  });

  it('Создаем post по blogId без авторизации', async () => {
    await test
      .post('/blogger/blogs/' + newBlog2 + '/posts')
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(401);
  });

  it('Создаем post по blogId с авторизацией с не верными данными', async () => {
    const { accessToken } = expect.getState();
    const post = await test
      .post('/blogger/blogs/' + newBlog2.id + '/posts')
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: '',
        shortDescription: '',
        content: '',
      })
      .expect(400);
    expect(post.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });

  it('Создаем post по не верному blogId с авторизацией', async () => {
    const { accessToken } = expect.getState();
    await test
      .post('/blogger/blogs/-1234/posts')
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(404);
  });

  it('Создаем post пользователем которому не принадлежит blog', async () => {
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .post(`/blogger/blogs/${newBlog2.id}/posts`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(403);
  });

  it('Обновляем post по id', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string',
        shortDescription: 'string',
        content: 'string',
      })
      .expect(204);
    await test.get('/posts/' + newPost1.id).expect(200, {
      ...newPost1,
      title: 'string',
      shortDescription: 'string',
      content: 'string',
    });
  });

  it('Обновляем post по id без авторизации', async () => {
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .send({
        title: 'string',
        shortDescription: 'string',
        content: 'string',
      })
      .expect(401);
  });

  it('Обновляем post котрого нет', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/1234`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string',
        shortDescription: 'string',
        content: 'string',
      })
      .expect(404);
  });

  it('Обновляем post по id не верными данными', async () => {
    const { accessToken } = expect.getState();
    const post = await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: '',
        shortDescription: '',
        content: '',
      })
      .expect(400);
    expect(post.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });

  it('Обновляем post, который нам не принадлежит', async () => {
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({ title: 'string', shortDescription: 'string', content: 'string' })
      .expect(403);
  });

  it('Удаляем post без авторизации', async () => {
    await test
      .delete(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .expect(401);
  });

  it('Удаляем post с авторизацией', async () => {
    const { accessToken } = expect.getState();
    await test
      .delete(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(204);
  });

  it('Удаляем не существующий post', async () => {
    const { accessToken } = expect.getState();
    await test
      .delete(`/blogger/blogs/${newBlog2.id}/posts/${newPost1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    await test.get('/posts/' + newPost1.id).expect(404);
  });

  it('Удаляем post, который принадлежит другому пользователю', async () => {
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost2.id}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({ title: 'string', shortDescription: 'string', content: 'string' })
      .expect(403);
  });

  it('Баним пользователя', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/blogger/users/${banUser.id}/ban`)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst',
        blogId: 'string',
      })
      .expect(401);
    const info = await test
      .put(`/blogger/users/${banUser.id}/ban`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        isBanned: 'True',
        banReason: '',
        blogId: '123',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        { message: expect.any(String), field: 'isBanned' },
        { message: expect.any(String), field: 'banReason' },
        { message: expect.any(String), field: 'blogId' },
      ],
    });
    await test
      .put(`/blogger/users/${banUser.id}/ban`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        isBanned: true,
        banReason: 'stringstringstringst',
        blogId: newBlog2.id,
      })
      .expect(204);
  });

  it('Получить всех пользователей для blog', async () => {
    const { accessToken } = expect.getState();
    await test.get(`/blogger/users/blog/${newBlog2.id}`).expect(401);
    const info = await test
      .get(`/blogger/users/blog/${newBlog2.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: banUser.id,
          login: banUser.login,
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
            banReason: expect.any(String),
          },
        },
      ],
    });
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .get(`/blogger/users/blog/${newBlog2.id}`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('Разбаниваем пользователя', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/blogger/users/${banUser.id}/ban`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        isBanned: false,
        banReason: 'stringstringstringst',
        blogId: newBlog2.id,
      })
      .expect(204);
  });

  it('Получить всех пользователей для blog', async () => {
    const { accessToken } = expect.getState();
    const info = await test
      .get(`/blogger/users/blog/${newBlog2.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('Получаем все комментарии конкретного blog', async () => {
    const { accessToken } = expect.getState();
    const comment1 = await new Helper().comment(
      {
        content: 'stringstringstringst',
      },
      accessToken,
      test,
      newPost2,
    );
    const comment2 = await new Helper().comment(
      {
        content: 'stringstringstringstadfas',
      },
      accessToken,
      test,
      newPost2,
    );
    await test.get(`/blogger/blogs/comments`).expect(401);
    const info = await test
      .get(`/blogger/blogs/comments`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: comment2.id,
          content: 'stringstringstringstadfas',
          commentatorInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          createdAt: comment2.createdAt,
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
          postInfo: {
            id: newPost2.id,
            title: newPost2.title,
            blogId: newPost2.blogId,
            blogName: newPost2.blogName,
          },
        },
        {
          id: comment1.id,
          content: 'stringstringstringst',
          commentatorInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          createdAt: comment1.createdAt,
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
          postInfo: {
            id: newPost2.id,
            title: newPost2.title,
            blogId: newPost2.blogId,
            blogName: newPost2.blogName,
          },
        },
      ],
    });
  });
});

describe('Create tests for sa', () => {
  jest.setTimeout(5 * 60 * 1000);
  let app: INestApplication;
  let test;

  let newBlog1: Blog = null;
  let newBlog2: Blog = null;
  const user1 = {
    login: 'Alex',
    password: 'QWERTY',
    email: '5030553@gmail.com',
  };
  const user2 = {
    login: 'Alex1',
    password: 'QWERTY',
    email: '50305531@gmail.com',
  };
  let admin: User = null;
  let banUser: User = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create user 1', async () => {
    admin = await new Helper().user(user1, 'admin', 'qwerty', test);
  });

  it('Create user 2', async () => {
    banUser = await new Helper().user(user2, 'admin', 'qwerty', test);
  });

  it('login', async () => {
    const response = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });

    expect(response.status).toBe(200);
    const accessToken = response.body;
    expect(accessToken).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken);
  });

  it('Create Blog1', async () => {
    const blogInputData: CreateBlogDto = {
      name: '123123',
      description: '12312421421',
      websiteUrl: 'www.any.com',
    };
    const { accessToken } = expect.getState();
    newBlog1 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Create Blog2', async () => {
    const blogInputData: CreateBlogDto = {
      name: 'string',
      description: 'Any String',
      websiteUrl: 'www.anySite.com',
    };
    const { accessToken } = expect.getState();
    newBlog2 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Баним blog по id', async () => {
    await test
      .put(`/sa/blogs/${newBlog1.id}/ban`)
      .send({
        isBanned: true,
      })
      .expect(401);
    const info = await test
      .put(`/sa/blogs/${newBlog1.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send('True')
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'isBanned',
        },
      ],
    });
    await test
      .put(`/sa/blogs/${newBlog1.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
      })
      .expect(204);
  });

  it('Соеденям blog и user, если у блога нет ешё владельца', async () => {
    await test
      .put(`/sa/blogs/${newBlog2.id}/bind-with-user/${banUser.id}`)
      .expect(401);
    await test
      .put(`/sa/blogs/${newBlog2.id}/bind-with-user/${banUser.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(400);
  });

  it('Получаем все блоги', async () => {
    await test.get(`/sa/blogs`).expect(401);
    const info = await test
      .get(`/sa/blogs`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: newBlog2.id,
          name: newBlog2.name,
          description: newBlog2.description,
          websiteUrl: newBlog2.websiteUrl,
          createdAt: newBlog2.createdAt,
          isMembership: false,
          blogOwnerInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          banInfo: {
            isBanned: false,
            banDate: null,
          },
        },
        {
          id: newBlog1.id,
          name: newBlog1.name,
          description: newBlog1.description,
          websiteUrl: newBlog1.websiteUrl,
          createdAt: newBlog1.createdAt,
          isMembership: false,
          blogOwnerInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
          },
        },
      ],
    });
  });

  it('Проверяем на ban blogs', async () => {
    await test.get('/blogs/' + newBlog1.id).expect(404);
    const info = await test.get(`/blogs`).expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: newBlog2.id,
          name: newBlog2.name,
          description: newBlog2.description,
          websiteUrl: newBlog2.websiteUrl,
          createdAt: newBlog2.createdAt,
          isMembership: newBlog2.isMembership,
          images: {
            main: [],
            wallpaper: null,
          },
          currentUserSubscriptionStatus: 'None',
          subscribersCount: 0,
        },
      ],
    });
  });

  it('Баним пользователя по id', async () => {
    await test.put(`/sa/users/${banUser.id}/ban`).expect(401);
    const info = await test
      .put(`/sa/users/${banUser.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: 'True',
        banReason: '',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'isBanned',
        },
        {
          message: expect.any(String),
          field: 'banReason',
        },
      ],
    });
    await test
      .put(`/sa/users/${banUser.id}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        isBanned: true,
        banReason: 'stringstringstringst',
      })
      .expect(204);
  });

  it('Получить всех пользователей', async () => {
    await test.get(`/sa/users`).expect(401);
    const info = await test
      .get(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: banUser.id,
          login: banUser.login,
          email: banUser.email,
          createdAt: banUser.createdAt,
          banInfo: {
            isBanned: true,
            banDate: expect.any(String),
            banReason: expect.any(String),
          },
        },
        {
          id: admin.id,
          login: admin.login,
          email: admin.email,
          createdAt: admin.createdAt,
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
        },
      ],
    });
  });

  it('Проверяем создание нового пользователя на ошибки', async () => {
    await test
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(400);
    await test
      .post('/sa/users')
      .auth('admin1', 'qwerty1', { type: 'basic' })
      .send(user1)
      .expect(401);
  });

  it('Удаляем юзера и провераяем', async () => {
    await test.del(`/sa/users/${banUser.id}`).expect(401);
    await test
      .del(`/sa/users/${banUser.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);
    await test
      .del(`/sa/users/${banUser.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(404);
  });

  it('Создаю 12 пользователей и получаю их', async () => {
    for (let a = 0; a < 12; a++) {
      const user = {
        login: `Alex${a}`,
        password: 'QWERTY',
        email: `5030553${a}@gmail.com`,
      };
      admin = await new Helper().user(user, 'admin', 'qwerty', test);
    }
    const info = await test
      .get(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(info.body).toEqual({
      pagesCount: 2,
      page: 1,
      pageSize: 10,
      totalCount: 13,
      items: expect.any(Array),
    });
  });
});

describe('Create tests for all', () => {
  jest.setTimeout(5 * 60 * 1000);
  let app: INestApplication;
  let test;

  const user1 = {
    login: 'Alex',
    password: 'QWERTY',
    email: '5030553@gmail.com',
  };
  const user2 = {
    login: 'Alex1',
    password: 'QWERTY',
    email: '50305531@gmail.com',
  };
  let admin: User = null;
  let newBlog1: Blog = null;
  let newBlog2: Blog = null;
  let newPost1: Post = null;
  let newPost2: Post = null;
  let newComment1 = null;
  let newComment2 = null;
  let infoUser1 = null;
  let infoUser2 = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create user 1', async () => {
    admin = await new Helper().user(user1, 'admin', 'qwerty', test);
  });

  it('Create user 2', async () => {
    await new Helper().user(user2, 'admin', 'qwerty', test);
  });

  it('login', async () => {
    infoUser1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });

    expect(infoUser1.status).toBe(200);
    const accessToken = infoUser1.body;
    expect(accessToken).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken);
  });

  it('Create Blog1', async () => {
    const blogInputData: CreateBlogDto = {
      name: '123123',
      description: '12312421421',
      websiteUrl: 'www.any.com',
    };
    const { accessToken } = expect.getState();
    newBlog1 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Create Blog2', async () => {
    const blogInputData: CreateBlogDto = {
      name: 'string',
      description: 'Any String',
      websiteUrl: 'www.anySite.com',
    };
    const { accessToken } = expect.getState();
    newBlog2 = await new Helper().blog(blogInputData, accessToken, test);
  });

  it('Получаем blog по id', async () => {
    const info = await test.get('/blogs/' + newBlog2.id).expect(200);
    expect(info.body).toEqual({
      id: newBlog2.id,
      name: newBlog2.name,
      description: newBlog2.description,
      websiteUrl: newBlog2.websiteUrl,
      createdAt: newBlog2.createdAt,
      isMembership: false,
      images: {
        main: [],
        wallpaper: null,
      },
      currentUserSubscriptionStatus: 'None',
      subscribersCount: 0,
    });
    await test.get(`/blogs/1234`).expect(404);
  });

  it('Получаем все blog', async () => {
    const info = await test.get(`/blogs`).expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: newBlog2.id,
          name: newBlog2.name,
          description: newBlog2.description,
          websiteUrl: newBlog2.websiteUrl,
          createdAt: newBlog2.createdAt,
          isMembership: newBlog2.isMembership,
          images: {
            main: [],
            wallpaper: null,
          },
          currentUserSubscriptionStatus: 'None',
          subscribersCount: 0,
        },
        {
          id: newBlog1.id,
          name: newBlog1.name,
          description: newBlog1.description,
          websiteUrl: newBlog1.websiteUrl,
          createdAt: newBlog1.createdAt,
          isMembership: newBlog1.isMembership,
          images: {
            main: [],
            wallpaper: null,
          },
          currentUserSubscriptionStatus: 'None',
          subscribersCount: 0,
        },
      ],
    });
  });

  it('Создаем 2 posts по blogId с авторизацией', async () => {
    const { accessToken } = expect.getState();
    newPost1 = await new Helper().post(
      {
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      },
      accessToken,
      test,
      newBlog2,
    );
    newPost2 = await new Helper().post(
      {
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      },
      accessToken,
      test,
      newBlog2,
    );
  });

  it('Получаем post по blog id', async () => {
    await test.get('/blogs/' + newBlog2.id + '/posts').expect(200, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [newPost2, newPost1],
    });
  });

  it('Получаем post по не верному blog id', async () => {
    await test.get('/blogs/1234/posts').expect(404);
  });

  it('Возвращаем все posts', async () => {
    const info = await test.get('/posts').expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: newPost2.id,
          title: newPost2.title,
          shortDescription: newPost2.shortDescription,
          content: newPost2.content,
          blogId: newPost2.blogId,
          blogName: newPost2.blogName,
          createdAt: newPost2.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
          images: {
            main: [],
          },
        },
        {
          id: newPost1.id,
          title: newPost1.title,
          shortDescription: newPost1.shortDescription,
          content: newPost1.content,
          blogId: newPost1.blogId,
          blogName: newPost1.blogName,
          createdAt: newPost1.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
          images: {
            main: [],
          },
        },
      ],
    });
  });

  it('Получаем post по id', async () => {
    const info = await test.get('/posts/' + newPost1.id).expect(200);
    expect(info.body).toEqual({
      id: newPost1.id,
      title: newPost1.title,
      shortDescription: newPost1.shortDescription,
      content: newPost1.content,
      blogId: newPost1.blogId,
      blogName: newPost1.blogName,
      createdAt: newPost1.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
      images: {
        main: [],
      },
    });
  });

  it('Получаем post по не верному id', async () => {
    await test.get('/posts/234').expect(404);
  });

  it('Создаем два коментария с токеном по postId', async () => {
    const { accessToken } = expect.getState();
    newComment1 = await new Helper().comment(
      { content: 'stringstringstringst' },
      accessToken,
      test,
      newPost1,
    );
    newComment2 = await new Helper().comment(
      { content: 'stringstringstringstadsfasdf' },
      accessToken,
      test,
      newPost1,
    );
  });

  it('Создаем коментарий без токена по postId', async () => {
    await test
      .post('/posts/' + newPost2.id + '/comments')
      .send({
        content: 'stringstringstringst',
      })
      .expect(401);
  });

  it('Создаем коментарий с токеном, но неверным контентом', async () => {
    const { accessToken } = expect.getState();
    await test
      .post('/posts/' + newPost2.id + '/comments')
      .auth(accessToken, { type: 'bearer' })
      .send({
        content: 'string',
      })
      .expect(400);
  });

  it('Создаем коментарий по неверному postId', async () => {
    const { accessToken } = expect.getState();
    await test
      .post('/posts/1213/comments')
      .auth(accessToken, { type: 'bearer' })
      .send({
        content: 'stringstringstringst',
      })
      .expect(404);
  });

  it('Получаем комментарии для конкретного post по id', async () => {
    await test.get(`/posts/1234/comments`).expect(404);
    const info = await test.get(`/posts/${newPost1.id}/comments`).expect(200);
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: newComment2.id,
          content: 'stringstringstringstadsfasdf',
          commentatorInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          createdAt: newComment2.createdAt,
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        },
        {
          id: newComment1.id,
          content: 'stringstringstringst',
          commentatorInfo: {
            userId: admin.id,
            userLogin: admin.login,
          },
          createdAt: newComment1.createdAt,
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        },
      ],
    });
  });

  it('Обновляем like status для post по postId', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/posts/${newPost1.id}/like-status`)
      .send({
        likeStatus: 'Like',
      })
      .expect(401);
    await test
      .put(`/posts/1234/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(404);
    const info = await test
      .put(`/posts/${newPost1.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'true',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'likeStatus',
        },
      ],
    });
    await test
      .put(`/posts/${newPost1.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
  });

  it('Получаем post по id после like', async () => {
    const { accessToken } = expect.getState();
    const info1 = await test.get('/posts/' + newPost1.id).expect(200);
    expect(info1.body).toEqual({
      id: newPost1.id,
      title: newPost1.title,
      shortDescription: newPost1.shortDescription,
      content: newPost1.content,
      blogId: newPost1.blogId,
      blogName: newPost1.blogName,
      createdAt: newPost1.createdAt,
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: admin.id,
            login: admin.login,
          },
        ],
      },
      images: {
        main: [],
      },
    });
    const info2 = await test
      .get('/posts/' + newPost1.id)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info2.body).toEqual({
      id: newPost1.id,
      title: newPost1.title,
      shortDescription: newPost1.shortDescription,
      content: newPost1.content,
      blogId: newPost1.blogId,
      blogName: newPost1.blogName,
      createdAt: newPost1.createdAt,
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: admin.id,
            login: admin.login,
          },
        ],
      },
      images: {
        main: [],
      },
    });
  });

  it('Получаем информацию о пользователе', async () => {
    const { accessToken } = expect.getState();
    await test.get(`/auth/me`).expect(401);
    const info = await test
      .get(`/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      email: admin.email,
      login: admin.login,
      userId: admin.id,
    });
  });

  it('Обновляем like status для коментария', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/comments/${newComment1.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
    await test
      .put(`/comments/${newComment2.id}/like-status`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(401);
    const info = await test
      .put(`/comments/${newComment2.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Dis',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'likeStatus',
        },
      ],
    });
    await test
      .put(`/comments/1234/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Dislike',
      })
      .expect(404);
  });

  it('Обновляем коментарий по id', async () => {
    const { accessToken } = expect.getState();
    await test
      .put(`/comments/${newComment1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        ...newComment1,
        content: 'stringstringstringst20lenght',
      })
      .expect(204);
    const info = await test
      .put(`/comments/${newComment1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        ...newComment1,
        content: 'strings',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
    await test
      .put(`/comments/${newComment1.id}`)
      .send({
        ...newComment1,
        content: 'stringstringstringst20lenght',
      })
      .expect(401);
    await test
      .put(`/comments/1234`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        ...newComment1,
        content: 'stringstringstringst20lenght',
      })
      .expect(404);
    infoUser2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user1.password });
    const pass = infoUser2.body;
    await test
      .put(`/comments/${newComment1.id}`)
      .auth(pass.accessToken, { type: 'bearer' })
      .send({
        ...newComment1,
        content: 'stringstringstringst20lenght',
      })
      .expect(403);
  });

  it('Удаляем коментарий по id', async () => {
    const { accessToken } = expect.getState();
    await test
      .delete(`/comments/${newComment2.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(204);
    await test
      .delete(`/comments/${newComment2.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    await test.delete(`/comments/${newComment2.id}`).expect(401);
    infoUser2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user1.password });
    const pass = infoUser2.body;
    await test
      .delete(`/comments/${newComment1.id}`)
      .auth(pass.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('Получаем коментарий по id', async () => {
    const { accessToken } = expect.getState();
    await test.get(`/comments/${newComment2.id}`).expect(404);
    const info = await test.get(`/comments/${newComment1.id}`).expect(200);
    expect(info.body).toEqual({
      id: newComment1.id,
      content: 'stringstringstringst20lenght',
      commentatorInfo: {
        userId: newComment1.commentatorInfo.userId,
        userLogin: newComment1.commentatorInfo.userLogin,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
    const info1 = await test
      .get(`/comments/${newComment1.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(info1.body).toEqual({
      id: newComment1.id,
      content: 'stringstringstringst20lenght',
      commentatorInfo: {
        userId: newComment1.commentatorInfo.userId,
        userLogin: newComment1.commentatorInfo.userLogin,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
      },
    });
  });

  it('Вернуть все девайсы пользователя за сессию', async () => {
    const cookies = infoUser1.headers['set-cookie'];
    await test.get(`/security/devices`).expect(401);
    const info = await test
      .get(`/security/devices`)
      .set('Cookie', cookies)
      .expect(200);
    expect(info.body).toEqual([
      {
        ip: expect.any(String),
        title: 'Chrome',
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
    ]);
  });

  it('Выйти из всех девайсов кроме текущего', async () => {
    const cookies = infoUser2.headers['set-cookie'];
    await test.delete(`/security/devices`).expect(401);
    await test.delete(`/security/devices`).set('Cookie', cookies).expect(204);
    const info = await test
      .get(`/security/devices`)
      .set('Cookie', cookies)
      .expect(200);
    expect(info.body).toEqual([
      {
        ip: expect.any(String),
        title: 'Chrome',
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
    ]);
  });

  it('Выйти из текущего девайса по id', async () => {
    const cookies1 = infoUser1.headers['set-cookie'];
    const cookies2 = infoUser2.headers['set-cookie'];
    await test.delete(`/security/devices/1234`).expect(401);
    await test
      .delete(`/security/devices/1234`)
      .set('Cookie', cookies2)
      .expect(404);
    const info = await test
      .get(`/security/devices`)
      .set('Cookie', cookies2)
      .expect(200);
    await test
      .delete(`/security/devices/${info.body[0].deviceId}`)
      .set('Cookie', cookies1)
      .expect(403);
    await test
      .delete(`/security/devices/${info.body[0].deviceId}`)
      .set('Cookie', cookies2)
      .expect(204);
    await test.get(`/security/devices`).set('Cookie', cookies2).expect(401);
  });
});

describe('Quiz questions sa', () => {
  jest.setTimeout(5 * 60 * 1000);
  let app: INestApplication;
  let test;
  let question;
  let questionId;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Получить все вопросы', async () => {
    await test.get('/sa/quiz/questions').expect(401);
    const allQuestions = await test
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(allQuestions.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('Создание вопроса', async () => {
    await test
      .post('/sa/quiz/questions')
      .send({
        body: 'stringstri',
        correctAnswers: ['string'],
      })
      .expect(401);
    const response = await test
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: '',
        correctAnswers: ['', '', '', '', '', '', '', '', '', '', '', ''],
      })
      .expect(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'body',
        },
        {
          message: expect.any(String),
          field: 'correctAnswers',
        },
      ],
    });
    const res = await test
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: 'stringstri',
        correctAnswers: [1, 'string'],
      })
      .expect(201);
    expect(res.body).toEqual({
      id: res.body.id,
      body: 'stringstri',
      correctAnswers: [1, 'string'],
      published: false,
      createdAt: expect.any(String),
      updatedAt: null,
    });
    question = await test
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(question.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: question.body.items[0].id,
          body: 'stringstri',
          correctAnswers: [1, 'string'],
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        },
      ],
    });
  });

  it('Создание второго вопроса и проверка queryRepository', async () => {
    const question1 = await test
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: 'stringstri123',
        correctAnswers: ['string', 'asdfas'],
      })
      .expect(201);
    const query = await test
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(query.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: question1.body.id,
          body: 'stringstri123',
          correctAnswers: ['string', 'asdfas'],
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        },
        {
          id: question.body.items[0].id,
          body: 'stringstri',
          correctAnswers: [1, 'string'],
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        },
      ],
    });
  });

  it('Изменить вопрос по id', async () => {
    questionId = question.body.items[0].id;
    await test
      .put(`/sa/quiz/questions/${questionId}`)
      .send({
        body: 'update',
        correctAnswers: ['update question'],
      })
      .expect(401);
    await test
      .put(`/sa/quiz/questions/123`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: 'update question',
        correctAnswers: ['update question'],
      })
      .expect(404);
    const response = await test
      .put(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: '',
        correctAnswers: [],
      })
      .expect(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'body',
        },
        {
          message: expect.any(String),
          field: 'correctAnswers',
        },
      ],
    });
    await test
      .put(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        body: 'update question',
        correctAnswers: [1, 'update question'],
      })
      .expect(204);
  });

  it('Делаем вопрос публичным или нет, по id', async () => {
    await test
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .send({
        published: true,
      })
      .expect(401);
    const response = await test
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        published: 'asdf',
      })
      .expect(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'published',
        },
      ],
    });
    await test
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        published: true,
      })
      .expect(204);
    const result = await test
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(result.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: expect.any(String),
          body: 'stringstri123',
          correctAnswers: ['string', 'asdfas'],
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        },
        {
          id: expect.any(String),
          body: 'update question',
          correctAnswers: [1, 'update question'],
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    });
  });

  it('Удаляем вопрос по id', async () => {
    await test.delete(`/sa/quiz/questions/${questionId}`).expect(401);
    await test
      .delete(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(204);
    await test
      .delete(`/sa/quiz/questions/${questionId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(404);
  });
});

describe('Pair quiz game all', () => {
  let app: INestApplication;
  let test;
  let accessToken1;
  let accessToken2;
  let game1;
  let game2;
  let game3;
  let game4;

  jest.setTimeout(5 * 60 * 1000);

  const user1 = {
    login: 'Alex',
    password: 'QWERTY',
    email: '5030553@gmail.com',
  };
  const user2 = {
    login: 'Alex1',
    password: 'QWERTY',
    email: '50305531@gmail.com',
  };
  let player1: User = null;
  let player2: User = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Создание двух пользователей и login user1 and user2', async () => {
    player1 = await new Helper().user(user1, 'admin', 'qwerty', test);
    player2 = await new Helper().user(user2, 'admin', 'qwerty', test);
    const info1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });
    expect(info1.status).toBe(200);
    accessToken1 = info1.body;
    expect(accessToken1).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken1);
    const info2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    expect(info2.status).toBe(200);
    accessToken2 = info2.body;
    expect(accessToken2).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('Создание новой игры', async () => {
    await test.post('/pair-game-quiz/pairs/connection').expect(401);
    game1 = await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(game1.body).toEqual({
      id: game1.body.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: player1.id,
          login: player1.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate: game1.body.pairCreatedDate,
      startGameDate: null,
      finishGameDate: null,
    });
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('Возвращаем текущую незавершенную пользовательскую игру', async () => {
    await test.get('/pair-game-quiz/pairs/my-current').expect(401);
    const game = await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(game.body).toEqual({
      id: game.body.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: 'Alex',
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: game.body.questions,
      status: game.body.status,
      pairCreatedDate: game.body.pairCreatedDate,
      startGameDate: null,
      finishGameDate: null,
    });
    expect.setState(accessToken2);
    await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(404);
  });

  it('Возвращаем игру по id', async () => {
    await test
      .get(`/pair-game-quiz/pairs/${game1.body.id}`)
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(403);
    expect.setState(accessToken1);
    await test.get(`/pair-game-quiz/pairs/2345`).expect(401);
    await test
      .get(`/pair-game-quiz/pairs/1234567891111`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(404);
    const infoGame = await test
      .get(`/pair-game-quiz/pairs/456`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(400);
    expect(infoGame.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'id',
        },
      ],
    });
    const info = await test
      .get(`/pair-game-quiz/pairs/${game1.body.id}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      id: game1.body.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: player1.id,
          login: player1.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate: info.body.pairCreatedDate,
      startGameDate: null,
      finishGameDate: null,
    });
  });

  it('Отправить ответ на следующий вопрос без ответа в активной паре', async () => {
    await test.post(`/pair-game-quiz/pairs/my-current/answers`).expect(401);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: 'string',
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('Создать вопросы и ответы для игры', async () => {
    for (let a = 1; a <= 10; a++) {
      await test
        .post('/sa/quiz/questions')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          body: `new question ${a}`,
          correctAnswers: [`${a}`, a],
        })
        .expect(201);
    }
    const allQuestions = await test
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    expect(allQuestions.body.items.length).toEqual(10);
    expect(allQuestions.body.items[9].correctAnswers).toEqual(['1', 1]);
  });

  it('Подключение второго игрока к игре', async () => {
    expect.setState(accessToken2);
    const info = await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info.body).toEqual({
      id: info.body.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: player1.id,
          login: player1.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: player2.id,
          login: player2.login,
        },
        score: 0,
      },
      questions: expect.any(Array),
      status: 'Active',
      pairCreatedDate: info.body.pairCreatedDate,
      startGameDate: info.body.startGameDate,
      finishGameDate: null,
    });
  });

  it('Проверяем на проавильность работы игры', async () => {
    const gameForId = await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    game1 = await test
      .get(`/pair-game-quiz/pairs/test-my-current/${gameForId.body.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    const info11 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[0][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info11.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Correct',
      addedAt: info11.body.addedAt,
    });
    const info12 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: 'string',
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info12.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Incorrect',
      addedAt: info12.body.addedAt,
    });
    expect.setState(accessToken2);
    const info21 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[0][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info21.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Correct',
      addedAt: info21.body.addedAt,
    });
    const info22 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[1][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info22.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Correct',
      addedAt: info22.body.addedAt,
    });
    expect.setState(accessToken1);
    const info13 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[2][1],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info13.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Correct',
      addedAt: info13.body.addedAt,
    });
    const info14 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info14.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Correct',
      addedAt: info14.body.addedAt,
    });
    const info15 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info15.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Incorrect',
      addedAt: info15.body.addedAt,
    });
    expect.setState(accessToken2);
    const info23 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[3][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info23.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Incorrect',
      addedAt: info23.body.addedAt,
    });
    const info24 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[2][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info24.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Incorrect',
      addedAt: info24.body.addedAt,
    });
    const info25 = await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game1.body.allAnswers[3][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(info25.body).toEqual({
      questionId: expect.any(String),
      answerStatus: 'Incorrect',
      addedAt: info25.body.addedAt,
    });
    const gameByIdFinish = await test
      .get(`/pair-game-quiz/pairs/${gameForId.body.id}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(gameByIdFinish.body).toEqual({
      id: game1.body.gameId,
      firstPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: info11.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: info12.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: info13.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: info14.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: info15.body.addedAt,
          },
        ],
        player: {
          id: player1.id,
          login: player1.login,
        },
        score: 4,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: info21.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: info22.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: info23.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: info24.body.addedAt,
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: info25.body.addedAt,
          },
        ],
        player: {
          id: player2.id,
          login: player2.login,
        },
        score: 2,
      },
      questions: expect.any(Array),
      status: 'Finished',
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: expect.any(String),
    });
  });

  it('Создаём игру номер 2', async () => {
    const info1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });
    expect(info1.status).toBe(200);
    accessToken1 = info1.body;
    expect(accessToken1).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken1);
    const info2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    expect(info2.status).toBe(200);
    accessToken2 = info2.body;
    expect(accessToken2).toEqual({
      accessToken: expect.any(String),
    });
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    const gameForId = await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    game2 = await test
      .get(`/pair-game-quiz/pairs/test-my-current/${gameForId.body.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[0][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: 'string',
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[0][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[1][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken1);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[2][1],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[3][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[2][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game2.body.allAnswers[4][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
  });

  it('Создаём игру номер 3', async () => {
    const info1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });
    expect(info1.status).toBe(200);
    accessToken1 = info1.body;
    expect(accessToken1).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken1);
    const info2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    expect(info2.status).toBe(200);
    accessToken2 = info2.body;
    expect(accessToken2).toEqual({
      accessToken: expect.any(String),
    });
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    const gameForId = await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    game3 = await test
      .get(`/pair-game-quiz/pairs/test-my-current/${gameForId.body.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[0][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: 'string',
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[0][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[1][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken1);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[2][1],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[3][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game3.body.allAnswers[2][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    const gameInfo1 = await test
      .get(`/pair-game-quiz/pairs/${game3.body.gameId}`)
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(gameInfo1.body.status).toEqual('Active');
    await new Promise((a) => setTimeout(a, 10000));
    const gameInfo2 = await test
      .get(`/pair-game-quiz/pairs/${game3.body.gameId}`)
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect(gameInfo2.body.status).toEqual('Finished');
  });

  it('Создаём игру номер 4', async () => {
    const info1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user2.login, password: user2.password });
    expect(info1.status).toBe(200);
    accessToken2 = info1.body;
    expect(accessToken2).toEqual({
      accessToken: expect.any(String),
    });
    expect.setState(accessToken2);
    const info2 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: user1.login, password: user1.password });
    expect(info2.status).toBe(200);
    accessToken1 = info2.body;
    expect(accessToken1).toEqual({
      accessToken: expect.any(String),
    });
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken1);
    await test
      .post('/pair-game-quiz/pairs/connection')
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    const gameForId = await test
      .get('/pair-game-quiz/pairs/my-current')
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    game4 = await test
      .get(`/pair-game-quiz/pairs/test-my-current/${gameForId.body.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[0][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: 'string',
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken1);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[0][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[1][1],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken2);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[2][1],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[3][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[3][0],
      })
      .auth(accessToken2.accessToken, { type: 'bearer' })
      .expect(200);
    expect.setState(accessToken1);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[3][1],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[2][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    await test
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send({
        answer: game4.body.allAnswers[3][0],
      })
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
  });

  it('Проверяем правильный вывод игр', async () => {
    const finishGame1 = await test
      .get(`/pair-game-quiz/pairs/${game1.body.gameId}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    const finishGame2 = await test
      .get(`/pair-game-quiz/pairs/${game2.body.gameId}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    const finishGame3 = await test
      .get(`/pair-game-quiz/pairs/${game3.body.gameId}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    const finishGame4 = await test
      .get(`/pair-game-quiz/pairs/${game4.body.gameId}`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    const allGames = await test
      .get(`/pair-game-quiz/pairs/my?sortBy=status&sortDirection=desc`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(allGames.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        finishGame4.body,
        finishGame3.body,
        finishGame2.body,
        finishGame1.body,
      ],
    });
  });

  it('Получить всю статистику по играм конкретного игрока', async () => {
    await test.get(`/pair-game-quiz/users/my-statistic`).expect(401);
    const allStatic = await test
      .get(`/pair-game-quiz/users/my-statistic`)
      .auth(accessToken1.accessToken, { type: 'bearer' })
      .expect(200);
    expect(allStatic.body).toEqual({
      sumScore: 14,
      avgScores: 3.5,
      gamesCount: 4,
      winsCount: 3,
      lossesCount: 1,
      drawsCount: 0,
    });
  });

  it('Получить статистику для игрока, который не играл', async () => {
    await new Helper().user(
      {
        login: 'Alex3',
        password: 'QWERTY',
        email: '50305533@gmail.com',
      },
      'admin',
      'qwerty',
      test,
    );
    const info1 = await test
      .post('/auth/login')
      .set('user-agent', 'Chrome')
      .send({ loginOrEmail: 'Alex3', password: 'QWERTY' });
    expect(info1.status).toBe(200);
    const accessToken3 = info1.body;
    expect.setState(accessToken3);
    const allStatic = await test
      .get(`/pair-game-quiz/users/my-statistic`)
      .auth(accessToken3.accessToken, { type: 'bearer' })
      .expect(200);
    expect(allStatic.body).toEqual({
      sumScore: 0,
      avgScores: 0,
      gamesCount: 0,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0,
    });
  });

  it('Получаем всю статистику по играм', async () => {
    const info = await test.get('/pair-game-quiz/users/top');
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          sumScore: 14,
          avgScores: 3.5,
          gamesCount: 4,
          winsCount: 3,
          lossesCount: 1,
          drawsCount: 0,
          player: {
            id: player1.id,
            login: player1.login,
          },
        },
        {
          sumScore: 11,
          avgScores: 2.75,
          gamesCount: 4,
          winsCount: 1,
          lossesCount: 3,
          drawsCount: 0,
          player: {
            id: player2.id,
            login: player2.login,
          },
        },
      ],
    });
  });

  it('Получаем всю статистику по играм с queryParams', async () => {
    const info = await test.get(
      '/pair-game-quiz/users/top?sort=gamesCount asc&sort=avgScores asc&sort=sumScore asc',
    );
    expect(info.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          sumScore: 11,
          avgScores: 2.75,
          gamesCount: 4,
          winsCount: 1,
          lossesCount: 3,
          drawsCount: 0,
          player: {
            id: player2.id,
            login: player2.login,
          },
        },
        {
          sumScore: 14,
          avgScores: 3.5,
          gamesCount: 4,
          winsCount: 3,
          lossesCount: 1,
          drawsCount: 0,
          player: {
            id: player1.id,
            login: player1.login,
          },
        },
      ],
    });
  });
});

describe('Create test for auth', () => {
  jest.setTimeout(5 * 60 * 1000);
  let app: INestApplication;
  let test;
  let mailService: MailerService;
  let sendMailSpy: jest.SpyInstance;
  let confirm;
  const user = {
    login: 'Alex',
    password: 'QWERTY',
    email: '5030553@gmail.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    test = request(app.getHttpServer());
    mailService = moduleFixture.get<MailerService>(MailerService);
    sendMailSpy = jest.spyOn(mailService, 'sendMail');
    return test.del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Регистрируем нового пользователя', async () => {
    await test.post('/auth/registration').send(user).expect(204);
    const [call] = sendMailSpy.mock.calls;
    const [mailOptions] = call;
    const regex = /code=([a-zA-Z0-9-]+)/;
    confirm = mailOptions.html.match(regex)[1];

    await expect(sendMailSpy).toHaveBeenCalledWith({
      from: 'Alex <testnodemaileremail2@gmail.com>',
      to: user.email,
      subject: 'Registration',
      html: `<h1>Thank for your registration</h1>
                       <p>To finish registration please follow the link below:
                          <a href='https://somesite.com/registration-confirmation?code=${confirm}'>complete registration</a>
                        </p>`,
    });
    const info1 = await test
      .post('/auth/registration')
      .send({ login: '', password: '', email: '' })
      .expect(400);
    expect(info1.body).toEqual({
      errorsMessages: [
        { message: 'Не верно заполнено поле', field: 'login' },
        { message: 'email must be an email', field: 'email' },
        { message: 'Не верно заполнено поле', field: 'password' },
      ],
    });
  });

  it('Подтверждаем регистрацию по коду', async () => {
    await test
      .post('/auth/registration-confirmation')
      .send({ code: confirm })
      .expect(204);
    await test
      .post('/auth/registration-confirmation')
      .send({ code: '1234' })
      .expect(400);
  });

  it('Запрашиваем новый код по email', async () => {
    await test
      .post('/auth/registration-email-resending')
      .send({ email: user.email })
      .expect(204);
    const info = await test
      .post('/auth/registration-email-resending')
      .send({ email: '1234!gmail.com' })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [{ message: 'email must be an email', field: 'email' }],
    });
  });

  it('login и получения токена', async () => {
    const token = await test
      .post('/auth/login')
      .send({
        loginOrEmail: user.login,
        password: user.password,
      })
      .set('user-agent', 'Chrome')
      .expect(200);
    await test
      .post('/auth/login')
      .send({
        loginOrEmail: 'user.login',
        password: 'user.password',
      })
      .set('user-agent', 'Chrome')
      .expect(401);
    const info = await test
      .get('/auth/me')
      .auth(token.body.accessToken, { type: 'bearer' })
      .set('user-agent', 'Chrome')
      .expect(200);
    expect(info.body).toEqual({
      email: user.email,
      login: user.login,
      userId: expect.any(String),
    });
    await test
      .get('/auth/me')
      .auth('token.body.accessToken', { type: 'bearer' })
      .set('user-agent', 'Chrome')
      .expect(401);
  });

  it('Делаем запрос на смену пароля', async () => {
    await test
      .post('/auth/password-recovery')
      .send({ email: user.email })
      .expect(204);
    const passwordRecoveryCall = sendMailSpy.mock.calls.find(
      ([mailOptions]) => mailOptions.subject === 'Password Recovery',
    );
    const [passwordRecoveryMailOptions] = passwordRecoveryCall;
    const regex = /recoveryCode=([a-zA-Z0-9-]+)/;
    confirm = passwordRecoveryMailOptions.html.match(regex)[1];
    await expect(sendMailSpy).toHaveBeenCalledWith({
      from: 'Alex <testnodemaileremail2@gmail.com>',
      to: user.email,
      subject: 'Password Recovery',
      html: `<h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${confirm}'>recovery password</a>
                </p>`,
    });
    await test
      .post('/auth/password-recovery')
      .send({ email: 'a!gmail.co' })
      .expect(400);
  });

  it('Устанавливаем новый пароль входим и выходим', async () => {
    await test
      .post('/auth/new-password')
      .send({
        newPassword: 'string',
        recoveryCode: confirm,
      })
      .expect(204);
    const info = await test
      .post('/auth/new-password')
      .send({
        newPassword: '',
        recoveryCode: '123',
      })
      .expect(400);
    expect(info.body).toEqual({
      errorsMessages: [
        { message: 'Не верно заполнено поле', field: 'newPassword' },
        { message: 'Не верные данные', field: 'recoveryCode' },
      ],
    });
    const response = await test
      .post('/auth/login')
      .send({ loginOrEmail: 'Alex', password: 'string' })
      .set('user-agent', 'Chrome')
      .expect(200);
    await test
      .post('/auth/login')
      .send({ loginOrEmail: 'Alex', password: 'string1' })
      .set('user-agent', 'Chrome')
      .expect(401);
    const refreshToken = response.headers['set-cookie'];
    await test.post('/auth/logout').set('Cookie', 'asdfadf').expect(401);
    const info2 = await test
      .get('/auth/me')
      .auth(response.body.accessToken, { type: 'bearer' })
      .set('user-agent', 'Chrome')
      .expect(200);
    expect(info2.body).toEqual({
      email: user.email,
      login: user.login,
      userId: expect.any(String),
    });
    await test.post('/auth/logout').set('Cookie', refreshToken).expect(204);
  });
});

// describe('Test AWS3', () => {
//   jest.setTimeout(5 * 60 * 1000);
//   let app: INestApplication;
//   let test;
//   const user = {
//     login: 'Alex',
//     password: 'QWERTY',
//     email: '5030553@gmail.com',
//   };
//   const userTestInfo = {
//     login: 'Alex1',
//     password: 'QWERTY',
//     email: '50305531@gmail.com',
//   };
//   const blogInputData: CreateBlogDto = {
//     name: 'String',
//     description: '421421',
//     websiteUrl: 'www.anySite.com',
//   };
//   const postInputData: CreatePostForBlogDto = {
//     title: 'qwererw',
//     shortDescription: 'asdfsdfasd',
//     content: 'adsfdsfasdf',
//   };
//   let accessToken1;
//   let accessToken2;
//   let blog;
//   let post;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//     app = moduleFixture.createNestApplication();
//     app = createApp(app);
//     await app.init();
//     test = request(app.getHttpServer());
//     return test.del('/testing/all-data').expect(204);
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('Создаем двух пользоаветелей', async () => {
//     await new Helper().user(user, 'admin', 'qwerty', test);
//     await new Helper().user(userTestInfo, 'admin', 'qwerty', test);
//   });
//
//   it('login users', async () => {
//     const response1 = await test
//       .post('/auth/login')
//       .set('user-agent', 'Chrome')
//       .send({ loginOrEmail: user.login, password: user.password });
//     expect(response1.status).toBe(200);
//     accessToken1 = response1.body;
//     expect(accessToken1).toEqual({
//       accessToken: expect.any(String),
//     });
//     const response2 = await test
//       .post('/auth/login')
//       .set('user-agent', 'Chrome')
//       .send({
//         loginOrEmail: userTestInfo.login,
//         password: userTestInfo.password,
//       });
//     expect(response2.status).toBe(200);
//     accessToken2 = response2.body;
//     expect(accessToken2).toEqual({
//       accessToken: expect.any(String),
//     });
//   });
//
//   it('Создаем blog', async () => {
//     blog = await new Helper().blog(
//       blogInputData,
//       accessToken1.accessToken,
//       test,
//     );
//   });
//
//   it('Создаем post', async () => {
//     post = await new Helper().post(
//       postInputData,
//       accessToken1.accessToken,
//       test,
//       blog,
//     );
//   });
//
//   it('Создаем wallpaper для блога и проверяем верный вывод', async () => {
//     const info = await test
//       .post(`/blogger/blogs/${blog.id}/images/wallpaper`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/blogWalpaper.jpg')
//       .expect(201);
//     expect(info.body).toEqual({
//       wallpaper: {
//         url: `https://storage.yandexcloud.net/my1bucket/images/wallpaper/${blog.id}_blog.png`,
//         width: 1028,
//         height: 312,
//         fileSize: 5872,
//       },
//       main: [],
//     });
//   });
//
//   it('Создаем wallpaper для блога и проверяем на ошибку 400', async () => {
//     const info1 = await test
//       .post(`/blogger/blogs/${blog.id}/images/wallpaper`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/L5do38VAOnI.jpg')
//       .expect(400);
//     expect(info1.body).toEqual({
//       errorsMessages: [
//         { message: expect.any(String), field: 'width' },
//         { message: expect.any(String), field: 'height' },
//         { message: expect.any(String), field: 'size' },
//       ],
//     });
//   });
//
//   it('Создаем wallpaper для блога и проверяем на ошибки 403', async () => {
//     await test
//       .post(`/blogger/blogs/${blog.id}/images/wallpaper`)
//       .auth(accessToken2.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/blogWalpaper.jpg')
//       .expect(403);
//   });
//
//   it('Создаем wallpaper для блога и проверяем на ошибки 401', async () => {
//     await test.post(`/blogger/blogs/${blog.id}/images/wallpaper`).expect(401);
//   });
//
//   it('Создаём main для блога и проверяем верный вывод', async () => {
//     const info = await test
//       .post(`/blogger/blogs/${blog.id}/images/main`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/blogMain.jpg')
//       .expect(201);
//     expect(info.body).toEqual({
//       wallpaper: {
//         url: `https://storage.yandexcloud.net/my1bucket/images/wallpaper/${blog.id}_blog.png`,
//         width: 1028,
//         height: 312,
//         fileSize: 5872,
//       },
//       main: [
//         {
//           url: `https://storage.yandexcloud.net/my1bucket/images/main/${blog.id}_blog.png`,
//           width: 156,
//           height: 156,
//           fileSize: 1027,
//         },
//       ],
//     });
//   });
//
//   it('Создаём main для блога и проверяем на ошибку 400', async () => {
//     const info1 = await test
//       .post(`/blogger/blogs/${blog.id}/images/main`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/L5do38VAOnI.jpg')
//       .expect(400);
//     expect(info1.body).toEqual({
//       errorsMessages: [
//         { message: expect.any(String), field: 'width' },
//         { message: expect.any(String), field: 'size' },
//         { message: expect.any(String), field: 'height' },
//       ],
//     });
//   });
//
//   it('Создаём main для блога и проверяем на ошибки 403', async () => {
//     await test
//       .post(`/blogger/blogs/${blog.id}/images/main`)
//       .auth(accessToken2.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/blogMain.jpg')
//       .expect(403);
//   });
//
//   it('Создаём main для блога и проверяем на ошибки 401', async () => {
//     await test.post(`/blogger/blogs/${blog.id}/images/main`).expect(401);
//   });
//
//   it('Создаём main для поста и проверяем верный вывод', async () => {
//     const info = await test
//       .post(`/blogger/blogs/${blog.id}/posts/${post.id}/images/main`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/postMain.jpg')
//       .expect(201);
//     expect(info.body).toEqual({
//       main: [
//         {
//           url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//           width: 940,
//           height: 432,
//           fileSize: 7137,
//         },
//         {
//           url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//           width: 300,
//           height: 180,
//           fileSize: 637,
//         },
//         {
//           url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//           width: 149,
//           height: 96,
//           fileSize: 356,
//         },
//       ],
//     });
//   });
//
//   it('Создаём main для поста и проверяем на ошибку 400', async () => {
//     const info1 = await test
//       .post(`/blogger/blogs/${blog.id}/posts/${post.id}/images/main`)
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/L5do38VAOnI.jpg')
//       .expect(400);
//     expect(info1.body).toEqual({
//       errorsMessages: [
//         { message: expect.any(String), field: 'size' },
//         { message: expect.any(String), field: 'width' },
//         { message: expect.any(String), field: 'height' },
//       ],
//     });
//   });
//
//   it('Создаём main для поста и проверяем на ошибки 403', async () => {
//     await test
//       .post(`/blogger/blogs/${blog.id}/posts/${post.id}/images/main`)
//       .auth(accessToken2.accessToken, { type: 'bearer' })
//       .attach('file', 'D:/postMain.jpg')
//       .expect(403);
//   });
//
//   it('Создаём main для поста и проверяем на ошибку 401', async () => {
//     await test
//       .post(`/blogger/blogs/${blog.id}/posts/${post.id}/images/main`)
//       .expect(401);
//   });
//
//   it('Проверяем правильный вывод данных', async () => {
//     const info1 = await test
//       .get('/blogger/blogs')
//       .auth(accessToken1.accessToken, { type: 'bearer' })
//       .expect(200);
//     expect(info1.body).toEqual({
//       pagesCount: 1,
//       page: 1,
//       pageSize: 10,
//       totalCount: 1,
//       items: [
//         {
//           id: blog.id,
//           name: blog.name,
//           websiteUrl: blog.websiteUrl,
//           description: blog.description,
//           createdAt: blog.createdAt,
//           isMembership: false,
//           images: {
//             wallpaper: {
//               url: `https://storage.yandexcloud.net/my1bucket/images/wallpaper/${blog.id}_blog.png`,
//               width: 1028,
//               height: 312,
//               fileSize: 5872,
//             },
//             main: [
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${blog.id}_blog.png`,
//                 width: 156,
//                 height: 156,
//                 fileSize: 1027,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//                 width: 940,
//                 height: 432,
//                 fileSize: 7137,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//                 width: 300,
//                 height: 180,
//                 fileSize: 637,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//                 width: 149,
//                 height: 96,
//                 fileSize: 356,
//               },
//             ],
//           },
//         },
//       ],
//     });
//     const info2 = await test.get('/blogs').expect(200);
//     expect(info2.body).toEqual({
//       pagesCount: 1,
//       page: 1,
//       pageSize: 10,
//       totalCount: 1,
//       items: [
//         {
//           id: blog.id,
//           name: blog.name,
//           websiteUrl: blog.websiteUrl,
//           description: blog.description,
//           createdAt: blog.createdAt,
//           isMembership: false,
//           images: {
//             wallpaper: {
//               url: `https://storage.yandexcloud.net/my1bucket/images/wallpaper/${blog.id}_blog.png`,
//               width: 1028,
//               height: 312,
//               fileSize: 5872,
//             },
//             main: [
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${blog.id}_blog.png`,
//                 width: 156,
//                 height: 156,
//                 fileSize: 1027,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//                 width: 940,
//                 height: 432,
//                 fileSize: 7137,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//                 width: 300,
//                 height: 180,
//                 fileSize: 637,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//                 width: 149,
//                 height: 96,
//                 fileSize: 356,
//               },
//             ],
//           },
//           subscribersCount: 0,
//           currentUserSubscriptionStatus: 'None',
//         },
//       ],
//     });
//     const info3 = await test.get(`/blogs/${blog.id}`).expect(200);
//     expect(info3.body).toEqual({
//       id: blog.id,
//       name: blog.name,
//       websiteUrl: blog.websiteUrl,
//       description: blog.description,
//       createdAt: blog.createdAt,
//       isMembership: false,
//       images: {
//         wallpaper: {
//           url: `https://storage.yandexcloud.net/my1bucket/images/wallpaper/${blog.id}_blog.png`,
//           width: 1028,
//           height: 312,
//           fileSize: 5872,
//         },
//         main: [
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${blog.id}_blog.png`,
//             width: 156,
//             height: 156,
//             fileSize: 1027,
//           },
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//             width: 940,
//             height: 432,
//             fileSize: 7137,
//           },
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//             width: 300,
//             height: 180,
//             fileSize: 637,
//           },
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//             width: 149,
//             height: 96,
//             fileSize: 356,
//           },
//         ],
//       },
//       subscribersCount: 0,
//       currentUserSubscriptionStatus: 'None',
//     });
//     const info4 = await test.get(`/blogs/${blog.id}/posts`).expect(200);
//     expect(info4.body).toEqual({
//       pagesCount: 1,
//       page: 1,
//       pageSize: 10,
//       totalCount: 1,
//       items: [
//         {
//           id: post.id,
//           title: post.title,
//           shortDescription: post.shortDescription,
//           content: post.content,
//           blogId: post.blogId,
//           blogName: post.blogName,
//           createdAt: post.createdAt,
//           extendedLikesInfo: {
//             likesCount: 0,
//             dislikesCount: 0,
//             myStatus: 'None',
//             newestLikes: [],
//           },
//           images: {
//             main: [
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//                 width: 940,
//                 height: 432,
//                 fileSize: 7137,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//                 width: 300,
//                 height: 180,
//                 fileSize: 637,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//                 width: 149,
//                 height: 96,
//                 fileSize: 356,
//               },
//             ],
//           },
//         },
//       ],
//     });
//     const info5 = await test.get(`/posts`).expect(200);
//     expect(info5.body).toEqual({
//       pagesCount: 1,
//       page: 1,
//       pageSize: 10,
//       totalCount: 1,
//       items: [
//         {
//           id: post.id,
//           title: post.title,
//           shortDescription: post.shortDescription,
//           content: post.content,
//           blogId: post.blogId,
//           blogName: post.blogName,
//           createdAt: post.createdAt,
//           extendedLikesInfo: {
//             likesCount: 0,
//             dislikesCount: 0,
//             myStatus: 'None',
//             newestLikes: [],
//           },
//           images: {
//             main: [
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//                 width: 940,
//                 height: 432,
//                 fileSize: 7137,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//                 width: 300,
//                 height: 180,
//                 fileSize: 637,
//               },
//               {
//                 url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//                 width: 149,
//                 height: 96,
//                 fileSize: 356,
//               },
//             ],
//           },
//         },
//       ],
//     });
//     const info6 = await test.get(`/posts/${post.id}`).expect(200);
//     expect(info6.body).toEqual({
//       id: post.id,
//       title: post.title,
//       shortDescription: post.shortDescription,
//       content: post.content,
//       blogId: post.blogId,
//       blogName: post.blogName,
//       createdAt: post.createdAt,
//       extendedLikesInfo: {
//         likesCount: 0,
//         dislikesCount: 0,
//         myStatus: 'None',
//         newestLikes: [],
//       },
//       images: {
//         main: [
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_original.png`,
//             width: 940,
//             height: 432,
//             fileSize: 7137,
//           },
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_middle.png`,
//             width: 300,
//             height: 180,
//             fileSize: 637,
//           },
//           {
//             url: `https://storage.yandexcloud.net/my1bucket/images/main/${post.id}_post_small.png`,
//             width: 149,
//             height: 96,
//             fileSize: 356,
//           },
//         ],
//       },
//     });
//   });
// });
