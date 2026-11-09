// Give the real render worker its compiled engine in Bun's filesystem test environment.
import {initEngine} from './harness.ts';
await initEngine();
await import('../src/song/render.worker.ts');
self.postMessage({type:'boot-ready'});
