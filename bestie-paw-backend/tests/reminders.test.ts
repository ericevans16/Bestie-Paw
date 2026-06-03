/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Reminders Module — ownership / IDOR', () => {
  const user1 = { username: 'remuser1', email: 'remuser1@example.com', password: 'Password123!' };
  const user2 = { username: 'remuser2', email: 'remuser2@example.com', password: 'Password123!' };

  let token1: string;
  let token2: string;
  let pet1: string;
  let pet2: string;

  const future = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const reminderPayload = () => ({ title: 'Vaccine due', type: 'VACCINE', dueDate: future() });

  beforeEach(async () => {
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
        .send({ name: 'P1', type: 'DOG', gender: 'MALE' })
    ).body.data.id;
    pet2 = (
      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'P2', type: 'CAT', gender: 'FEMALE' })
    ).body.data.id;
  });

  const createReminderForUser1 = async () => {
    const res = await request(app)
      .post(`/api/pets/${pet1}/reminders`)
      .set('Authorization', `Bearer ${token1}`)
      .send(reminderPayload());
    return res.body.data.id as string;
  };

  it('owner can create and list reminders', async () => {
    await createReminderForUser1();
    const res = await request(app)
      .get(`/api/pets/${pet1}/reminders`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('owner can update and delete own reminder', async () => {
    const id = await createReminderForUser1();

    const upd = await request(app)
      .patch(`/api/pets/${pet1}/reminders/${id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'Updated' });
    expect(upd.status).toBe(200);
    expect(upd.body.data.title).toBe('Updated');

    const del = await request(app)
      .delete(`/api/pets/${pet1}/reminders/${id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(del.status).toBe(200);
  });

  // IDOR: attacker owns pet2 (passes ownership check) but targets a victim's
  // reminder that lives under pet1. Before the fix this updated the victim's row.
  it('must NOT update another user\'s reminder via own pet (IDOR)', async () => {
    const victimReminder = await createReminderForUser1();

    const res = await request(app)
      .patch(`/api/pets/${pet2}/reminders/${victimReminder}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'hacked' });
    expect(res.status).toBe(404);

    // Victim's reminder must be untouched.
    const list = await request(app)
      .get(`/api/pets/${pet1}/reminders`)
      .set('Authorization', `Bearer ${token1}`);
    expect(list.body.data[0].title).toBe('Vaccine due');
  });

  it('must NOT delete another user\'s reminder via own pet (IDOR)', async () => {
    const victimReminder = await createReminderForUser1();

    const res = await request(app)
      .delete(`/api/pets/${pet2}/reminders/${victimReminder}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(404);

    const list = await request(app)
      .get(`/api/pets/${pet1}/reminders`)
      .set('Authorization', `Bearer ${token1}`);
    expect(list.body.data.length).toBe(1);
  });

  it('must reject access to a pet you do not own (403)', async () => {
    await createReminderForUser1();
    const res = await request(app)
      .get(`/api/pets/${pet1}/reminders`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
