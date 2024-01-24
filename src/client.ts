
import { MonacoLanguageClient, initServices, useOpenEditorStub } from 'monaco-languageclient';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';

const languageId = 'statemachine';

export const setupClient = async () => {
    console.log('Setting up Statemachine client configuration ...');

    function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
      return new MonacoLanguageClient({
          name: 'Statemachine Client',
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
    const langiumWorkerUrl = new URL('./server.js', window.location.href).href;
      const worker = new Worker(langiumWorkerUrl, {
          type: 'module',
          name: 'Custom LS'
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