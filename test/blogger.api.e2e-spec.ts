import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/common/helper/createApp';
import request from 'supertest';
import { CreateBlogDto } from '../src/features/blogger/blogs/dto/blogger.dto';
import { Blog } from '../src/features/public/blogs/schema/blogs.schema';
import { Post } from '../src/features/public/posts/schema/posts.schema';
import { User } from '../src/features/sa/users/schema/user';

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
    return await test
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user1)
      .expect(201);
  });

  it('Create user 2', async () => {
    const user = await test
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user2)
      .expect(201);
    banUser = user.body;
  });

  it('login', async () => {
    const response = await test
      .post('/auth/login')
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
    const blog1 = await test
      .post('/blogger/blogs/')
      .auth(accessToken, { type: 'bearer' })
      .send(blogInputData)
      .expect(201);
    newBlog1 = blog1.body;
    expect(newBlog1).toEqual({
      id: newBlog1.id,
      name: newBlog1.name,
      description: newBlog1.description,
      websiteUrl: newBlog1.websiteUrl,
      createdAt: newBlog1.createdAt,
      isMembership: false,
    });
  });

  it('Создаем новый blog2', async () => {
    const { accessToken } = expect.getState();
    const blog = await test
      .post('/blogger/blogs')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'Alex1',
        description: '12312421421',
        websiteUrl: 'www.youtube1.com',
      })
      .expect(201);
    newBlog2 = blog.body;
    expect(newBlog2).toEqual({
      id: newBlog2.id,
      name: newBlog2.name,
      description: newBlog2.description,
      websiteUrl: newBlog2.websiteUrl,
      createdAt: newBlog2.createdAt,
      isMembership: false,
    });
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
  // it('Получаем blog по id', async () => {
  //   await test.get('/blogger/blogs/' + newBlog1.id).expect(200, newBlog1);
  // });
  // it('Получаем blog по не верному id', async () => {
  //   await test.get('/blogger/blog/' + newBlog1).expect(404);
  // });
  // it('Получаем все blogs', async () => {
  //   const { accessToken } = expect.getState();
  //   await test
  //     .get('/blogger/blogs')
  //     .auth(accessToken, { type: 'bearer' })
  //     .expect(200, {
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 2,
  //       items: [newBlog2, newBlog1],
  //     });
  // });
  // it('Получаем все blogs, без авторизации', async () => {
  //   await test.get('/blogger/blogs').expect(200, {
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 2,
  //     items: [newBlog2, newBlog1],
  //   });
  // });

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
    const post1 = await test
      .post('/blogger/blogs/' + newBlog2.id + '/posts')
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(201);
    newPost1 = post1.body;
    expect(post1.body).toEqual({
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
    const post2 = await test
      .post('/blogger/blogs/' + newBlog2.id + '/posts')
      .auth(accessToken, { type: 'bearer' })
      .send({
        title: 'string1',
        shortDescription: 'string1',
        content: 'string1',
      })
      .expect(201);
    newPost2 = post2.body;
    expect(post2.body).toEqual({
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
    });
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
  // it('Получаем post по blog id', async () => {
  //   await test.get('/blogs/' + newBlog2.id + '/posts').expect(200, {
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 2,
  //     items: [newPost2, newPost1],
  //   });
  // });
  //
  // it('Получаем post по не верному blog id', async () => {
  //   await test.get('/blogs/' + newBlog1.id + '/posts').expect(404);
  // });
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
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .put(`/blogger/blogs/${newBlog2.id}/posts/${newPost2.id}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({ title: 'string', shortDescription: 'string', content: 'string' })
      .expect(403);
  });

  it('Баним и разбаниваем пользователя', async () => {
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
      .send({ loginOrEmail: user2.login, password: user2.password });
    const token = response.body;
    await test
      .get(`/blogger/users/blog/${newBlog2.id}`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('Получаем все комментарии конкретного blog', async () => {
    const { accessToken } = expect.getState();
    await test.get(`/blogger/blogs/comments`).expect(401);
    const info = await test
      .get(`/blogger/blogs/comments`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    // expect(info.body).toEqual({
    //   pagesCount: 0,
    //   page: 0,
    //   pageSize: 0,
    //   totalCount: 0,
    //   items: [
    //     {
    //       id: 'string',
    //       content: 'string',
    //       commentatorInfo: {
    //         userId: 'string',
    //         userLogin: 'string',
    //       },
    //       createdAt: '2023-02-21T08:49:49.631Z',
    //       postInfo: {
    //         id: 'string',
    //         title: 'string',
    //         blogId: 'string',
    //         blogName: 'string',
    //       },
    //     },
    //   ],
    // });
  });
});

describe('Create tests for sa', () => {
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
});
