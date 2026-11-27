/** Launch the disposable browser for scene video export, not a signed-in browser. */
export function launchSceneExportBrowser(chromium, platform = process.platform) {
  const args = ['--autoplay-policy=no-user-gesture-required', '--no-first-run'];
  if (platform === 'darwin') {
    args.unshift('--enable-gpu', '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist');
  }
  return chromium.launch({ channel: 'chromium', headless: true, args, timeout: 45_000 });
}
