import type { WorkerConfig } from '@codingame/monaco-vscode-extensions-service-override';
import { Worker } from './fakeWorker';

const jsfsoWorkerUrl = new URL('vscode/workers/extensionHost.worker', import.meta.url);
const fakeWorker = new Worker(jsfsoWorkerUrl, {
    type: 'module',
    name: 'jsfso LS'
});

//const fakeWorker = new Worker(new URL('vscode/workers/extensionHost.worker', import.meta.url), { type: 'module' });

export const workerConfig: WorkerConfig = {
    url: fakeWorker.url.toString(),
    options: fakeWorker.options
};