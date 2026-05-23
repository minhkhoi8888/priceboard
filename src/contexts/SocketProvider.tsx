import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import {
  BINANCE_STREAM_URL,
  MAX_RECENT_TRADES,
  MINI_TICKER_FLUSH_INTERVAL_MS,
  MINI_TICKER_STREAMS,
  ORDER_BOOK_FLUSH_INTERVAL_MS,
  ORDER_BOOK_LEVELS,
  ORDER_BOOK_STREAM_INTERVAL_MS,
  RECENT_TRADES_FLUSH_INTERVAL_MS,
} from "../config/binance";
import { SUPPORTED_MARKET_SYMBOL_SET } from "../constants/markets";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setConnectionStatus } from "../store/slices/appSlice";
import {
  resetMarketDetail,
  selectSelectedSymbol,
  setOrderBook,
  setRecentTrades,
  upsertMarkets,
} from "../store/slices/marketSlice";
import type { MarketTicker, RecentTrade } from "../store/types/marketTypes";
import { buildMarketFromMiniTicker } from "../utils/market";
import { buildDepthSide, inferStreamPath } from "../utils/socket";
import { SocketContext } from "./SocketContext";

interface BinanceMiniTickerMessage {
  e: "24hrMiniTicker";
  s: string;
  c: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
}

interface BinanceAggregateTradeMessage {
  e: "aggTrade";
  s: string;
  a: number;
  p: string;
  q: string;
  T: number;
  m: boolean;
}

interface BinanceDiffDepthMessage {
  e: "depthUpdate";
  s: string;
  a: Array<[string, string]>;
  b: Array<[string, string]>;
}

interface BinancePartialDepthMessage {
  lastUpdateId: number;
  asks: Array<[string, string]>;
  bids: Array<[string, string]>;
}

type ManagedStreamListener = (payload: unknown) => void;
type SocketSubscriptions = Map<string, Set<ManagedStreamListener>>;

