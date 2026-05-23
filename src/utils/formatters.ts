const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const wholeNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

interface FormatPriceOptions {
  maxSmallFractionDigits?: number;
}

export const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(value);

export const formatCompactNumber = (value: number) =>
  compactCurrencyFormatter.format(value);

export const formatWholeNumber = (value: number) =>
  wholeNumberFormatter.format(value);

export const formatPrice = (
  value: number,
  options: FormatPriceOptions = {},
) => {
  const { maxSmallFractionDigits = 5 } = options;

  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (value >= 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxSmallFractionDigits,
  });
};

export const formatPercent = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export const formatTradeTime = (value: number) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const formatMarketPair = (symbol: string) =>
  `${symbol.replace("USDT", "")}/USD`;

export const formatMarketCode = (symbol: string) =>
  symbol.replace("USDT", "USD");
