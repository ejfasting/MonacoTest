import './jsfso-client-0.0.1.vsix'

import { editor } from 'monaco-editor';
import { createConfiguredEditor } from 'vscode/monaco';
import { initialize } from 'vscode/services'
import { useOpenEditorStub, MonacoLanguageClient } from 'monaco-languageclient';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getConfigurationServiceOverride, { updateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';

import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import 'vscode/localExtensionHost';

const languageId = 'jsfso';

export const setupClient = async () => {
  console.log("Setting up client");
  await initialize({
    ...getThemeServiceOverride(),
    ...getTextmateServiceOverride(),
    ...getConfigurationServiceOverride(),
    //...getEditorServiceOverride(useOpenEditorStub),
    ...getKeybindingsServiceOverride()

  })

  const editorOptions = {
    model: editor.createModel(['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'), languageId),
    automaticLayout: true
  };
  createConfiguredEditor(document.getElementById('container')!, editorOptions);

  updateUserConfiguration(`{
    "editor.fontSize": 10,
    [languageId]: {
      "editor.fontSize": 40,
    }
  }`)

  function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: 'Jsfso Client',
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

  const jsfsoWorkerUrl = new URL('./dist/server.js', window.location.href).href;
  console.log("jsfsoWorkerUrl: " + jsfsoWorkerUrl);

  const worker = new Worker(jsfsoWorkerUrl, {
    type: 'module',
    name: 'jsfso LS'
  });
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);
  const languageClient = createLanguageClient({ reader, writer });
  languageClient.start();
  reader.onClose(() => languageClient.stop());
};

export const startClient = async () => {
  try {
    await setupClient();
  } catch (e) {
    console.error(e);
  }
};