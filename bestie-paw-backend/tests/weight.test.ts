import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Weight Module', () => {
  const user1 = {
    username: 'weightuser1',
    email: 'weightuser1@example.com',
    password: 'Password123!'
  };

  const user2 = {
    username: 'weightuser2',
    email: 'weightuser2@example.com',
    password: 'Password123!'
  };

  let token1: string;
  let token2: string;
  let pet1: string;

  beforeEach(async () => {
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/api/auth/register').send(user1);
    token1 = (
      await request(app).post('/api/auth/login').send({ email: user1.email, password: user1.password })
    ).body.data.accessToken;

    await request(app).post('/api/auth/register').send(user2);
    token2 = (
      await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password })
    ).body.data.accessToken;

    pet1 = (
      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'P1', type: 'DOG', gender: 'MALE', weightKg: 10 })
    ).body.data.id;

    // Just create a second user to test unauthorized access
    await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'P2', type: 'CAT', gender: 'FEMALE', weightKg: 5 });
  });

  afterAll(async () => {
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();
  });

  it('POST /api/pets/:petId/weight should add record and sync pet.weightKg', async () => {
    const res = await request(app)
      .post(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ weightKg: 12.5, date: new Date().toISOString() });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.weightKg).toBe(12.5);

    // Verify pet weight is synced
    const petRes = await request(app)
      .get(`/api/pets/${pet1}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(petRes.body.data.weightKg).toBe(12.5);
  });

  it('GET /api/pets/:petId/weight should list weight records with pagination envelope', async () => {
    await request(app)
      .post(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ weightKg: 12.5, date: new Date().toISOString() });

    const res = await request(app)
      .get(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(50);
  });

  it('DELETE /api/pets/:petId/weight/:recordId should delete weight record', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ weightKg: 12.5, date: new Date().toISOString() });
    
    const recordId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/pets/${pet1}/weight/${recordId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const listRes = await request(app)
      .get(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token1}`);
    expect(listRes.body.data.items.find((i: { id: string }) => i.id === recordId)).toBeUndefined();
  });

  it('should reject access to another user\'s pet weight (403)', async () => {
    const res = await request(app)
      .get(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');

    const postRes = await request(app)
      .post(`/api/pets/${pet1}/weight`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ weightKg: 15, date: new Date().toISOString() });
    expect(postRes.status).toBe(403);
  });
});
