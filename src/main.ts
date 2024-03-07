import './style.css';
import './jsfso-client-0.0.1.vsix';
import 'vscode/localExtensionHost';

import { editor } from 'monaco-editor';
import { initialize } from 'vscode/services';
import { createConfiguredEditor } from 'vscode/monaco';
import getConfigurationServiceOverride, { /*updateUserConfiguration*/ } from '@codingame/monaco-vscode-configuration-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import { workerConfig } from './tools/extHostWorker'; //HostWorker

// Will add these when i get the server loaded correctly..
// import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
// import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
// import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
// import { useOpenEditorStub } from 'monaco-languageclient';

const languageId = 'jsfso';

// register the services. This has to be done BEFORE initializing the editor
await initialize({
  ...getConfigurationServiceOverride(),
  ...getExtensionServiceOverride(workerConfig),
  //...getThemeServiceOverride(),
  //...getTextmateServiceOverride(),
  //...getEditorServiceOverride(useOpenEditorStub),
  //...getKeybindingsServiceOverride(),
});

// create div to avoid needing a HtmlWebpackPlugin template
(function () {

  const div = document.createElement('div');
  div.id = 'root';
  div.style.setProperty('width', '800px');
  div.style.setProperty('height', '600px');
  div.style.setProperty('border', '1px solid #ccc');

  document.body.appendChild(div);
})();

// add the editor to the page
const rootElement = document.getElementById('root');
if (rootElement) {
  const editorOptions = {
    model: editor.createModel('const foo = () => 0;', languageId),
    automaticLayout: true
  };
  createConfiguredEditor(rootElement, editorOptions);
}
