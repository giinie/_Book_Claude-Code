import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { startSmartDocsServer } from './server.js';

export { createSmartDocsServer, startSmartDocsServer } from './server.js';

const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1]
  ? path.resolve(process.argv[1]) === currentFilePath
  : false;

if (isMainModule) {
  startSmartDocsServer().catch((error) => {
    console.error('Smart Docs 서버 실행 실패:', error);
    process.exit(1);
  });
}
