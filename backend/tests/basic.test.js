const request = require('supertest');
const { app } = require('../src/server');

describe('backend basic routes', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('protected route returns standard error shape', async () => {
    const res = await request(app).get('/api/reports/some-id');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
  });
});

