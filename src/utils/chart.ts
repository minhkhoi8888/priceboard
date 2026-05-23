import type { UTCTimestamp } from "lightweight-charts";

import type { CandlePoint } from "../lib/chartIndicators";

export type ChartInterval = "1h" | "4h" | "12h" | "1d" | "1w" | "1M";

export const toChartTime = (value: number) =>
  Math.floor(value / 1000) as UTCTimestamp;

export const buildCandlePoint = (entry: Array<string | number>): CandlePoint => ({
  time: toChartTime(Number(entry[0])),
  open: Number(entry[1]),
  high: Number(entry[2]),
  low: Number(entry[3]),
  close: Number(entry[4]),
  volume: Number(entry[5]),
});
