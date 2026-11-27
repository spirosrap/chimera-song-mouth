import assert from 'node:assert/strict';
import { test } from 'node:test';
import { launchSceneExportBrowser } from '../tools/lib/scene-export-browser.mjs';

test('macOS exports launch bundled Chromium with Metal, not an installed user browser', () => {
  const browser = Symbol('browser');
  let calls = 0;
  const result = launchSceneExportBrowser({ launch(options) {
    calls++;
    assert.equal(options.channel, 'chromium');
    assert.equal(options.headless, true);
    assert.equal(options.timeout, 45_000);
    assert.equal('executablePath' in options, false);
    assert.deepEqual(options.args, ['--enable-gpu', '--use-gl=angle', '--use-angle=metal',
      '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--no-first-run']);
    return browser;
  } }, 'darwin');
  assert.equal(calls, 1);
  assert.equal(result, browser);
});

test('other platforms use the same isolated browser without macOS GPU flags', () => {
  launchSceneExportBrowser({ launch(options) {
    assert.deepEqual(options, { channel: 'chromium', headless: true, timeout: 45_000,
      args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run'] });
  } }, 'linux');
});

test('an unavailable bundled browser fails without falling back to a user browser', async () => {
  let calls = 0;
  await assert.rejects(launchSceneExportBrowser({ async launch() {
    calls++;
    throw new Error('Chromium not installed');
  } }, 'darwin'), /Chromium not installed/);
  assert.equal(calls, 1);
});
