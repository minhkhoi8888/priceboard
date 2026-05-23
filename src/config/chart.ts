import type { ChartInterval } from "../utils/chart";

export interface ChartIntervalOption {
  label: string;
  value: ChartInterval;
}

export const CHART_INTERVALS: readonly ChartIntervalOption[] = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "12H", value: "12h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1M" },
] as const;
