import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  DEFAULT_MARKET_SYMBOL,
  SUPPORTED_MARKET_SYMBOLS,
} from "../../constants/markets";
import type { RootState } from "../store";
import type { MarketTicker, OrderBookLevel, RecentTrade } from "../types/marketTypes";

interface MarketState {
  marketsBySymbol: Record<string, MarketTicker>;
  recentTrades: RecentTrade[];
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  hasHydratedMarkets: boolean;
  hasOrderBookSnapshot: boolean;
  hasRecentTradesSnapshot: boolean;
}

const initialState: MarketState = {
  marketsBySymbol: {},
  recentTrades: [],
  asks: [],
  bids: [],
  hasHydratedMarkets: false,
  hasOrderBookSnapshot: false,
  hasRecentTradesSnapshot: false,
};

const createFallbackMarket = (symbol: string): MarketTicker => ({
  symbol,
  baseAsset: symbol,
  quoteAsset: "",
  displayPair: symbol,
  lastPrice: 0,
  priceChangePercent: 0,
  highPrice: 0,
  lowPrice: 0,
  quoteVolume: 0,
});

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    upsertMarkets(state, action: PayloadAction<MarketTicker[]>) {
      if (action.payload.length > 0) {
        state.hasHydratedMarkets = true;
      }

      for (const market of action.payload) {
        state.marketsBySymbol[market.symbol] = market;
      }
    },
    setRecentTrades(state, action: PayloadAction<RecentTrade[]>) {
      state.recentTrades = action.payload;
      state.hasRecentTradesSnapshot = action.payload.length > 0;
    },
    setOrderBook(
      state,
      action: PayloadAction<{ asks: OrderBookLevel[]; bids: OrderBookLevel[] }>,
    ) {
      state.asks = action.payload.asks;
      state.bids = action.payload.bids;
      state.hasOrderBookSnapshot =
        action.payload.asks.length > 0 || action.payload.bids.length > 0;
    },
    resetMarketDetail(state) {
      state.recentTrades = [];
      state.asks = [];
      state.bids = [];
      state.hasOrderBookSnapshot = false;
      state.hasRecentTradesSnapshot = false;
    },
  },
});

const selectMarketState = (state: RootState) => state.market;
const selectAppState = (state: RootState) => state.app;
const selectMarketsBySymbolState = (state: RootState) => state.market.marketsBySymbol;

export const selectMarkets = createSelector(
  [selectMarketsBySymbolState],
  (marketsBySymbol) =>
    SUPPORTED_MARKET_SYMBOLS.map((symbol) => marketsBySymbol[symbol]).filter(
      (market): market is MarketTicker => Boolean(market),
    ),
);

export const selectSelectedSymbol = createSelector(
  [selectAppState, selectMarketsBySymbolState],
  (appState, marketsBySymbol) => {
    if (marketsBySymbol[appState.requestedSymbol]) {
      return appState.requestedSymbol;
    }

    if (marketsBySymbol[DEFAULT_MARKET_SYMBOL]) {
      return DEFAULT_MARKET_SYMBOL;
    }

    return Object.keys(marketsBySymbol)[0] ?? appState.requestedSymbol;
  },
);

export const selectSelectedMarket = createSelector(
  [selectSelectedSymbol, selectMarketsBySymbolState],
  (selectedSymbol, marketsBySymbol) =>
    marketsBySymbol[selectedSymbol] ?? createFallbackMarket(selectedSymbol),
);

export const selectRecentTrades = createSelector(
  [selectMarketState],
  (marketState) => marketState.recentTrades,
);

export const selectHasHydratedMarkets = createSelector(
  [selectMarketState],
  (marketState) => marketState.hasHydratedMarkets,
);

export const selectHasSelectedMarketSnapshot = createSelector(
  [selectSelectedSymbol, selectMarketsBySymbolState],
  (selectedSymbol, marketsBySymbol) => Boolean(marketsBySymbol[selectedSymbol]),
);

export const selectAsks = createSelector(
  [selectMarketState],
  (marketState) => marketState.asks,
);

export const selectBids = createSelector(
  [selectMarketState],
  (marketState) => marketState.bids,
);

export const selectReferencePrice = createSelector(
  [selectSelectedMarket],
  (selectedMarket) => selectedMarket?.lastPrice ?? 0,
);

export const selectHasOrderBookSnapshot = createSelector(
  [selectMarketState],
  (marketState) => marketState.hasOrderBookSnapshot,
);

export const selectHasRecentTradesSnapshot = createSelector(
  [selectMarketState],
  (marketState) => marketState.hasRecentTradesSnapshot,
);

export const { upsertMarkets, setRecentTrades, setOrderBook, resetMarketDetail } =
  marketSlice.actions;
export const marketReducer = marketSlice.reducer;
