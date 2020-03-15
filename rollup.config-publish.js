import copy from 'rollup-plugin-copy';

const publishDest = '../icalder.github.io/holdingbuddy';

import config from './rollup.config.js';
config.plugins.push(
  copy({
    targets: [
      { src: 'dist/bundle.js', dest: `${publishDest}/dist` },
      {
        src: 'index.html',
        dest: publishDest,
        transform: contents =>
          contents.toString()
            .replace(/\/static\//g, '/holdingbuddy/static/')
            .replace('/dist/', '/holdingbuddy/dist/')
      },
      { src: 'static/**/*', dest: `${publishDest}/static`}
    ]
  })
);

export default config;
