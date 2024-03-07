import { defineConfig } from 'vite';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';

//https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vsixPlugin()
    ],
    resolve: {
        dedupe: ['monaco-editor', 'vscode']
    },
    build: {
        target: "ES2022"
    }
});