import copy from 'rollup-plugin-copy';

const publishDest = '../holdingbuddy-public';

import config from './rollup.config.js';
config.plugins.push(
  copy({
    targets: [
      { src: 'dist/bundle.js', dest: `${publishDest}/dist` },
      { src: 'index.html', dest: publishDest },
      { src: 'static/**/*', dest: `${publishDest}/static`}
    ]
  })
);

export default config;
