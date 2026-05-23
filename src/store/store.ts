import { configureStore, type Action } from "@reduxjs/toolkit";

import { coinGeckoApi } from "./api/coinGeckoApi";
import { appReducer } from "./slices/appSlice";
import {
  marketReducer,
  setOrderBook,
  setRecentTrades,
  upsertMarkets,
} from "./slices/marketSlice";

const LIVE_MARKET_ACTION_TYPES = new Set<string>([
  setOrderBook.type,
  setRecentTrades.type,
  upsertMarkets.type,
]);

const shouldRecordDevToolsAction = (_state: unknown, action: Action) =>
  !LIVE_MARKET_ACTION_TYPES.has(action.type);
const enableReduxDevTools =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === "true";

export const store = configureStore({
  reducer: {
    app: appReducer,
    [coinGeckoApi.reducerPath]: coinGeckoApi.reducer,
    market: marketReducer,
  },
  devTools: enableReduxDevTools
    ? {
        maxAge: 50,
        predicate: shouldRecordDevToolsAction,
        trace: false,
      }
    : false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(coinGeckoApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
