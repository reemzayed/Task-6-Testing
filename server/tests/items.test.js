// Backend tests for /api/items — THIS is the only backend file you edit.
// Run with:  npm test --workspace server
//
// tests/setup.js already starts an in-memory MongoDB and empties it after
// every test, so each test starts from a clean database.
import request from 'supertest';
import app from '../src/app.js';

// Helper: registers a user and returns their JWT.
// Use different names/emails when you need two users (e.g. for the 403 test).
async function registerAndGetToken(name = 'Alice', email = 'alice@test.com') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'secret123' });
  return res.body.token;
}

// Helper: creates an item as the user owning `token` and returns it.
// Override any field: createItem(token, { title: 'Keys', status: 'found' })
async function createItem(token, body = {}) {
  const res = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Black backpack', status: 'lost', category: 'accessories', location: 'Library', ...body });
  return res.body.item;
}

describe('/api/items', () => {
  // Worked example — read it, then write the two tests below in the same style.
  test('GET is public and returns an empty list when there are no items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  //test.todo('POST returns 409 when the same title is reported at the same location twice');
  test('POST returns 409 when the same title is reported at the same location twice', async () => {
  const token = await registerAndGetToken();

  const firstRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Black backpack',
      status: 'lost',
      category: 'accessories',
      location: 'Library',
    });

  expect(firstRes.status).toBe(201);

  const secondRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Black backpack',
      status: 'lost',
      category: 'accessories',
      location: 'Library',
    });

  expect(secondRes.status).toBe(409);
});
  //test.todo('PATCH returns 403 when someone who is not the reporter edits the item');
  test('PATCH returns 403 when someone who is not the reporter edits the item', async () => {
  const reporterToken = await registerAndGetToken('Alice', 'alice@test.com');
  const otherToken = await registerAndGetToken('Bob', 'bob@test.com');

  const item = await createItem(reporterToken);

  const res = await request(app)
    .patch(`/api/items/${item._id}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ title: 'Changed title' });

  expect(res.status).toBe(403);
});
});