interface BinanceSocketControlMessage {
  id?: number;
  result?: unknown;
  stream?: string;
  data?: unknown;
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const selectedSymbol = useAppSelector(selectSelectedSymbol);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const connectSocketRef = useRef<() => void>(() => {});
  const requestIdRef = useRef(0);
  const subscriptionsRef = useRef<SocketSubscriptions>(new Map());
  const recentTradesRef = useRef<RecentTrade[]>([]);
  const pendingMarketUpdatesRef = useRef(new Map<string, MarketTicker>());
  const pendingRecentTradesRef = useRef<RecentTrade[]>([]);
  const pendingOrderBookRef = useRef<{
    asks: ReturnType<typeof buildDepthSide>;
    bids: ReturnType<typeof buildDepthSide>;
  } | null>(null);
  const isUnmountedRef = useRef(false);
  const marketFlushTimerRef = useRef<number | null>(null);
  const recentTradesFlushTimerRef = useRef<number | null>(null);
  const orderBookFlushTimerRef = useRef<number | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearFlushTimer = useCallback((timerRef: { current: number | null }) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flushRecentTrades = useCallback(() => {
    recentTradesFlushTimerRef.current = null;

    if (pendingRecentTradesRef.current.length > 0) {
      const nextTrades = [...pendingRecentTradesRef.current].reverse();
      nextTrades.push(...recentTradesRef.current);

      if (nextTrades.length > MAX_RECENT_TRADES) {
        nextTrades.length = MAX_RECENT_TRADES;
      }

      recentTradesRef.current = nextTrades;
      pendingRecentTradesRef.current = [];
      dispatch(setRecentTrades(nextTrades));
    }
  }, [dispatch]);

  const flushMarkets = useCallback(() => {
    marketFlushTimerRef.current = null;

    if (pendingMarketUpdatesRef.current.size > 0) {
      dispatch(upsertMarkets([...pendingMarketUpdatesRef.current.values()]));
      pendingMarketUpdatesRef.current.clear();
    }
  }, [dispatch]);

  const flushOrderBook = useCallback(() => {
    orderBookFlushTimerRef.current = null;

    if (pendingOrderBookRef.current) {
      dispatch(setOrderBook(pendingOrderBookRef.current));
      pendingOrderBookRef.current = null;
    }
  }, [dispatch]);

  const scheduleRecentTradesFlush = useCallback(() => {
    if (recentTradesFlushTimerRef.current !== null) {
      return;
    }

    recentTradesFlushTimerRef.current = window.setTimeout(
      flushRecentTrades,
      RECENT_TRADES_FLUSH_INTERVAL_MS,
    );
  }, [flushRecentTrades]);

  const scheduleMarketFlush = useCallback(() => {
    if (marketFlushTimerRef.current !== null) {
      return;
    }

    marketFlushTimerRef.current = window.setTimeout(
      flushMarkets,
      MINI_TICKER_FLUSH_INTERVAL_MS,
    );
  }, [flushMarkets]);

  const scheduleOrderBookFlush = useCallback(() => {
    if (orderBookFlushTimerRef.current !== null) {
      return;
    }

    orderBookFlushTimerRef.current = window.setTimeout(
      flushOrderBook,
      ORDER_BOOK_FLUSH_INTERVAL_MS,
    );
  }, [flushOrderBook]);

  const sendSocketCommand = useCallback(
    (method: "SUBSCRIBE" | "UNSUBSCRIBE", params: string[]) => {
      const socket = socketRef.current;

      if (!socket || socket.readyState !== WebSocket.OPEN || params.length === 0) {
        return;
      }

      socket.send(
        JSON.stringify({
          method,
          params,
          id: ++requestIdRef.current,
        }),
      );
    },
    [],
  );

  const notifyStreamListeners = useCallback((streamPath: string, data: unknown) => {
    const listeners = subscriptionsRef.current.get(streamPath);

    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      listener(data);
    });
  }, []);

  const connectSocket = useCallback(() => {
    if (document.visibilityState === "hidden") {
      dispatch(setConnectionStatus("disconnected"));
      return;
    }

    clearReconnectTimer();
    const socket = new WebSocket(BINANCE_STREAM_URL);
    socketRef.current = socket;
    dispatch(setConnectionStatus("connecting"));

    socket.addEventListener("open", () => {
      if (
        isUnmountedRef.current ||
        document.visibilityState === "hidden" ||
        socketRef.current !== socket
      ) {
        return;
      }

      dispatch(setConnectionStatus("connected"));
      socket.send(
        JSON.stringify({
          method: "SET_PROPERTY",
          params: ["combined", true],
          id: ++requestIdRef.current,
        }),
      );
      sendSocketCommand("SUBSCRIBE", [...subscriptionsRef.current.keys()]);
    });

    socket.addEventListener("message", (event) => {
      if (document.visibilityState === "hidden" || socketRef.current !== socket) {
        return;
      }

      const payload = JSON.parse(event.data) as BinanceSocketControlMessage;

      if ("result" in payload && payload.result === null) {
        return;
      }

      const streamPath =
        payload.stream ??
        inferStreamPath(payload.data ?? payload, {
          orderBookLevels: ORDER_BOOK_LEVELS,
          orderBookStreamIntervalMs: ORDER_BOOK_STREAM_INTERVAL_MS,
        });
      const data = payload.data ?? payload;

      if (!streamPath) {
        return;
      }

      notifyStreamListeners(streamPath, data);
    });

    socket.addEventListener("close", () => {
      if (isUnmountedRef.current || socketRef.current !== socket) {
        return;
      }

      socketRef.current = null;
      dispatch(setConnectionStatus("disconnected"));
      reconnectTimerRef.current = window.setTimeout(() => {
        connectSocketRef.current();
      }, 2000);
    });

    socket.addEventListener("error", () => {
      if (socketRef.current === socket) {
        socket.close();
      }
    });
  }, [clearReconnectTimer, dispatch, notifyStreamListeners, sendSocketCommand]);

  useEffect(() => {
    connectSocketRef.current = connectSocket;
  }, [connectSocket]);

  const subscribeCombinedStream = useCallback(
    (streamPath: string, listener: ManagedStreamListener) => {
      const listeners = subscriptionsRef.current.get(streamPath);

      if (listeners) {
        listeners.add(listener);
      } else {
        subscriptionsRef.current.set(streamPath, new Set([listener]));
        sendSocketCommand("SUBSCRIBE", [streamPath]);
      }

      return () => {
        const currentListeners = subscriptionsRef.current.get(streamPath);

        if (!currentListeners) {
          return;
        }

        currentListeners.delete(listener);

        if (currentListeners.size === 0) {
          subscriptionsRef.current.delete(streamPath);
          sendSocketCommand("UNSUBSCRIBE", [streamPath]);
        }
      };
    },
    [sendSocketCommand],
  );

  const socketValue = useMemo(
    () => ({
      subscribeCombinedStream,
    }),
    [subscribeCombinedStream],
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    connectSocketRef.current();
    const subscriptions = subscriptionsRef.current;
    const pendingMarketUpdates = pendingMarketUpdatesRef.current;

    return () => {
      isUnmountedRef.current = true;
      clearReconnectTimer();
      clearFlushTimer(marketFlushTimerRef);
      clearFlushTimer(recentTradesFlushTimerRef);
      clearFlushTimer(orderBookFlushTimerRef);
      socketRef.current?.close();
      socketRef.current = null;
      recentTradesRef.current = [];
      pendingRecentTradesRef.current = [];
      pendingMarketUpdates.clear();
      pendingOrderBookRef.current = null;
      subscriptions.clear();
    };
  }, [clearFlushTimer, clearReconnectTimer, connectSocket]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearReconnectTimer();
        clearFlushTimer(marketFlushTimerRef);
        clearFlushTimer(recentTradesFlushTimerRef);
        clearFlushTimer(orderBookFlushTimerRef);
        socketRef.current?.close();
        socketRef.current = null;
        dispatch(setConnectionStatus("disconnected"));
        return;
      }

      if (!socketRef.current) {
        connectSocketRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearFlushTimer, clearReconnectTimer, dispatch]);

  useEffect(() => {
    const unsubscribers = MINI_TICKER_STREAMS.map((streamPath) =>
      subscribeCombinedStream(streamPath, (payload) => {
        const ticker = payload as BinanceMiniTickerMessage;

        if (!ticker?.s || !SUPPORTED_MARKET_SYMBOL_SET.has(ticker.s)) {
          return;
        }

        pendingMarketUpdatesRef.current.set(
          ticker.s,
          buildMarketFromMiniTicker(ticker.s, ticker),
        );
        scheduleMarketFlush();
      }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [scheduleMarketFlush, subscribeCombinedStream]);

  useEffect(() => {
    recentTradesRef.current = [];
    pendingRecentTradesRef.current = [];
    pendingOrderBookRef.current = null;
    clearFlushTimer(recentTradesFlushTimerRef);
    clearFlushTimer(orderBookFlushTimerRef);
    dispatch(resetMarketDetail());

    const streamKey = selectedSymbol.toLowerCase();
    const tradeStream = `${streamKey}@aggTrade`;
    const depthStream = `${streamKey}@depth${ORDER_BOOK_LEVELS}@${ORDER_BOOK_STREAM_INTERVAL_MS}ms`;

    const unsubscribeTrade = subscribeCombinedStream(tradeStream, (payload) => {
      const trade = payload as BinanceAggregateTradeMessage;
      const pendingTrades = pendingRecentTradesRef.current;

      pendingTrades.push({
        id: trade.a,
        price: Number(trade.p),
        quantity: Number(trade.q),
        time: trade.T,
        isBuyerMaker: trade.m,
      });

      if (pendingTrades.length > MAX_RECENT_TRADES) {
        pendingTrades.splice(0, pendingTrades.length - MAX_RECENT_TRADES);
      }

      scheduleRecentTradesFlush();
    });

    const unsubscribeDepth = subscribeCombinedStream(depthStream, (payload) => {
      const depth = payload as BinanceDiffDepthMessage | BinancePartialDepthMessage;
      const asks = "asks" in depth ? depth.asks : depth.a;
      const bids = "bids" in depth ? depth.bids : depth.b;

      pendingOrderBookRef.current = {
        asks: buildDepthSide(asks),
        bids: buildDepthSide(bids),
      };
      scheduleOrderBookFlush();
    });

    return () => {
      clearFlushTimer(recentTradesFlushTimerRef);
      clearFlushTimer(orderBookFlushTimerRef);
      flushRecentTrades();
      flushOrderBook();
      unsubscribeTrade();
      unsubscribeDepth();
    };
  }, [
    clearFlushTimer,
    dispatch,
    flushOrderBook,
    flushRecentTrades,
    scheduleOrderBookFlush,
    scheduleRecentTradesFlush,
    selectedSymbol,
    subscribeCombinedStream,
  ]);

  return (
    <SocketContext.Provider value={socketValue}>{children}</SocketContext.Provider>
  );
};
