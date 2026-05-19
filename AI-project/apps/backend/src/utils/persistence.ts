import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const DATA_DIR = path.join(process.cwd(), 'data-store');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export function saveStore(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
    logger.debug('💾 Store persisted to disk');
  } catch (err) {
    logger.error('Failed to persist store:', err);
  }
}

export function loadStore(): any {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      logger.info('📂 Store loaded from disk');
      return JSON.parse(data);
    }
  } catch (err) {
    logger.error('Failed to load store:', err);
  }
  return null;
}
