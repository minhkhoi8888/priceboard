import { memo } from "react";

import type { MarketTicker } from "../store/types/marketTypes";
import {
  useGetCoinMarketDataQuery,
  useGetGlobalMarketDataQuery,
} from "../store/api/coinGeckoApi";
import {
  formatCompactCurrency,
  formatCompactNumber,
} from "../utils/formatters";

interface ChartMarketStatsProps {
  market?: MarketTicker;
}

const COINGECKO_IDS_BY_SYMBOL: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  XRP: "ripple",
};

const ChartMarketStats = ({ market }: ChartMarketStatsProps) => {
  const baseAsset = market?.baseAsset ?? "";
  const coinGeckoId = COINGECKO_IDS_BY_SYMBOL[baseAsset];
  const marketCapSymbolKey = baseAsset.toLowerCase();

  const { data: coinData } = useGetCoinMarketDataQuery(coinGeckoId, {
    skip: !coinGeckoId,
    pollingInterval: 60_000,
    refetchOnMountOrArgChange: true,
  });
  const { data: globalData } = useGetGlobalMarketDataQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnMountOrArgChange: true,
  });

  const marketCapValue =
    typeof coinData?.market_cap === "number"
      ? `$${formatCompactNumber(coinData.market_cap)}`
      : "N/A";
  const volumeValue = `$${formatCompactCurrency(market?.quoteVolume ?? 0)}`;
  const supplyValue =
    typeof coinData?.circulating_supply === "number"
      ? formatCompactNumber(coinData.circulating_supply)
      : "N/A";
  const dominanceValue =
    typeof globalData?.market_cap_percentage?.[marketCapSymbolKey] === "number"
      ? `${globalData.market_cap_percentage[marketCapSymbolKey].toFixed(2)}%`
      : "N/A";

  return (
    <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
      <StatCard
        label="Market Cap"
        value={marketCapValue}
        valueTone={marketCapValue === "N/A" ? "muted" : "default"}
      />
      <StatCard label="24h Volume" value={volumeValue} />
      <StatCard
        label="Supply"
        value={supplyValue}
        valueTone={supplyValue === "N/A" ? "muted" : "default"}
      />
      <StatCard
        label="Dominance"
        value={dominanceValue}
        valueTone={dominanceValue === "N/A" ? "muted" : "default"}
      />
    </div>
  );
};

export default memo(ChartMarketStats);

const StatCard = ({
  label,
  value,
  valueTone = "default",
}: {
  label: string;
  value: string;
  valueTone?: "default" | "muted";
}) => {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 md:p-4">
      <p className="text-[11px] text-muted-foreground md:text-sm">{label}</p>
      <p
        className={[
          "mt-1 whitespace-nowrap text-xs font-semibold tabular-nums md:mt-2 md:text-2xl",
          valueTone === "muted" ? "text-muted-foreground" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};
