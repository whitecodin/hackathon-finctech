import assert from 'node:assert/strict';
import {test} from 'node:test';
import app from '../api/index.ts';

test('deployed API entry point serves health and protects merchant routes', async () => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(origin + '/api/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {
      status: 'online', backend: 'supabase', database: 'not_checked'
    });
    for (const [path, method] of [
      ['/api/merchant/profile', 'GET'],
      ['/api/transactions', 'GET'],
      ['/api/merchant/update-profile', 'POST'],
      ['/api/transactions/123/resolve', 'POST'],
      ['/api/league', 'GET'],
      ['/api/league/preferences', 'POST'],
      ['/api/coach/live-talk', 'POST']
    ]) {
      const response = await fetch(origin + path, {method});
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.equal((await response.json()).error, 'Sign in required');
    }
    const unknown = await fetch(origin + '/api/does-not-exist');
    assert.equal(unknown.status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
