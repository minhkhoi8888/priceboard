import { SUPPORTED_QUOTE_ASSET } from "../constants/markets";
import type { MarketTicker } from "../store/types/marketTypes";

interface BinanceMiniTickerLike {
  c: string;
  h: string;
  l: string;
  o: string;
  q: string;
}

export const parseSymbol = (symbol: string) => {
  if (!symbol.endsWith(SUPPORTED_QUOTE_ASSET)) {
    return {
      baseAsset: symbol,
      quoteAsset: "",
    };
  }

  return {
    baseAsset: symbol.slice(0, -SUPPORTED_QUOTE_ASSET.length),
    quoteAsset: SUPPORTED_QUOTE_ASSET,
  };
};

export const buildMarketFromMiniTicker = (
  symbol: string,
  message: BinanceMiniTickerLike,
): MarketTicker => {
  const openPrice = Number(message.o);
  const lastPrice = Number(message.c);
  const { baseAsset, quoteAsset } = parseSymbol(symbol);

  return {
    symbol,
    baseAsset,
    quoteAsset,
    displayPair: quoteAsset ? `${baseAsset}/${quoteAsset}` : symbol,
    lastPrice,
    priceChangePercent:
      openPrice === 0 ? 0 : ((lastPrice - openPrice) / openPrice) * 100,
    highPrice: Number(message.h),
    lowPrice: Number(message.l),
    quoteVolume: Number(message.q),
  };
};
