const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'moodify-test-secret';
process.env.IMAGEKIT_PRIVATE_KEY = 'test-imagekit-key';
process.env.MONGOMS_STARTUP_TIMEOUT = '120000';

const app = require('../src/app');

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri('moodify_test'));
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('health endpoint reports a live API and database', async () => {
  const res = await request(app).get('/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.database, 'connected');
});

test('registration validates its inputs', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'alice' });

  assert.equal(res.status, 400);
});

test('register, login, session and private mood flow work end to end', async () => {
  const agent = request.agent(app);

  const register = await agent
    .post('/api/auth/register')
    .send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'strongpass123',
    });

  assert.equal(register.status, 201);
  assert.equal(register.body.user.username, 'alice');

  const duplicate = await agent
    .post('/api/auth/register')
    .send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'strongpass123',
    });

  assert.equal(duplicate.status, 400);

  const wrongPassword = await agent
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'wrong-password' });

  assert.equal(wrongPassword.status, 401);

  const login = await agent
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'strongpass123' });

  assert.equal(login.status, 200);

  const me = await agent.get('/api/auth/get-me');

  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'alice@example.com');

  const mood = await agent
    .post('/api/mood')
    .send({ mood: 'happy', source: 'manual' });

  assert.equal(mood.status, 201);
  assert.equal(mood.body.recorded, true);

  const summary = await agent.get('/api/mood/summary');

  assert.equal(summary.status, 200);
  assert.ok(Array.isArray(summary.body.days));
});

test('private routes reject guests', async () => {
  const res = await request(app).get('/api/mood/summary');

  assert.equal(res.status, 401);
});

test('one-click demo login creates a session', async () => {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/demo');

  assert.equal(res.status, 200);
  assert.ok(res.body.user);
});

test('song and library endpoints are public', async () => {
  const song = await request(app).get('/api/song?mood=neutral');
  assert.equal(song.status, 200);
  assert.equal(song.body.requestedMood, 'neutral');

  const library = await request(app).get('/api/song/library');
  assert.equal(library.status, 200);
  assert.equal(typeof library.body.library, 'object');
});
