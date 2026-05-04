import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

export type TinyDaysSQLiteDatabase = Pick<
  SQLiteDatabase,
  "execAsync" | "getAllAsync" | "runAsync"
>;

export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
};

type JsonTableOptions<T> = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  tableName: "baby_logs" | "baby_photo_metadata";
  legacyStorage?: KeyValueStorage | null;
  legacyStorageKey: string;
  isRecord: (value: unknown) => value is T;
  getId: (record: T) => string;
  getSortValue: (record: T) => string;
  sort: (records: readonly T[]) => T[];
};

type SyncQueueOptions<T> = {
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>;
  queueType: "baby_log_backup" | "baby_photo_upload";
  legacyStorage?: KeyValueStorage | null;
  legacyStorageKey: string;
  isRecord: (value: unknown) => value is T;
  getId: (record: T) => string;
  getUserId: (record: T) => string;
  getCreatedAt: (record: T) => string;
  sort: (records: readonly T[]) => T[];
};

let databasePromise: Promise<TinyDaysSQLiteDatabase> | null = null;

export function getTinyDaysSQLiteDatabase(): Promise<TinyDaysSQLiteDatabase> {
  databasePromise ??= openDatabaseAsync("tinydays.db");

  return databasePromise;
}

export function createSQLiteJsonTable<T>(
  options: JsonTableOptions<T>,
): {
  list: () => Promise<T[]>;
  upsert: (record: T) => Promise<T[]>;
  remove: (id: string) => Promise<T[]>;
} {
  let initializePromise: Promise<void> | null = null;
  let pendingWrite: Promise<void> = Promise.resolve();

  async function initialize(): Promise<void> {
    if (initializePromise !== null) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const database = await resolveDatabase(options.database);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS ${options.tableName} (
          id TEXT PRIMARY KEY NOT NULL,
          sort_at TEXT NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_${options.tableName}_sort_at
          ON ${options.tableName}(sort_at DESC);
      `);

      await migrateLegacyRecords(database, options);
    })();

    return initializePromise;
  }

  return {
    async list() {
      await initialize();

      return readJsonTableRecords(options);
    },
    async upsert(record) {
      const writeOperation = pendingWrite.then(async () => {
        await initialize();

        const database = await resolveDatabase(options.database);
        await database.runAsync(
          `
            INSERT OR REPLACE INTO ${options.tableName}
              (id, sort_at, payload, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `,
          options.getId(record),
          options.getSortValue(record),
          JSON.stringify(record),
        );

        return readJsonTableRecords(options);
      });

      pendingWrite = writeOperation.then(
        () => undefined,
        () => undefined,
      );

      return writeOperation;
    },
    async remove(id) {
      const writeOperation = pendingWrite.then(async () => {
        await initialize();

        const database = await resolveDatabase(options.database);
        await database.runAsync(
          `DELETE FROM ${options.tableName} WHERE id = ?`,
          id,
        );

        return readJsonTableRecords(options);
      });

      pendingWrite = writeOperation.then(
        () => undefined,
        () => undefined,
      );

      return writeOperation;
    },
  };
}

export function createSQLiteSyncQueue<T>(
  options: SyncQueueOptions<T>,
): {
  list: () => Promise<T[]>;
  upsert: (record: T) => Promise<T[]>;
  remove: (id: string) => Promise<T[]>;
} {
  let initializePromise: Promise<void> | null = null;
  let pendingWrite: Promise<void> = Promise.resolve();

  async function initialize(): Promise<void> {
    if (initializePromise !== null) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const database = await resolveDatabase(options.database);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT NOT NULL,
          queue_type TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (queue_type, id)
        );
        CREATE INDEX IF NOT EXISTS idx_sync_queue_type_created
          ON sync_queue(queue_type, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_sync_queue_type_user
          ON sync_queue(queue_type, user_id);
      `);

      await migrateLegacySyncQueueRecords(database, options);
    })();

    return initializePromise;
  }

  return {
    async list() {
      await initialize();

      return readSyncQueueRecords(options);
    },
    async upsert(record) {
      const writeOperation = pendingWrite.then(async () => {
        await initialize();

        const database = await resolveDatabase(options.database);
        await database.runAsync(
          `
            INSERT OR REPLACE INTO sync_queue
              (id, queue_type, user_id, created_at, payload, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,
          options.getId(record),
          options.queueType,
          options.getUserId(record),
          options.getCreatedAt(record),
          JSON.stringify(record),
        );

        return readSyncQueueRecords(options);
      });

      pendingWrite = writeOperation.then(
        () => undefined,
        () => undefined,
      );

      return writeOperation;
    },
    async remove(id) {
      const writeOperation = pendingWrite.then(async () => {
        await initialize();

        const database = await resolveDatabase(options.database);
        await database.runAsync(
          "DELETE FROM sync_queue WHERE queue_type = ? AND id = ?",
          options.queueType,
          id,
        );

        return readSyncQueueRecords(options);
      });

      pendingWrite = writeOperation.then(
        () => undefined,
        () => undefined,
      );

      return writeOperation;
    },
  };
}

async function readJsonTableRecords<T>(
  options: JsonTableOptions<T>,
): Promise<T[]> {
  const database = await resolveDatabase(options.database);
  const rows = await database.getAllAsync<{ payload: string }>(
    `SELECT payload FROM ${options.tableName} ORDER BY sort_at DESC`,
  );

  return options.sort(rows.map((row) => parseRecord(row.payload)).filter(options.isRecord));
}

async function readSyncQueueRecords<T>(
  options: SyncQueueOptions<T>,
): Promise<T[]> {
  const database = await resolveDatabase(options.database);
  const rows = await database.getAllAsync<{ payload: string }>(
    "SELECT payload FROM sync_queue WHERE queue_type = ? ORDER BY created_at ASC",
    options.queueType,
  );

  return options.sort(rows.map((row) => parseRecord(row.payload)).filter(options.isRecord));
}

async function migrateLegacyRecords<T>(
  database: TinyDaysSQLiteDatabase,
  options: JsonTableOptions<T>,
): Promise<void> {
  if (options.legacyStorage === null) {
    return;
  }

  const rows = await database.getAllAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${options.tableName}`,
  );

  if ((rows[0]?.count ?? 0) > 0) {
    return;
  }

  const records = await readLegacyRecords(options);

  for (const record of records) {
    await database.runAsync(
      `
        INSERT OR IGNORE INTO ${options.tableName}
          (id, sort_at, payload, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      options.getId(record),
      options.getSortValue(record),
      JSON.stringify(record),
    );
  }
}

async function migrateLegacySyncQueueRecords<T>(
  database: TinyDaysSQLiteDatabase,
  options: SyncQueueOptions<T>,
): Promise<void> {
  if (options.legacyStorage === null) {
    return;
  }

  const rows = await database.getAllAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM sync_queue WHERE queue_type = ?",
    options.queueType,
  );

  if ((rows[0]?.count ?? 0) > 0) {
    return;
  }

  const records = await readLegacyRecords(options);

  for (const record of records) {
    await database.runAsync(
      `
        INSERT OR IGNORE INTO sync_queue
          (id, queue_type, user_id, created_at, payload, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      options.getId(record),
      options.queueType,
      options.getUserId(record),
      options.getCreatedAt(record),
      JSON.stringify(record),
    );
  }
}

async function readLegacyRecords<T>(
  options: {
    legacyStorage?: KeyValueStorage | null;
    legacyStorageKey: string;
    isRecord: (value: unknown) => value is T;
    sort: (records: readonly T[]) => T[];
  },
): Promise<T[]> {
  const legacyStorage = options.legacyStorage;

  if (legacyStorage === undefined || legacyStorage === null) {
    return [];
  }

  const rawRecords = await legacyStorage.getItem(options.legacyStorageKey);

  if (rawRecords === null) {
    return [];
  }

  const parsedRecords = parseRecord(rawRecords);

  if (!Array.isArray(parsedRecords)) {
    return [];
  }

  return options.sort(parsedRecords.filter(options.isRecord));
}

async function resolveDatabase(
  database?: TinyDaysSQLiteDatabase | Promise<TinyDaysSQLiteDatabase>,
): Promise<TinyDaysSQLiteDatabase> {
  return database ?? getTinyDaysSQLiteDatabase();
}

function parseRecord(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
