import { useState } from "react";

import OrderBookPanel from "./OrderBookPanel";
import RecentTradesPanel from "./RecentTradesPanel";

type MarketDepthTab = "orderBook" | "recentTrades";

function MobileDepthTabs() {
  const [activeTab, setActiveTab] = useState<MarketDepthTab>("orderBook");

  return (
    <div className="grid gap-3 xl:hidden">
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setActiveTab("orderBook")}
          className={[
            "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            activeTab === "orderBook"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ")}
        >
          Order Book
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recentTrades")}
          className={[
            "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            activeTab === "recentTrades"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ")}
        >
          Recent Trades
        </button>
      </div>

      {activeTab === "orderBook" ? <OrderBookPanel /> : <RecentTradesPanel />}
    </div>
  );
}

export default MobileDepthTabs;
