import copy from 'rollup-plugin-copy';

const publishDest = '../icalder.github.io/holdingbuddy';

import config from './rollup.config.js';
config.plugins.push(
  copy({
    targets: [
      {
        src: 'dist/bundle.js', 
        dest: `${publishDest}/dist`,
        hook: 'writeBundle'
      },
      {
        src: 'index.html',
        dest: publishDest,
        transform: contents =>
          contents.toString()
            .replace(/\/static\//g, '/holdingbuddy/static/')
            .replace('/dist/', '/holdingbuddy/dist/')
      },
      {
        src: 'static/*.css',
        dest: `${publishDest}/static`,
        transform: contents =>
          contents.toString()
            .replace(/\/static\//g, '/holdingbuddy/static/')
      },
      {
        src: ['static/*', '!static/*.css'],
        dest: `${publishDest}/static`,
        flatten: false
      }
    ]
  })
);

export default config;
