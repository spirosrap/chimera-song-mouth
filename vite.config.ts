import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {rmSync} from 'node:fs';
import {resolve} from 'node:path';

// Small hosted archives can use the identical MP4 in the public GitHub release.
// Ordinary builds remain self-contained and retain the local video.
const externalMovie=process.env.CHIMERA_EXTERNAL_MOVIE_DOWNLOAD??'';
if(externalMovie&&!externalMovie.startsWith('https://'))throw Error('The movie download must use HTTPS.');

export default defineConfig({
  plugins: [react(),...(externalMovie?[{name:'external-movie-download',closeBundle(){rmSync(resolve('dist/scenes/a-few-good-men/for-x.mp4'),{force:true});}}]:[])],
  define: {__CHIMERA_EXTERNAL_MOVIE__:JSON.stringify(externalMovie)},
  worker: { format: "es" },
  build: { target: "es2022", sourcemap: false },
  server: { host: "127.0.0.1", port: 5317, strictPort: true, allowedHosts: true },
  preview: { host: "127.0.0.1", port: 5318, strictPort: true, allowedHosts: true },
});
