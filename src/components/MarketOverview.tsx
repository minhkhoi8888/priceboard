import { memo } from "react";

import { Icon } from "./Icon";
import type { MarketTicker } from "../store/types/marketTypes";
import {
  formatPercent,
  formatPrice,
  formatWholeNumber,
} from "../utils/formatters";

interface MarketOverviewProps {
  market?: MarketTicker;
  onOpenMarketOverlay?: () => void;
}

const MarketMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
    <p className="mt-1 truncate whitespace-nowrap text-sm text-foreground tabular-nums sm:text-base">
      {value}
    </p>
  </div>
);

const MarketOverview = ({
  market,
  onOpenMarketOverlay,
}: MarketOverviewProps) => {
  const isPositive = (market?.priceChangePercent ?? 0) >= 0;

  return (
    <section className="border-b border-border bg-card p-4">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-start">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <div className="min-w-30">
            <div className="flex items-center gap-2">
              <p className="uppercase text-slate-500">
                {market?.displayPair ?? "Spot"}
              </p>
              {onOpenMarketOverlay ? (
                <button
                  type="button"
                  aria-label="Open markets"
                  onClick={onOpenMarketOverlay}
                  className="text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                >
                  <Icon name="chev-down" size={16} />
                </button>
              ) : null}
            </div>
            <h1 className="whitespace-nowrap text-2xl font-semibold text-foreground tabular-nums">
              ${formatPrice(market?.lastPrice ?? 0)}
            </h1>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-1 rounded-lg p-2 tabular-nums",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger",
            ].join(" ")}
          >
            <Icon
              name={isPositive ? "arrow-up" : "arrow-down"}
              size={14}
              className="shrink-0"
            />
            <span>{formatPercent(market?.priceChangePercent ?? 0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MarketMetric
            label="24h High"
            value={`$${formatPrice(market?.highPrice ?? 0)}`}
          />
          <MarketMetric
            label="24h Low"
            value={`$${formatPrice(market?.lowPrice ?? 0)}`}
          />
          <MarketMetric
            label="24h Volume"
            value={`$${formatWholeNumber(market?.quoteVolume ?? 0)}`}
          />
        </div>
      </div>
    </section>
  );
};

export default memo(MarketOverview);
