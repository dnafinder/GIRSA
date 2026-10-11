// Unisce CSS e JS di index.html in un unico file dist/girsa.html, utilizzabile offline anche da file://.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let html = read('index.html');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, p) => `<style>\n${read(p)}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, p) => `<script>\n${read(p).replace(/<\/script/gi, '<\\/script')}\n</script>`);
html = html.replace(/<link rel="manifest"[^>]*>\n?/, '');
html = html.replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="data:image/svg+xml;base64,' + Buffer.from(read('icons/icon.svg')).toString('base64') + '">');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/girsa.html'), html);
console.log('dist/girsa.html', (html.length / 1024).toFixed(1) + ' KB');
