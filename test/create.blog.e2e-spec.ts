import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/common/helper/createApp';
import request from 'supertest';

describe('Create test for blog', () => {
  jest.setTimeout(5 * 60 * 1000);
  const user = {
    login: 'Alex0',
    password: 'QWERTY',
    email: '50305531@gmail.com',
  };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app = createApp(app);
    await app.init();
    return request(app.getHttpServer()).del('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create user', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(user)
      .expect(201);
  });

  it('login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user.login, password: user.password })
      .expect(200);
  });

  // it('Create Blog', () => {
  //   return request(app.getHttpServer()).post('/blogger/blogs/').expect(201);
  // });
});
