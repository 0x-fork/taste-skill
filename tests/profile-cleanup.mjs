import assert from 'node:assert/strict';
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Run in a child so Browser.launch()'s exit/signal handlers cannot leak into the test runner.
if (process.argv[2] === '--fixture') {
  const { Browser } = await import('../skills/taste-skill/scripts/lib/cdp.mjs');
  globalThis.WebSocket = class {
    constructor() { queueMicrotask(() => this.onopen?.()); }
    send(raw) {
      const { id } = JSON.parse(raw);
      queueMicrotask(() => this.onmessage?.({ data: JSON.stringify({ id, result: {} }) }));
    }
    close() {}
  };
  const base = process.env.TASTE_SKILL_TMP;
  const profiles = ['ad-chrome-open-lock', 'ad-chrome-no-lock'].map(name => join(base, name));
  let lock;
  let browser;
  try {
    for (const profile of profiles) {
      mkdirSync(profile);
      writeFileSync(join(profile, 'sentinel'), 'preserve');
    }
    lock = openSync(join(profiles[0], 'lockfile'), 'w+');
    for (const profile of profiles) {
      const old = new Date(Date.now() - 10 * 60 * 1000);
      utimesSync(profile, old, old);
    }
    browser = await Browser.launch();
    for (const profile of profiles) {
      assert.ok(existsSync(join(profile, 'sentinel')), 'launch deleted another profile');
    }
  } finally {
    if (browser) await browser.close();
    if (lock !== undefined) closeSync(lock);
  }
  assert.equal(existsSync(browser.dir), false, 'close left the owned profile behind');
} else {
  test('launch preserves older foreign profiles and close removes its own', {
    skip: process.platform === 'win32' && 'POSIX fake browser fixture',
  }, () => {
    const base = mkdtempSync(join(tmpdir(), 'taste-profile-test-'));
    try {
      const fakeChrome = join(base, 'fake-chrome');
      // No real browser, network, or existing user profile is accessed.
      writeFileSync(fakeChrome, '#!/bin/sh\nprintf "DevTools listening on ws://fixture\\n" >&2\nexec tail -f /dev/null\n', { mode: 0o755 });
      const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--fixture'], {
        env: { ...process.env, CHROME_PATH: fakeChrome, TASTE_SKILL_TMP: base },
        encoding: 'utf8',
        timeout: 15000,
      });
      assert.equal(result.error, undefined, result.error?.message);
      assert.equal(result.status, 0, result.stdout + result.stderr);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
}
