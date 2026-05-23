import type { OrderBookLevel } from "../store/types/marketTypes";

interface StreamPathOptions {
  orderBookLevels: number;
  orderBookStreamIntervalMs: number;
}

export const buildDepthSide = (
  levels: Array<[string, string]>,
): OrderBookLevel[] => {
  let runningTotal = 0;

  return levels.map(([price, quantity]) => {
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);
    runningTotal += numericPrice * numericQuantity;

    return {
      price: numericPrice,
      quantity: numericQuantity,
      total: runningTotal,
    };
  });
};

export const inferStreamPath = (
  payload: unknown,
  options: StreamPathOptions,
) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("e" in payload && payload.e === "24hrMiniTicker" && "s" in payload) {
    return `${String(payload.s).toLowerCase()}@miniTicker`;
  }

  if (Array.isArray(payload)) {
    return null;
  }

  if ("e" in payload && payload.e === "aggTrade" && "s" in payload) {
    return `${String(payload.s).toLowerCase()}@aggTrade`;
  }

  if ("e" in payload && payload.e === "depthUpdate" && "s" in payload) {
    return `${String(payload.s).toLowerCase()}@depth${options.orderBookLevels}@${options.orderBookStreamIntervalMs}ms`;
  }

  if ("e" in payload && payload.e === "kline" && "k" in payload) {
    const kline = payload.k;

    if (kline && typeof kline === "object" && "s" in kline && "i" in kline) {
      return `${String(kline.s).toLowerCase()}@kline_${String(kline.i)}`;
    }
  }

  return null;
};
