import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import { CANDLE_LIMIT, BINANCE_REST_URL } from "../config/binance";
import { CHART_INTERVALS } from "../config/chart";
import { useSocketRuntime } from "../contexts/SocketContext";
import { useTheme } from "../contexts/ThemeProvider";
import type { CandlePoint } from "../lib/chartIndicators";
import {
  type ChartInterval,
  buildCandlePoint,
  toChartTime,
} from "../utils/chart";
import { Icon } from "./Icon";
import { useSmoothLoading } from "../hooks/useSmoothLoading";

interface CandlestickChartProps {
  livePrice: number;
  symbol: string;
}

interface ThemePalette {
  foreground: string;
  border: string;
  mutedForeground: string;
  card: string;
  upColor: string;
  downColor: string;
  upWick: string;
  downWick: string;
  grid: string;
}

interface BinanceKlineStreamMessage {
  e: "kline";
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

const readThemeColor = (variableName: string, fallback: string) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return value || fallback;
};

const buildPalette = (isDark: boolean): ThemePalette => ({
  foreground: isDark ? "#f8fafc" : "#14141f",
  border: isDark ? "#25273b" : "#e2e8f0",
  mutedForeground: isDark ? "#8f95a9" : "#64748b",
  card: isDark ? "#14141f" : "#f8f9fa",
  upColor: readThemeColor("--success", isDark ? "#22c55e" : "#059669"),
  downColor: readThemeColor("--danger", isDark ? "#ef4444" : "#dc2626"),
  upWick: readThemeColor("--success", isDark ? "#22c55e" : "#059669"),
  downWick: readThemeColor("--danger", isDark ? "#ef4444" : "#dc2626"),
  grid: isDark ? "rgba(143,149,169,0.12)" : "rgba(148,163,184,0.12)",
});

