import fs from 'fs';

export default {
  root: "src",
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
