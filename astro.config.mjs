import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// A short hash of every file under public/assets: the game asks for "images_rest.pak?v=<hash>", so the browser (and its Cache API copy) keeps a file
// until its content changes, and an update downloads only what changed. See src/engine/net.ts.
function assetVersions() {
  const root = path.resolve('public/assets');
  const out = {};
  const walk = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(dir, e.name), rel + e.name + '/');
      else out[rel + e.name] = createHash('sha1').update(fs.readFileSync(path.join(dir, e.name))).digest('hex').slice(0, 10);
    }
  };
  if (fs.existsSync(root)) walk(root, '');
  return out;
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const BUILD_ID = createHash('sha1').update(JSON.stringify(assetVersions()) + pkg.version).digest('hex').slice(0, 12);
// dist/version.json (never cached): a page that runs an older build sees another id and clears its caches (src/engine/freshness.ts)
const versionFile = { name: 'ded-version-file', hooks: { 'astro:build:done': ({ dir }) => { fs.writeFileSync(path.join(new URL(dir).pathname.replace(/^\/([A-Za-z]:)/, '$1'), 'version.json'), JSON.stringify({ id: BUILD_ID, version: pkg.version })); } } };

// https://astro.build/config
export default defineConfig({
  site: 'https://ded-portweb.vicemi.dev',
  integrations: [react(), versionFile],
  vite: { define: { __ASSET_VERSIONS__: JSON.stringify(assetVersions()), __BUILD_ID__: JSON.stringify(BUILD_ID), __APP_VERSION__: JSON.stringify(pkg.version) } },
});
