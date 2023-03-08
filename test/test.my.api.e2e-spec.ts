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
        items: [newBlog2, newBlog1],
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
        },
        {
          id: newBlog1.id,
          name: newBlog1.name,
          description: newBlog1.description,
          websiteUrl: newBlog1.websiteUrl,
          createdAt: newBlog1.createdAt,
          isMembership: newBlog1.isMembership,
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