const CandlestickChart = ({
  livePrice,
  symbol,
}: CandlestickChartProps): JSX.Element => {
  const { isDark } = useTheme();
  const { subscribeCombinedStream } = useSocketRuntime();
  const palette = useMemo(() => buildPalette(isDark), [isDark]);
  const [interval, setInterval] = useState<ChartInterval>("1d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showLoadingOverlay = useSmoothLoading(isLoading);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const candlesRef = useRef<CandlePoint[]>([]);
  const livePriceRef = useRef(livePrice);

  const syncLatestPrice = useCallback((price: number) => {
    const candleSeries = candleSeriesRef.current;
    const current = candlesRef.current;
    const latestCandle = current.at(-1);

    if (!candleSeries || !latestCandle || price <= 0) {
      return;
    }

    const syncedCandle = {
      ...latestCandle,
      close: price,
      high: Math.max(latestCandle.high, price),
      low: Math.min(latestCandle.low, price),
    };

    if (
      syncedCandle.close === latestCandle.close &&
      syncedCandle.high === latestCandle.high &&
      syncedCandle.low === latestCandle.low
    ) {
      return;
    }

    current[current.length - 1] = syncedCandle;
    candleSeries.update(syncedCandle as CandlestickData<UTCTimestamp>);
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: "#000000",
        attributionLogo: false,
      },
      localization: {
        locale: "en-US",
      },
      grid: {
        vertLines: {
          color: "transparent",
        },
        horzLines: {
          color: "transparent",
        },
      },
      crosshair: {
        vertLine: {
          color: "#000000",
          labelBackgroundColor: "#000000",
        },
        horzLine: {
          color: "#000000",
          labelBackgroundColor: "#000000",
        },
      },
      rightPriceScale: {
        borderColor: "transparent",
        scaleMargins: {
          top: 0.06,
          bottom: 0.08,
        },
      },
      timeScale: {
        borderColor: "transparent",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 1,
        minBarSpacing: 14,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: palette.upColor,
        downColor: palette.downColor,
        borderVisible: false,
        wickUpColor: palette.upWick,
        wickDownColor: palette.downWick,
        priceLineVisible: true,
        lastValueVisible: true,
      },
      0,
    );

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;

    if (!chart || !candleSeries) {
      return;
    }

    chart.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: palette.foreground,
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          color: palette.grid,
        },
        horzLines: {
          color: palette.grid,
        },
      },
      crosshair: {
        vertLine: {
          color: palette.mutedForeground,
          labelBackgroundColor: palette.card,
        },
        horzLine: {
          color: palette.mutedForeground,
          labelBackgroundColor: palette.card,
        },
      },
      rightPriceScale: {
        borderColor: palette.border,
        scaleMargins: {
          top: 0.06,
          bottom: 0.08,
        },
      },
      timeScale: {
        borderColor: "transparent",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 1,
        minBarSpacing: 14,
      },
    });

    candleSeries.applyOptions({
      upColor: palette.upColor,
      downColor: palette.downColor,
      borderVisible: false,
      wickUpColor: palette.upWick,
      wickDownColor: palette.downWick,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    if (candlesRef.current.length > 0) {
      candleSeries.setData(
        candlesRef.current as CandlestickData<UTCTimestamp>[],
      );
    }
  }, [palette]);

  useEffect(() => {
    livePriceRef.current = livePrice;
    syncLatestPrice(livePrice);
  }, [livePrice, syncLatestPrice]);

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const chart = chartRef.current;

    if (!candleSeries || !chart) {
      return undefined;
    }

    let disposed = false;
    const controller = new AbortController();

    const syncStreamingCandle = (incoming: CandlePoint) => {
      const current = candlesRef.current;
      const previous = current.at(-1);

      if (!previous) {
        current.push(incoming);
      } else if (previous.time === incoming.time) {
        current[current.length - 1] = incoming;
      } else if (incoming.time > previous.time) {
        current.push(incoming);

        if (current.length > CANDLE_LIMIT) {
          current.shift();
        }
      } else {
        return;
      }

      candleSeries.update(incoming as CandlestickData<UTCTimestamp>);
    };

    const unsubscribeKlineStream = subscribeCombinedStream(
      `${symbol.toLowerCase()}@kline_${interval}`,
      (payload) => {
        if (disposed) {
          return;
        }

        const message = payload as BinanceKlineStreamMessage;
        const kline = message.k;

        if (!kline) {
          return;
        }

        syncStreamingCandle({
          time: toChartTime(kline.t),
          open: Number(kline.o),
          high: Number(kline.h),
          low: Number(kline.l),
          close: Number(kline.c),
          volume: Number(kline.v),
        });
      },
    );

    const loadCandles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        candlesRef.current = [];
        candleSeries.setData([]);

        const params = new URLSearchParams({
          symbol,
          interval,
          limit: String(CANDLE_LIMIT),
        });
        const response = await fetch(
          `${BINANCE_REST_URL}?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Binance responded with ${response.status}`);
        }

        const payload = (await response.json()) as unknown;

        if (disposed) {
          return;
        }

        if (!Array.isArray(payload)) {
          throw new Error("Binance returned an invalid kline payload.");
        }

        const candles = payload.map((entry) =>
          buildCandlePoint(entry as Array<string | number>),
        );
        candlesRef.current = candles;
        candleSeries.setData(candles as CandlestickData<UTCTimestamp>[]);
        syncLatestPrice(livePriceRef.current);
        chart.timeScale().fitContent();
      } catch (loadError) {
        if (disposed || controller.signal.aborted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load candlestick data.";
        setError(message);
      } finally {
        if (!disposed) {
          setIsLoading(false);
        }
      }
    };

    void loadCandles();

    return () => {
      disposed = true;
      controller.abort();
      unsubscribeKlineStream();
    };
  }, [interval, subscribeCombinedStream, symbol, syncLatestPrice]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <span
            className="inline-flex h-9 w-9 items-center justify-center
           rounded-full bg-background text-muted-foreground"
          >
            <Icon name="trending-up" size={18} />
          </span>
          <h3 className="text-lg font-semibold text-foreground">Price Chart</h3>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {CHART_INTERVALS.map((item) => (
            <button
              key={`${item.label}-${item.value}`}
              type="button"
              onClick={() => {
                setInterval(item.value);
              }}
              className={[
                "rounded-lg px-3 py-1.5 text-sm tabular-nums transition-colors",
                interval === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-card">
        <div ref={containerRef} className="h-100 w-full" />

        {showLoadingOverlay ? (
          <div className="absolute inset-0 bg-card/74 p-4 backdrop-blur-sm">
            <div className="h-full w-full rounded-2xl bg-card/80" />
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-x-4 top-4 rounded-xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default memo(CandlestickChart);
