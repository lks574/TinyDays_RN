import type { TinyDaysSQLiteDatabase } from "./tinydays-sqlite";

type Row = Record<string, string>;

export function createMemorySQLiteDatabase(): TinyDaysSQLiteDatabase {
  const tables = new Map<string, Row[]>();

  return {
    execAsync: jest.fn(async () => undefined),
    getAllAsync: jest.fn(async (source: string, ...params: unknown[]) => {
      if (source.includes("COUNT(*)")) {
        const tableName = getTableNameFromCountQuery(source);
        const rows = tables.get(tableName) ?? [];

        if (tableName === "sync_queue") {
          return [
            {
              count: rows.filter((row) => row.queue_type === params[0]).length,
            },
          ];
        }

        return [{ count: rows.length }];
      }

      if (source.includes("FROM sync_queue")) {
        return [...(tables.get("sync_queue") ?? [])]
          .filter((row) => row.queue_type === params[0])
          .sort((left, right) => left.created_at.localeCompare(right.created_at))
          .map(({ payload }) => ({ payload }));
      }

      const tableName = getTableNameFromSelectQuery(source);

      return [...(tables.get(tableName) ?? [])]
        .sort((left, right) => right.sort_at.localeCompare(left.sort_at))
        .map(({ payload }) => ({ payload }));
    }) as TinyDaysSQLiteDatabase["getAllAsync"],
    runAsync: jest.fn(async (source: string, ...params: unknown[]) => {
      if (source.includes("INTO sync_queue")) {
        const [id, queueType, userId, createdAt, payload] = params as string[];
        upsertRow(tables, "sync_queue", { id, queue_type: queueType, user_id: userId, created_at: createdAt, payload });

        return { changes: 1, lastInsertRowId: 1 };
      }

      if (source.includes("DELETE FROM sync_queue")) {
        const [queueType, id] = params as string[];
        const rows = tables.get("sync_queue") ?? [];
        tables.set(
          "sync_queue",
          rows.filter(
            (row) => row.queue_type !== queueType || row.id !== id,
          ),
        );

        return { changes: 1, lastInsertRowId: 1 };
      }

      if (source.includes("INSERT") && source.includes("INTO")) {
        const tableName = getTableNameFromInsertQuery(source);
        const [id, sortAt, payload] = params as string[];
        upsertRow(tables, tableName, { id, sort_at: sortAt, payload });

        return { changes: 1, lastInsertRowId: 1 };
      }

      if (source.includes("DELETE")) {
        const tableName = getTableNameFromDeleteQuery(source);
        const [id] = params as string[];
        tables.set(
          tableName,
          (tables.get(tableName) ?? []).filter((row) => row.id !== id),
        );

        return { changes: 1, lastInsertRowId: 1 };
      }

      return { changes: 0, lastInsertRowId: 0 };
    }) as TinyDaysSQLiteDatabase["runAsync"],
  };
}

function upsertRow(
  tables: Map<string, Row[]>,
  tableName: string,
  row: Row,
): void {
  const rows = tables.get(tableName) ?? [];
  const nextRows = [
    row,
    ...rows.filter(
      (currentRow) =>
        currentRow.id !== row.id ||
        currentRow.queue_type !== row.queue_type,
    ),
  ];

  tables.set(tableName, nextRows);
}

function getTableNameFromCountQuery(source: string): string {
  return source.match(/FROM\s+(\w+)/)?.[1] ?? "";
}

function getTableNameFromSelectQuery(source: string): string {
  return source.match(/FROM\s+(\w+)/)?.[1] ?? "";
}

function getTableNameFromInsertQuery(source: string): string {
  return source.match(/INTO\s+(\w+)/)?.[1] ?? "";
}

function getTableNameFromDeleteQuery(source: string): string {
  return source.match(/FROM\s+(\w+)/)?.[1] ?? "";
}
