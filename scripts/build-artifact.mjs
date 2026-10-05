// Builds the hash-routed preview and inlines JS + CSS into one HTML page; images stay as relative files.
// Output: artifact/index.html and artifact/img/*
import { execSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, ARTIFACT: '1', VITE_ROUTER: 'hash' } });
const assets = await readdir('dist-artifact/assets');
const jsFile = assets.find((f) => f.endsWith('.js'));
const cssFile = assets.find((f) => f.endsWith('.css'));
const js = (await readFile(`dist-artifact/assets/${jsFile}`, 'utf8')).replace(/<\/script/gi, '<\\/script');
const css = await readFile(`dist-artifact/assets/${cssFile}`, 'utf8');

await rm('artifact', { recursive: true, force: true });
await mkdir('artifact', { recursive: true });
const html = `<title>OFFHOUR Volume 01</title>
<meta name="theme-color" content="#EEECE5">
<style>${css}</style>
<div id="root"></div>
<script>document.documentElement.classList.add('js');</script>
<script type="module">${js}</script>
`;
await writeFile('artifact/index.html', html);
await cp('public/img', 'artifact/img', { recursive: true });
console.log('artifact/index.html', (html.length / 1024).toFixed(0) + ' KB');
