import { memo } from "react";

import { Icon } from "./Icon";
import { selectMarkets } from "../store/slices/marketSlice";
import {
  formatCompactCurrency,
  formatMarketCode,
  formatMarketPair,
  formatPercent,
  formatPrice,
} from "../utils/formatters";

type Market = ReturnType<typeof selectMarkets>[number];

interface MarketSectionProps {
  featuredSymbols: Set<string>;
  markets: ReturnType<typeof selectMarkets>;
  onSelectSymbol: (symbol: string) => void;
  onToggleFeatured: (symbol: string) => void;
  selectedSymbol: string;
}

const MarketSection = ({
  featuredSymbols,
  markets,
  onSelectSymbol,
  onToggleFeatured,
  selectedSymbol,
}: MarketSectionProps) => (
  <section className="h-fit overflow-hidden rounded-lg border border-border bg-card text-foreground">
    <div className="border-b border-border bg-card px-4 py-2">
      <h2 className="text-lg font-semibold">Markets</h2>
    </div>
    <div className="grid grid-cols-3 gap-3 border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      <span>Pair</span>
      <span className="text-right">Price</span>
      <span className="text-right">24h Stats</span>
    </div>
    <div>
      {markets.map((market) => (
        <MarketListItem
          key={market.symbol}
          featuredSymbols={featuredSymbols}
          market={market}
          onSelectSymbol={onSelectSymbol}
          onToggleFeatured={onToggleFeatured}
          selectedSymbol={selectedSymbol}
        />
      ))}
    </div>
  </section>
);

export default memo(MarketSection);

const MarketListItem = memo(
  ({
    featuredSymbols,
    market,
    onSelectSymbol,
    onToggleFeatured,
    selectedSymbol,
  }: {
    featuredSymbols: Set<string>;
    market: Market;
    onSelectSymbol: (symbol: string) => void;
    onToggleFeatured: (symbol: string) => void;
    selectedSymbol: string;
  }) => {
    const isActive = market.symbol === selectedSymbol;
    const isPositive = market.priceChangePercent >= 0;
    const isFeatured = featuredSymbols.has(market.symbol);

    return (
      <div className="border-t border-border first:border-t-0">
        <div
          className={[
            "flex items-center gap-3 p-4 transition-colors",
            isActive ? "bg-secondary" : "bg-card hover:bg-secondary",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label={
              isFeatured
                ? `Remove ${market.symbol} from featured markets`
                : `Add ${market.symbol} to featured markets`
            }
            aria-pressed={isFeatured}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFeatured(market.symbol);
            }}
            className={[
              "cursor-pointer text-lg leading-none transition-colors",
              isFeatured
                ? "text-amber-500 hover:text-amber-400"
                : "text-slate-300 hover:text-amber-500",
            ].join(" ")}
          >
            {isFeatured ? "★" : "☆"}
          </button>

          <button
            type="button"
            onClick={() => onSelectSymbol(market.symbol)}
            className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-left"
          >
            <div className="min-w-0">
              <p className="truncate text-foreground">
                {formatMarketPair(market.symbol)}
              </p>
              <p className="mt-1 truncate uppercase text-muted-foreground">
                {formatMarketCode(market.symbol)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-foreground">
                ${formatPrice(market.lastPrice)}
              </p>
            </div>

            <div className="text-right">
              <p
                className={[
                  "flex items-center justify-center gap-1 text-sm",
                  isPositive ? "text-success" : "text-danger",
                ].join(" ")}
              >
                {isPositive ? (
                  <Icon name="arrow-up" size={14} />
                ) : (
                  <Icon name="arrow-down" size={14} />
                )}
                {formatPercent(market.priceChangePercent)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                ${formatCompactCurrency(market.quoteVolume)}
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  },
);
