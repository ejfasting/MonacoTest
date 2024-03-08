import './style.css';
import 'vscode/localExtensionHost';
import './jsfso-client-0.0.1.vsix';

import { editor, languages } from 'monaco-editor';
import { initialize as initializeMonacoService } from 'vscode/services';
import { createConfiguredEditor } from 'vscode/monaco';
import { MonacoLanguageClient, /*useOpenEditorStub*/ } from 'monaco-languageclient';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import getConfigurationServiceOverride, { updateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
//import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
//import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
//import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
// import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
//import { workerConfig } from './tools/extHostWorker'; //HostWorker
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';

const languageId = 'jsfso';

// create div to avoid needing a HtmlWebpackPlugin template
(function () {

  const div = document.createElement('div');
  div.id = 'root';
  div.style.setProperty('width', '800px');
  div.style.setProperty('height', '600px');
  div.style.setProperty('border', '1px solid #ccc');

  document.body.appendChild(div);
})();

// Workers
// export type WorkerLoader = () => Worker
// const workerLoaders: Partial<Record<string, WorkerLoader>> = {
//   editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
//   // textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
//   // outputLinkComputer: () => new Worker(new URL('@codingame/monaco-vscode-output-service-override/worker', import.meta.url), { type: 'module' }),
//   // languageDetectionWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-language-detection-worker-service-override/worker', import.meta.url), { type: 'module' }),
//   // notebookEditorWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-notebook-service-override/worker', import.meta.url), { type: 'module' })
// };

// window.MonacoEnvironment = {
//   getWorker: function (moduleId, label) {
//     const workerFactory = workerLoaders[label];
//     if (workerFactory != null) {
//       return workerFactory();
//     }
//     throw new Error(`Unimplemented worker ${label} (${moduleId})`);
//   }
// };

// register the services. This has to be done BEFORE initializing the editor
await initializeMonacoService({
  ...getConfigurationServiceOverride(),
  //...getExtensionServiceOverride(workerConfig),
  //...getThemeServiceOverride(),
  //...getTextmateServiceOverride(),
  //...getEditorServiceOverride(useOpenEditorStub),
  //...getKeybindingsServiceOverride(),
});

updateUserConfiguration(`{
  "editor.fontSize": 14,
  "workbench.colorTheme": "Default Dark Modern"
}`);

// add the editor to the page
const rootElement = document.getElementById('root');
if (rootElement) {
  const editorOptions = {
    model: editor.createModel('const foo = () => 0;', languageId),
    automaticLayout: true
  };
  createConfiguredEditor(rootElement, editorOptions);
}

function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'jsfso Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: [{ language: languageId }],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      }
    },
    // create a language client connection to the server running in the web worker
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      }
    }
  });
}

const jsfsoWorkerUrl = new URL('assets/jsfso-client-0.0.1.vsix/server-xyNSEqxM.js', window.location.href).href;
const worker = new Worker(jsfsoWorkerUrl, {
  type: 'module',
  name: 'jsfso LS'
});
const reader = new BrowserMessageReader(worker);
const writer = new BrowserMessageWriter(worker);
const languageClient = createLanguageClient({ reader, writer });
languageClient.start();
reader.onClose(() => languageClient.stop());