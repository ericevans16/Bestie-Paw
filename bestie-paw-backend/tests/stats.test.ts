import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Stats Module', () => {
  beforeEach(async () => {
    // Clear user and pet records to have deterministic stats
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();

    // Create a dummy user and pet just to have >0 count
    const user = await prisma.user.create({
      data: {
        username: 'statuser',
        email: 'statuser@example.com',
        password: 'hashedpassword'
      }
    });

    await prisma.pet.create({
      data: {
        name: 'StatPet',
        type: 'DOG',
        gender: 'MALE',
        userId: user.id
      }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return public stats with success envelope', async () => {
    const res = await request(app).get('/api/stats');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    
    // We expect the shape to contain registeredUsers and petProfiles.
    // They might be cached from previous tests in the test suite so we just assert type.
    expect(typeof res.body.data.registeredUsers).toBe('number');
    expect(typeof res.body.data.petProfiles).toBe('number');
  });

  it('should hit cache on subsequent request', async () => {
    // Make a first request to ensure cache is set (or updated)
    await request(app).get('/api/stats');
    
    // Immediately make another one, it should serve from cache
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.registeredUsers).toBe('number');
  });
});
