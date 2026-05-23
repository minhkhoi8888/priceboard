import { memo, useMemo, type CSSProperties } from "react";
import { List, type RowComponentProps } from "react-window";

import { SUPPORTED_QUOTE_ASSET } from "../constants/markets";
import { useAppSelector } from "../store/hooks";
import {
  selectRecentTrades,
  selectSelectedMarket,
} from "../store/slices/marketSlice";
import { formatPrice, formatTradeTime } from "../utils/formatters";

const TRADE_ROW_HEIGHT = 42;
const TRADE_VISIBLE_ROWS = 16;
const TRADE_LIST_MAX_HEIGHT = TRADE_ROW_HEIGHT * TRADE_VISIBLE_ROWS;

const mergeRowStyle = (style: CSSProperties) => ({
  ...style,
  width: "100%",
});

const RecentTradeListRow = ({
  index,
  style,
  recentTrades,
}: RowComponentProps<{
  recentTrades: ReturnType<typeof selectRecentTrades>;
}>) => {
  const trade = recentTrades[index];
  const sideClassName = trade.isBuyerMaker ? "text-danger" : "text-success";

  return (
    <div style={mergeRowStyle(style)}>
      <div className="grid grid-cols-[110px_1fr_84px] gap-3 px-3 py-2 text-sm">
        <span className={["font-medium", sideClassName].join(" ")}>
          {formatPrice(trade.price)}
        </span>
        <span className="text-right text-foreground">
          {trade.quantity.toFixed(6)}
        </span>
        <span className="text-right text-muted-foreground">
          {formatTradeTime(trade.time)}
        </span>
      </div>
    </div>
  );
};

function RecentTradesPanel() {
  const recentTrades = useAppSelector(selectRecentTrades);
  const selectedMarket = useAppSelector(selectSelectedMarket);
  const baseAsset = selectedMarket?.baseAsset || "BTC";
  const quoteAsset = selectedMarket?.quoteAsset || SUPPORTED_QUOTE_ASSET;
  const recentTradesListHeight = useMemo(
    () =>
      Math.min(
        Math.max(recentTrades.length, 1) * TRADE_ROW_HEIGHT,
        TRADE_LIST_MAX_HEIGHT,
      ),
    [recentTrades.length],
  );

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-2">
        <h2 className="text-lg font-semibold text-foreground">Recent Trades</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="grid grid-cols-[110px_1fr_84px] gap-3 border-b border-border px-4 py-2 text-xs text-muted-foreground">
          <span>{`Price (${quoteAsset})`}</span>
          <span className="text-right">{`Amount (${baseAsset})`}</span>
          <span className="text-right">Time</span>
        </div>

        <div className="min-h-0 flex-1">
          {recentTrades.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
              Waiting for live trades from Binance...
            </div>
          ) : (
            <List
              className="trade-scrollbar"
              rowComponent={RecentTradeListRow}
              rowCount={recentTrades.length}
              rowHeight={TRADE_ROW_HEIGHT}
              rowProps={{ recentTrades }}
              overscanCount={8}
              style={{ height: recentTradesListHeight, scrollbarGutter: "stable" }}
              defaultHeight={TRADE_LIST_MAX_HEIGHT}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(RecentTradesPanel);
