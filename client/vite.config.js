import fs from 'fs';
import copy from 'rollup-plugin-copy';

export default {
  root: "src",
  plugins: [
    copy({
      targets: [
        { src: '../common', dest: 'src' }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    https: {
      key: fs.readFileSync('../server/localhost+2-key.pem'),
      cert: fs.readFileSync('../server/localhost+2.pem')
    }
  }
};
