import * as monaco from 'monaco-editor';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { MonacoLanguageClient, initServices } from 'monaco-languageclient';
import { ExtensionHostKind, registerExtension } from 'vscode/extensions';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import { Uri } from 'vscode';
import { createConfiguredEditor } from 'vscode/monaco';

const languageId = "jsfso"

export const configureClient = async () => {
    // Set values in the editor
    const exampleStatemachineUrl = new URL('./src/content.example', window.location.href).href;
    const editorText = await (await fetch(exampleStatemachineUrl)).text();
    const editorOptions = {
        model: monaco.editor.createModel(editorText, languageId, Uri.parse('/workspace/example.statemachine')),
        automaticLayout: true
    };
    createConfiguredEditor(document.getElementById('app')!, editorOptions);

    // Register the extension
    const extension = {
        name: 'jsfso-client',
        publisher: 'SuperOffice',
        version: '1.0.0',
        engines: {
            vscode: '*'
        },
        contributes: {
            languages: [{
                id: languageId,
                extensions: [
                    `.${languageId}`
                ],
                aliases: [
                    languageId
                ]
            }]
        }
    };
    registerExtension(extension, ExtensionHostKind.LocalProcess);

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

    const jsfsoWorkerUrl = new URL('./server/browser.js', window.location.href).href;
    const worker = new Worker(jsfsoWorkerUrl, {
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
        await configureClient();
    } catch (e) {
        console.error(e);
    }
};