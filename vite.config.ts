import { defineConfig } from 'vite';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

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
    },
    optimizeDeps: {
        include: ['vscode-semver', 'vscode-marked'],
        esbuildOptions: {
            tsconfig: './tsconfig.json',
            plugins: [importMetaUrlPlugin]
        }
    }
});