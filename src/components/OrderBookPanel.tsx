import { memo, useMemo } from "react";

import { SUPPORTED_QUOTE_ASSET } from "../constants/markets";
import { useAppSelector } from "../store/hooks";
import {
  selectAsks,
  selectBids,
  selectReferencePrice,
  selectSelectedMarket,
} from "../store/slices/marketSlice";
import { formatCompactCurrency, formatPrice } from "../utils/formatters";

const ORDER_BOOK_ROWS = 8;

const OrderBookPanel = memo(() => {
  const asks = useAppSelector(selectAsks);
  const bids = useAppSelector(selectBids);
  const referencePrice = useAppSelector(selectReferencePrice);
  const selectedMarket = useAppSelector(selectSelectedMarket);
  const baseAsset = selectedMarket?.baseAsset || "BTC";
  const quoteAsset = selectedMarket?.quoteAsset || SUPPORTED_QUOTE_ASSET;

  const askRows = useMemo(
    () => [...asks].reverse().slice(0, ORDER_BOOK_ROWS),
    [asks],
  );
  const bidRows = useMemo(() => bids.slice(0, ORDER_BOOK_ROWS), [bids]);
  const maxAskTotal = askRows[0]?.total ?? 1;
  const maxBidTotal = bidRows[bidRows.length - 1]?.total ?? 1;

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-2">
        <h2 className="text-lg font-semibold text-foreground">Order Book</h2>
      </div>

      <div className="">
        <div className="grid grid-cols-3 gap-3 px-4 py-2 border-b border-border text-xs text-muted-foreground">
          <span>{`Price (${quoteAsset})`}</span>
          <span className="text-right">{`Amount (${baseAsset})`}</span>
          <span className="text-right">{`Total (${quoteAsset})`}</span>
        </div>

        <div className="space-y-1">
          {askRows.map((level) => (
            <OrderBookRow
              key={`ask-${level.price}`}
              side="ask"
              price={level.price}
              quantity={level.quantity}
              total={level.total}
              depthRatio={level.total / maxAskTotal}
            />
          ))}
        </div>

        <div className="border-y bg-secondary border-border px-4 py-3 text-center text-lg font-semibold text-foreground">
          {formatPrice(referencePrice)}
        </div>

        <div className="space-y-1">
          {bidRows.map((level) => (
            <OrderBookRow
              key={`bid-${level.price}`}
              side="bid"
              price={level.price}
              quantity={level.quantity}
              total={level.total}
              depthRatio={level.total / maxBidTotal}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

const OrderBookRow = memo(
  ({
    price,
    quantity,
    total,
    depthRatio,
    side,
  }: {
    price: number;
    quantity: number;
    total: number;
    depthRatio: number;
    side: "ask" | "bid";
  }) => (
    <div className="relative overflow-hidden">
      <div
        className={[
          "absolute inset-y-0 right-0",
          side === "ask" ? "bg-danger/14" : "bg-success/14",
        ].join(" ")}
        style={{
          width: `${Math.max(depthRatio * 100, 4)}%`,
        }}
      />
      <div className="relative z-10 grid grid-cols-3 gap-3 px-3 py-2 text-sm">
        <span
          className={[
            "font-medium",
            side === "ask" ? "text-danger" : "text-success",
          ].join(" ")}
        >
          {formatPrice(price)}
        </span>
        <span className="text-right text-foreground">
          {quantity.toFixed(5)}
        </span>
        <span className="text-right text-muted-foreground">
          {formatCompactCurrency(total)}
        </span>
      </div>
    </div>
  ),
);

OrderBookPanel.displayName = "OrderBookPanel";
OrderBookRow.displayName = "OrderBookRow";
export default OrderBookPanel;
