import type { BabyLog } from "./baby-log";

export type BabyLogRepository = {
  listLogs: () => Promise<BabyLog[]>;
  saveLog: (log: BabyLog) => Promise<BabyLog[]>;
};
