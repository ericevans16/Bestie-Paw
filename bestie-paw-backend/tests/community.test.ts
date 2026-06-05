import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Community Module', () => {
  const user1 = {
    username: 'comuser1',
    email: 'comuser1@example.com',
    password: 'Password123!'
  };

  const user2 = {
    username: 'comuser2',
    email: 'comuser2@example.com',
    password: 'Password123!'
  };

  let token1: string;
  let token2: string;

  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/api/auth/register').send(user1);
    token1 = (
      await request(app).post('/api/auth/login').send({ email: user1.email, password: user1.password })
    ).body.data.accessToken;

    await request(app).post('/api/auth/register').send(user2);
    token2 = (
      await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password })
    ).body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create and list posts with pagination envelope', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Hello Community!' });
    
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.content).toBe('Hello Community!');

    const listRes = await request(app)
      .get('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`);
    
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data.items)).toBe(true);
    expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.total).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.page).toBe(1);
  });

  it('should get post details', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post for details' });
    const postId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(postId);
  });

  it('should reject deleting a post not authored by the user (403)', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'My private post' });
    const postId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(delRes.status).toBe(403);
    expect(delRes.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow author to delete post', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'My post to delete' });
    const postId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  it('should create and delete comments', async () => {
    const postRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post for comment' });
    const postId = postRes.body.data.id;

    const commentRes = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Nice post!' });
    
    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.content).toBe('Nice post!');
    const commentId = commentRes.body.data.id;

    // Delete comment
    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(delRes.status).toBe(200);
  });

  it('should like and unlike post idempotently', async () => {
    const postRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post to like' });
    const postId = postRes.body.data.id;

    // Like
    const like1 = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(like1.status).toBe(200);
    expect(like1.body.data.liked).toBe(true);

    // Like again (idempotent)
    const like2 = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(like2.status).toBe(200);
    expect(like2.body.data.liked).toBe(false); // Service returns { liked: false } on unique constraint error

    // Unlike
    const unlike1 = await request(app)
      .delete(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(unlike1.status).toBe(200);
    expect(unlike1.body.data.liked).toBe(false);

    // Unlike again (idempotent)
    const unlike2 = await request(app)
      .delete(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(unlike2.status).toBe(200);
    expect(unlike2.body.data.liked).toBe(false);
  });

  it('should handle 404s and 403s on posts and comments', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    // 404 get post
    const getRes = await request(app)
      .get(`/api/community/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(getRes.status).toBe(404);

    // 404 delete post
    const delPostRes = await request(app)
      .delete(`/api/community/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(delPostRes.status).toBe(404);

    // 404 like post
    const likeRes = await request(app)
      .post(`/api/community/posts/${fakeId}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(likeRes.status).toBe(404);

    // 404 unlike post
    const unlikeRes = await request(app)
      .delete(`/api/community/posts/${fakeId}/like`)
      .set('Authorization', `Bearer ${token1}`);
    expect(unlikeRes.status).toBe(404);

    // 404 create comment
    const createCommentRes = await request(app)
      .post(`/api/community/posts/${fakeId}/comments`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'test' });
    expect(createCommentRes.status).toBe(404);

    // Create a real post for comment tests
    const postRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post for comment 404s' });
    const postId = postRes.body.data.id;

    // 404 delete comment
    const delCommentRes = await request(app)
      .delete(`/api/community/posts/${postId}/comments/${fakeId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(delCommentRes.status).toBe(404);

    // 403 delete comment
    const realCommentRes = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'My comment' });
    const commentId = realCommentRes.body.data.id;

    const delComment403 = await request(app)
      .delete(`/api/community/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(delComment403.status).toBe(403);
  });

  it('should list posts with edge case pagination parameters', async () => {
    const listRes = await request(app)
      .get('/api/community/posts?page=0&limit=100')
      .set('Authorization', `Bearer ${token1}`);
    
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.page).toBe(1); // clamped to Math.max(1, 0)
    expect(listRes.body.data.limit).toBe(50); // clamped to Math.min(50, 100)
  });
});
