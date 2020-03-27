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
        src: ['index.html', 'manifest.json', 'sw.js'],
        dest: publishDest
      },      
      {
        src: 'static/*',
        dest: `${publishDest}/static`,
        flatten: false
      }
    ]
  })
);

export default config;
