import { memo, useState } from "react";

import { Icon } from "./Icon";
import { SUPPORTED_QUOTE_ASSET } from "../constants/markets";
import type { MarketTicker } from "../store/types/marketTypes";
import { formatPrice } from "../utils/formatters";
import {
  clamp,
  getAllocationFromAmount,
  getAmountFromAllocation,
} from "../utils/order";
import { showComingSoonToast } from "../utils/toast";

interface OrderPanelProps {
  referencePrice: number;
  selectedMarket?: MarketTicker;
}

const QUICK_ALLOCATION_OPTIONS = [25, 50, 75, 100] as const;
const BALANCE_USD = 10000;
const DEFAULT_BASE_BALANCE = 0.5;
const DEFAULT_ORDER_SIDE = "sell" as const;
const DEFAULT_ORDER_TYPE = "market" as const;
const DEFAULT_ALLOCATION = 17;

type OrderSide = "buy" | "sell";
type OrderType = "limit" | "market";

function OrderPanel({
  referencePrice,
  selectedMarket,
}: OrderPanelProps) {
  const [orderSide, setOrderSide] = useState<OrderSide>(DEFAULT_ORDER_SIDE);
  const [orderType, setOrderType] = useState<OrderType>(DEFAULT_ORDER_TYPE);
  const [allocation, setAllocation] = useState(DEFAULT_ALLOCATION);
  const quoteAsset = selectedMarket?.quoteAsset ?? SUPPORTED_QUOTE_ASSET;
  const baseAsset = selectedMarket?.baseAsset ?? "BTC";
  const realtimePrice = referencePrice || selectedMarket?.lastPrice || 0;
  const [limitPriceInput, setLimitPriceInput] = useState(() =>
    realtimePrice > 0 ? String(realtimePrice) : "",
  );
  const baseBalance = baseAsset === "BTC" ? DEFAULT_BASE_BALANCE : 0.5;
  const quoteBalance =
    quoteAsset === SUPPORTED_QUOTE_ASSET ? BALANCE_USD : 10000;
  const maxAmountBySide: Record<OrderSide, number> = {
    buy: quoteBalance,
    sell: baseBalance,
  };
  const currentMaxAmount = maxAmountBySide[orderSide];
  const [amountInput, setAmountInput] = useState(() =>
    String(
      getAmountFromAllocation(
        maxAmountBySide[DEFAULT_ORDER_SIDE],
        DEFAULT_ALLOCATION,
      ),
    ),
  );
  const rawAmount = amountInput === "" ? 0 : Number(amountInput);
  const normalizedAmount = Number.isFinite(rawAmount)
    ? clamp(rawAmount, 0, currentMaxAmount)
    : 0;
  const fallbackPrice = realtimePrice > 0 ? realtimePrice : 0;
  const limitOrderPrice = Number(limitPriceInput);
  const orderPrice =
    orderType === "market"
      ? fallbackPrice
      : limitPriceInput === ""
        ? fallbackPrice
        : Number.isFinite(limitOrderPrice) && limitOrderPrice > 0
          ? limitOrderPrice
          : 0;
  const allocatedQuoteAmount =
    orderSide === "buy"
      ? normalizedAmount
      : getAmountFromAllocation(quoteBalance, allocation);
  const allocatedBaseAmount =
    orderSide === "sell"
      ? normalizedAmount
      : getAmountFromAllocation(baseBalance, allocation);
  const estimatedBaseAmount =
    orderSide === "buy"
      ? orderPrice > 0
        ? allocatedQuoteAmount / orderPrice
        : 0
      : allocatedBaseAmount;
  const estimatedQuoteTotal = orderPrice * estimatedBaseAmount;
  const displayAmountAsset = orderSide === "buy" ? quoteAsset : baseAsset;
  const summaryLabel = orderSide === "buy" ? "Est. receive" : "Total";
  const summaryValue =
    orderSide === "buy"
      ? formatPrice(estimatedBaseAmount, { maxSmallFractionDigits: 6 })
      : formatPrice(estimatedQuoteTotal);
  const summaryAsset = orderSide === "buy" ? baseAsset : quoteAsset;
  const displayedPriceValue =
    orderType === "market"
      ? fallbackPrice > 0
        ? String(fallbackPrice)
        : ""
      : limitPriceInput === "" && fallbackPrice > 0
        ? String(fallbackPrice)
        : limitPriceInput;

  const syncAllocation = (nextAllocation: number) => {
    const clampedAllocation = clamp(nextAllocation, 0, 100);
    setAllocation(clampedAllocation);
    setAmountInput(
      String(getAmountFromAllocation(currentMaxAmount, clampedAllocation)),
    );
  };

  const handleOrderSideChange = (nextOrderSide: OrderSide) => {
    setOrderSide(nextOrderSide);
    setAmountInput(
      String(
        getAmountFromAllocation(maxAmountBySide[nextOrderSide], allocation),
      ),
    );
  };

  const handleAmountInputChange = (value: string) => {
    setAmountInput(value);

    if (value === "") {
      setAllocation(0);
      return;
    }

    const nextAmount = Number(value);
    if (!Number.isFinite(nextAmount)) {
      return;
    }

    const clampedAmount = clamp(nextAmount, 0, currentMaxAmount);
    setAllocation(getAllocationFromAmount(clampedAmount, currentMaxAmount));
  };

  return (
    <section className="h-fit overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-2 border-b border-border">
        <button
          type="button"
          onClick={() => handleOrderSideChange("buy")}
          className={[
            "flex cursor-pointer items-center justify-center gap-2 p-4 font-semibold transition-colors",
            orderSide === "buy"
              ? "border-b-2 border-success bg-success/10 text-success"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          ].join(" ")}
        >
          <Icon name="trending-up" size={18} />
          <span>Buy</span>
        </button>
        <button
          type="button"
          onClick={() => handleOrderSideChange("sell")}
          className={[
            "flex cursor-pointer items-center justify-center gap-2 p-4 font-semibold transition-colors",
            orderSide === "sell"
              ? "border-b-2 border-danger bg-danger/10 text-danger"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          ].join(" ")}
        >
          <Icon name="trending-down" size={18} />
          <span>Sell</span>
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderType("limit")}
            className={[
              "cursor-pointer rounded-lg px-4 py-2 transition-colors",
              orderType === "limit"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-secondary",
            ].join(" ")}
          >
            Limit Order
          </button>
          <button
            type="button"
            onClick={() => setOrderType("market")}
            className={[
              "cursor-pointer rounded-lg px-4 py-2 transition-colors",
              orderType === "market"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-secondary",
            ].join(" ")}
          >
            Market Order
          </button>
        </div>

        <div className="rounded-lg bg-background/70 p-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-flex items-center justify-center rounded-full bg-card">
              <Icon name="wallet" size={18} />
            </span>
            <p>Available Balance</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-5 ">
            <div>
              <p className="text-sm uppercase text-muted-foreground">
                {quoteAsset}
              </p>
              <p className="font-semibold text-foreground">
                ${quoteBalance.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase text-muted-foreground">
                {baseAsset}
              </p>
              <p className="font-semibold text-foreground">
                {baseBalance.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        <label className="block mt-4">
          <span className="mb-2 block text-foreground">Price</span>
          <div className="flex items-center rounded-lg border border-border bg-white dark:bg-background/75 px-4 py-2">
            <input
              type="number"
              min="0"
              step="any"
              value={displayedPriceValue}
              onChange={(event) => setLimitPriceInput(event.target.value)}
              disabled={orderType === "market"}
              className="w-full bg-transparent text-foreground outline-none font-mono disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-muted-foreground">{quoteAsset}</span>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-foreground">Amount</span>
          <div className="flex items-center rounded-lg border border-border bg-white dark:bg-background/75 px-4 py-2">
            <input
              type="number"
              min="0"
              max={currentMaxAmount}
              step="any"
              value={amountInput}
              onChange={(event) => handleAmountInputChange(event.target.value)}
              className="w-full bg-transparent text-foreground outline-none font-mono disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-muted-foreground">{displayAmountAsset}</span>
          </div>
        </label>

        {/* range */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-foreground">Amount</span>
            <span className="text-primary">{allocation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={allocation}
            onChange={(event) => syncAllocation(Number(event.target.value))}
            style={{
              background: `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${allocation}%, var(--range-slider-rest) ${allocation}%, var(--range-slider-rest) 100%)`,
            }}
            className="range-slider h-2.5 w-full cursor-pointer appearance-none rounded-full"
          />
          <div className="mt-4 grid grid-cols-4 gap-1">
            {QUICK_ALLOCATION_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => syncAllocation(value)}
                className={[
                  "cursor-pointer rounded-lg px-4 py-2 transition-colors",
                  allocation === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ].join(" ")}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground">{summaryLabel}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold leading-none text-foreground text-base">
                {orderSide === "buy" ? summaryValue : `$${summaryValue}`}
              </p>
              <p className="mt-1 text-muted-foreground">{summaryAsset}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4 text-muted-foreground">
            <div className="flex items-start gap-2">
              <Icon name="info" size={14} className="mt-0.5 shrink-0" />
              <p className="text-xs">
                {orderType === "limit"
                  ? `Limit order will execute when price reaches $${formatPrice(orderPrice)}`
                  : "Market order will execute at the best available price"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={showComingSoonToast}
          className={[
            "w-full cursor-pointer rounded-lg p-4 text-base font-semibold transition-colors",
            orderSide === "buy"
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-danger text-danger-foreground hover:bg-danger/90",
          ].join(" ")}
        >
          {orderSide === "buy" ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Estimated fee: ~0.10% • Min order: $10
        </p>
      </div>
    </section>
  );
}

export default memo(OrderPanel);
