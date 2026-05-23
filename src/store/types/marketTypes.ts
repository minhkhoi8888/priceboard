export interface MarketTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  displayPair: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  quoteVolume: number;
}

export interface RecentTrade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}
