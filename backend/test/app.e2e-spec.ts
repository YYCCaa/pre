// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);
  });

  it('/api/auth/login (POST)', async () => {
    // First register a user
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
      });

    // Then login
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
      });
  });
});