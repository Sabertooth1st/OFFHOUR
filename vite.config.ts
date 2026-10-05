import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ARTIFACT=1 builds a relative-path, single-chunk bundle for the hash-routed preview (scripts/build-artifact.mjs).
const artifact = Boolean(process.env.ARTIFACT);

export default defineConfig({
  plugins: [react()],
  base: artifact ? './' : '/',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2022',
    sourcemap: false,
    outDir: artifact ? 'dist-artifact' : 'dist',
    assetsInlineLimit: artifact ? 1_000_000 : 4096,
    cssCodeSplit: !artifact,
  },
});
