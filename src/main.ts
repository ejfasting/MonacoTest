import './style.css';
import './jsfso-client-0.0.1.vsix';

import { editor } from 'monaco-editor';
import { initialize as initializeMonacoService } from 'vscode/services';
import { createConfiguredEditor } from 'vscode/monaco';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
//import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
//import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
// import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import { workerConfig } from './tools/extHostWorker'; //HostWorker
import { Worker } from './tools/crossOriginWorker'

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
export type WorkerLoader = () => Worker
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
  textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
  outputLinkComputer: () => new Worker(new URL('@codingame/monaco-vscode-output-service-override/worker', import.meta.url), { type: 'module' }),
  languageDetectionWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-language-detection-worker-service-override/worker', import.meta.url), { type: 'module' }),
  notebookEditorWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-notebook-service-override/worker', import.meta.url), { type: 'module' })
};

window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    const workerFactory = workerLoaders[label];
    if (workerFactory != null) {
      return workerFactory();
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`);
  }
};

// register the services. This has to be done BEFORE initializing the editor
await initializeMonacoService({
  ...getConfigurationServiceOverride(),
  ...getExtensionServiceOverride(workerConfig),
  ...getLanguagesServiceOverride()
  //...getThemeServiceOverride(),
  //...getTextmateServiceOverride(),
  //...getEditorServiceOverride(useOpenEditorStub),
  //...getKeybindingsServiceOverride(),
});

// add the editor to the page
const rootElement = document.getElementById('root');
if (rootElement) {
  const editorOptions = {
    model: editor.createModel('const foo = () => 0;', languageId),
    automaticLayout: true
  };
  createConfiguredEditor(rootElement, editorOptions);
}
