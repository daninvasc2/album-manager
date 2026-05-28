import * as SQLite from "expo-sqlite";

const DB_NAME = "panini_manager.db";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS collection (
      sticker_code TEXT PRIMARY KEY,
      quantity INTEGER NOT NULL DEFAULT 1
    );
  `);
}

/** Add a sticker to the collection (or increment quantity if already exists) */
export async function addSticker(stickerCode: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO collection (sticker_code, quantity) VALUES (?, 1)
     ON CONFLICT(sticker_code) DO UPDATE SET quantity = quantity + 1`,
    [stickerCode]
  );
}

/** Remove one copy of a sticker (delete row if quantity reaches 0) */
export async function removeSticker(stickerCode: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE collection SET quantity = quantity - 1 WHERE sticker_code = ?`,
    [stickerCode]
  );
  await database.runAsync(
    `DELETE FROM collection WHERE sticker_code = ? AND quantity <= 0`,
    [stickerCode]
  );
}

/** Get all stickers the user owns */
export async function getOwnedStickers(): Promise<Map<string, number>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ sticker_code: string; quantity: number }>(
    `SELECT sticker_code, quantity FROM collection`
  );
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.sticker_code, row.quantity);
  }
  return map;
}

/** Get count of unique stickers owned */
export async function getOwnedCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM collection`
  );
  return result?.count ?? 0;
}

/** Get all duplicate stickers (quantity > 1) */
export async function getDuplicates(): Promise<Map<string, number>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ sticker_code: string; quantity: number }>(
    `SELECT sticker_code, quantity FROM collection WHERE quantity > 1`
  );
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.sticker_code, row.quantity - 1); // extras beyond the one needed
  }
  return map;
}

/** Check if a specific sticker is owned */
export async function isOwned(stickerCode: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM collection WHERE sticker_code = ?`,
    [stickerCode]
  );
  return (result?.count ?? 0) > 0;
}

/** Search owned stickers by prefix */
export async function searchOwned(query: string): Promise<{ code: string; quantity: number }[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ sticker_code: string; quantity: number }>(
    `SELECT sticker_code, quantity FROM collection WHERE sticker_code LIKE ? ORDER BY sticker_code`,
    [`${query.toUpperCase()}%`]
  );
  return rows.map((r) => ({ code: r.sticker_code, quantity: r.quantity }));
}
