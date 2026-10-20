// frani-coin — JSON-file store.
// One JSON file per invoice, keyed by invoice id. Simple, portable, no DB.

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export class Store {
  constructor(dir) {
    this.dir = dir;
  }

  async init() {
    if (!existsSync(this.dir)) await mkdir(this.dir, { recursive: true });
  }

  _file(id) {
    const safe = String(id).replace(/[^0-9a-zA-Z_-]/g, '');
    return path.join(this.dir, `${safe}.json`);
  }

  async save(record) {
    await this.init();
    record.updatedAt = Date.now();
    await writeFile(this._file(record.id), JSON.stringify(record, null, 2), 'utf8');
    return this._file(record.id);
  }

  async get(id) {
    const file = this._file(id);
    if (!existsSync(file)) return null;
    return JSON.parse(await readFile(file, 'utf8'));
  }

  async list() {
    if (!existsSync(this.dir)) return [];
    const names = (await readdir(this.dir)).filter((n) => n.endsWith('.json'));
    const out = [];
    for (const name of names) {
      try {
        out.push(JSON.parse(await readFile(path.join(this.dir, name), 'utf8')));
      } catch {
        /* skip malformed */
      }
    }
    out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return out;
  }

  // Find a record by any field value.
  async findByField(field, value) {
    const all = await this.list();
    return all.find((r) => r[field] === value) || null;
  }
}
