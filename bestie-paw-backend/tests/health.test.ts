/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Health Module Integration Tests', () => {
  const user = { username: 'healthuser', email: 'healthuser@example.com', password: 'Password123!' };
  const petPayload = { name: 'HealthPet', type: 'CAT', gender: 'FEMALE' };
  
  let token: string;
  let petId: string;

  beforeEach(async () => {
    // Cleanup DB
    await prisma.user.deleteMany();

    // Setup user
    await request(app).post('/api/auth/register').send(user);
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    token = loginRes.body.data.accessToken;

    // Setup pet
    const petRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`).send(petPayload);
    petId = petRes.body.data.id;
  });

  const healthPayload = {
    type: 'VACCINE',
    title: 'Rabies Vaccine',
    date: new Date().toISOString(),
    description: 'Annual rabies shot',
    vetName: 'Dr. Smith',
    clinic: 'Happy Paws Clinic'
  };

  it('should create a health record and return uppercase enum', async () => {
    const res = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(healthPayload.title);
    expect(res.body.data.type).toBe('VACCINE'); // Assert uppercase enum
  });

  it('should list health records with pagination envelope', async () => {
    // Create record first
    await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);

    const res = await request(app)
      .get(`/api/pets/${petId}/health?page=1&limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Assert pagination envelope
    expect(res.body.data.records).toBeDefined();
    expect(Array.isArray(res.body.data.records)).toBe(true);
    expect(res.body.data.total).toBeDefined();
    expect(res.body.data.page).toBeDefined();
    expect(res.body.data.limit).toBeDefined();

    expect(res.body.data.records.length).toBe(1);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(10);
    expect(res.body.data.records[0].title).toBe(healthPayload.title);
    expect(res.body.data.records[0].type).toBe('VACCINE');
  });

  it('should delete a health record', async () => {
    // Create record first
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    
    const recordId = createRes.body.data.id;

    // Delete record
    const deleteRes = await request(app)
      .delete(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify deletion
    const getRes = await request(app)
      .get(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error.code).toBe('NOT_FOUND');
  });
});
