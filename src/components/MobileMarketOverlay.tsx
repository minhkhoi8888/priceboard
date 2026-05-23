import { useEffect } from "react";

import { Icon } from "./Icon";
import MarketSection from "./MarketSection";
import { selectMarkets } from "../store/slices/marketSlice";

interface MobileMarketOverlayProps {
  featuredSymbols: Set<string>;
  isOpen: boolean;
  markets: ReturnType<typeof selectMarkets>;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  onToggleFeatured: (symbol: string) => void;
  selectedSymbol: string;
}

function MobileMarketOverlay({
  featuredSymbols,
  isOpen,
  markets,
  onClose,
  onSelectSymbol,
  onToggleFeatured,
  selectedSymbol,
}: MobileMarketOverlayProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  return (
    <div
      className={[
        "fixed inset-0 z-[60] xl:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close markets overlay"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-background/96 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div
        className={[
          "relative flex h-full flex-col bg-background px-4 pb-6 pt-4 text-foreground transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close market"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-foreground"
        >
          <Icon name="close" size={18} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto pt-10">
          <MarketSection
            featuredSymbols={featuredSymbols}
            markets={markets}
            onSelectSymbol={(symbol) => {
              onSelectSymbol(symbol);
              onClose();
            }}
            onToggleFeatured={onToggleFeatured}
            selectedSymbol={selectedSymbol}
          />
        </div>
      </div>
    </div>
  );
}

export default MobileMarketOverlay;
