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

// https://astro.build/config
export default defineConfig({
  site: 'https://ded-portweb.vicemi.dev',
  integrations: [react()],
  vite: { define: { __ASSET_VERSIONS__: JSON.stringify(assetVersions()) } },
});
