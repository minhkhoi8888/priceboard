import { SUPPORTED_MARKET_SYMBOLS } from "../constants/markets";

export const BINANCE_REST_URL = "https://api.binance.com/api/v3/klines";
export const BINANCE_STREAM_URL = "wss://stream.binance.com:9443/ws";

export const CANDLE_LIMIT = 500;
export const MAX_RECENT_TRADES = 120;
export const ORDER_BOOK_LEVELS = 20;
export const ORDER_BOOK_STREAM_INTERVAL_MS = 1000;

export const MINI_TICKER_STREAMS = SUPPORTED_MARKET_SYMBOLS.map(
  (symbol) => `${symbol.toLowerCase()}@miniTicker`,
);

export const MINI_TICKER_FLUSH_INTERVAL_MS = 100;
export const RECENT_TRADES_FLUSH_INTERVAL_MS = 200;
export const ORDER_BOOK_FLUSH_INTERVAL_MS = 200;
