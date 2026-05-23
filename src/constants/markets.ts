export const SUPPORTED_QUOTE_ASSET = "USDT" as const;

export const SUPPORTED_BASE_ASSETS = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "ADA",
  "XRP",
] as const;

export const SUPPORTED_MARKET_SYMBOLS = SUPPORTED_BASE_ASSETS.map(
  (asset) => `${asset}${SUPPORTED_QUOTE_ASSET}`,
) as readonly string[];

export const SUPPORTED_MARKET_SYMBOL_SET = new Set(SUPPORTED_MARKET_SYMBOLS);

export const DEFAULT_MARKET_SYMBOL = SUPPORTED_MARKET_SYMBOLS[0];

export const DEFAULT_FEATURED_MARKET_SYMBOLS = [
  DEFAULT_MARKET_SYMBOL,
  "SOLUSDT",
] as const;
