import { lazy, Suspense, useCallback, useState } from "react";

import ChartMarketStats from "../components/ChartMarketStats";
import MarketOverview from "../components/MarketOverview";
import MobileDepthTabs from "../components/MobileDepthTabs";
import MobileMarketOverlay from "../components/MobileMarketOverlay";
import OrderPanel from "../components/OrderPanel";
import OrderBookPanel from "../components/OrderBookPanel";
import RecentTradesPanel from "../components/RecentTradesPanel";
import MarketSection from "../components/MarketSection";
import Skeleton from "../components/Skeleton";
import TradePageSkeleton from "../components/TradePageSkeleton";
import { DEFAULT_FEATURED_MARKET_SYMBOLS } from "../constants/markets";
import { setRequestedSymbol } from "../store/slices/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectHasHydratedMarkets,
  selectHasSelectedMarketSnapshot,
  selectMarkets,
  selectReferencePrice,
  selectSelectedMarket,
  selectSelectedSymbol,
} from "../store/slices/marketSlice";

const CandlestickChart = lazy(() => import("../components/CandlestickChart"));

const ChartSectionFallback = () => (
  <section className="overflow-hidden rounded-lg border border-border bg-card">
    <div className="flex flex-col gap-4 border-b border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-12 rounded-lg" />
        ))}
      </div>
    </div>

    <div className="p-4">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  </section>
);

const TradePage = () => {
  const [featuredSymbols, setFeaturedSymbols] = useState(
    () => new Set(DEFAULT_FEATURED_MARKET_SYMBOLS),
  );
  const [isMobileMarketOpen, setIsMobileMarketOpen] = useState(false);
  const dispatch = useAppDispatch();
  const markets = useAppSelector(selectMarkets);
  const hasHydratedMarkets = useAppSelector(selectHasHydratedMarkets);
  const hasSelectedMarketSnapshot = useAppSelector(
    selectHasSelectedMarketSnapshot,
  );
  const referencePrice = useAppSelector(selectReferencePrice);
  const selectedSymbol = useAppSelector(selectSelectedSymbol);
  const selectedMarket = useAppSelector(selectSelectedMarket);
  const showPageSkeleton = !hasHydratedMarkets || !hasSelectedMarketSnapshot;

  const handleSelectSymbol = useCallback(
    (symbol: string) => dispatch(setRequestedSymbol(symbol)),
    [dispatch],
  );
  const handleToggleFeatured = useCallback((symbol: string) => {
    setFeaturedSymbols((current) => {
      const next = new Set(current);

      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }

      return next;
    });
  }, []);

  if (showPageSkeleton) {
    return <TradePageSkeleton />;
  }

  return (
    <main className="min-h-screen pb-6 text-foreground">
      <MarketOverview
        market={selectedMarket}
        onOpenMarketOverlay={() => setIsMobileMarketOpen(true)}
      />

      <div className="mx-auto mt-4 flex-col gap-4 px-4">
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px] xl:items-start">
          <div className="order-1 grid gap-4 xl:order-2">
            <ChartMarketStats market={selectedMarket} />
            <Suspense fallback={<ChartSectionFallback />}>
              <CandlestickChart
                livePrice={selectedMarket?.lastPrice ?? 0}
                symbol={selectedSymbol}
              />
            </Suspense>

            <div className="hidden gap-4 xl:grid xl:grid-cols-2">
              <OrderBookPanel />
              <RecentTradesPanel />
            </div>
          </div>

          <div className="order-2 xl:order-3">
            <OrderPanel
              referencePrice={referencePrice}
              selectedMarket={selectedMarket}
            />
          </div>

          <div className="order-3">
            <MobileDepthTabs />
          </div>

          <div className="order-3 hidden xl:order-1 xl:block xl:sticky xl:top-4">
            <MarketSection
              featuredSymbols={featuredSymbols}
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onToggleFeatured={handleToggleFeatured}
              selectedSymbol={selectedSymbol}
            />
          </div>
        </div>
      </div>

      <MobileMarketOverlay
        featuredSymbols={featuredSymbols}
        isOpen={isMobileMarketOpen}
        markets={markets}
        onClose={() => setIsMobileMarketOpen(false)}
        onSelectSymbol={handleSelectSymbol}
        onToggleFeatured={handleToggleFeatured}
        selectedSymbol={selectedSymbol}
      />
    </main>
  );
};

export default TradePage;
