import type { HistogramData, LineData, UTCTimestamp } from "lightweight-charts";

export interface CandlePoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const isFiniteNumber = (value: number) => Number.isFinite(value);

export const buildVolumeData = (
  candles: CandlePoint[],
  upColor: string,
  downColor: string,
): HistogramData<UTCTimestamp>[] =>
  candles.map((candle) => ({
    time: candle.time,
    value: candle.volume,
    color: candle.close >= candle.open ? upColor : downColor,
  }));

export const calculateSma = (
  candles: CandlePoint[],
  period: number,
): LineData<UTCTimestamp>[] => {
  if (period <= 0 || candles.length < period) {
    return [];
  }

  const result: LineData<UTCTimestamp>[] = [];
  let rollingSum = 0;

  for (let index = 0; index < candles.length; index += 1) {
    rollingSum += candles[index].close;

    if (index >= period) {
      rollingSum -= candles[index - period].close;
    }

    if (index >= period - 1) {
      result.push({
        time: candles[index].time,
        value: rollingSum / period,
      });
    }
  }

  return result;
};

export const calculateRsi = (
  candles: CandlePoint[],
  period: number,
): LineData<UTCTimestamp>[] => {
  if (period <= 0 || candles.length <= period) {
    return [];
  }

  let averageGain = 0;
  let averageLoss = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = candles[index].close - candles[index - 1].close;
    averageGain += Math.max(change, 0);
    averageLoss += Math.max(-change, 0);
  }

  averageGain /= period;
  averageLoss /= period;

  const output: LineData<UTCTimestamp>[] = [];

  const firstRsi =
    averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);

  if (isFiniteNumber(firstRsi)) {
    output.push({
      time: candles[period].time,
      value: firstRsi,
    });
  }

  for (let index = period + 1; index < candles.length; index += 1) {
    const change = candles[index].close - candles[index - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;

    const relativeStrength =
      averageLoss === 0 ? Number.POSITIVE_INFINITY : averageGain / averageLoss;
    const rsi =
      averageLoss === 0 ? 100 : 100 - 100 / (1 + relativeStrength);

    if (isFiniteNumber(rsi)) {
      output.push({
        time: candles[index].time,
        value: rsi,
      });
    }
  }

  return output;
};
