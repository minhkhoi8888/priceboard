import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap: number | null;
  market_cap_change_percentage_24h: number | null;
  total_volume: number | null;
  circulating_supply: number | null;
}

export interface CoinGeckoGlobalData {
  data: {
    total_market_cap: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

const coinGeckoDemoKey =
  import.meta.env.VITE_COINGECKO_DEMO_API_KEY ?? "CG-rpGcG67iToeQ8BJuCJsvPthS";

export const coinGeckoApi = createApi({
  reducerPath: "coinGeckoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.coingecko.com/api/v3/",
    prepareHeaders: (headers) => {
      if (coinGeckoDemoKey) {
        headers.set("x-cg-demo-api-key", coinGeckoDemoKey);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCoinMarketData: builder.query<CoinGeckoMarketCoin | null, string>({
      query: (coinId) => ({
        url: "coins/markets",
        params: {
          vs_currency: "usd",
          ids: coinId,
          price_change_percentage: "24h",
          precision: "full",
        },
      }),
      transformResponse: (response: CoinGeckoMarketCoin[]) =>
        response[0] ?? null,
    }),
    getGlobalMarketData: builder.query<CoinGeckoGlobalData["data"], void>({
      query: () => ({
        url: "global",
      }),
      transformResponse: (response: CoinGeckoGlobalData) => response.data,
    }),
  }),
});

export const { useGetCoinMarketDataQuery, useGetGlobalMarketDataQuery } =
  coinGeckoApi;
