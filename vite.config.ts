import { defineConfig } from 'vite';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'

export default defineConfig({
    plugins: [
        vsixPlugin()
    ]
});