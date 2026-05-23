import { useEffect, useState } from "react";

import Button from "./Button";
import { Icon } from "./Icon";
import { useTheme } from "../contexts/ThemeProvider";
import { showComingSoonToast } from "../utils/toast";

const navItems = ["Trade", "Markets", "Portfolio", "Earn"] as const;

const Header = () => {
  const [activeTab, setActiveTab] =
    useState<(typeof navItems)[number]>("Trade");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobileMenuOpen]);

  const handleSelectTab = (item: (typeof navItems)[number]) => {
    if (item !== "Trade") {
      showComingSoonToast();
      setIsMobileMenuOpen(false);
      return;
    }

    setActiveTab(item);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative z-50 border-b border-border bg-background px-4 py-4 text-foreground">
      <div className="mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-10">
            <div className="flex items-center gap-3">
              <Icon name="chart" className="text-primary" size={22} />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                Test
              </span>
            </div>

            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => {
                  const isActive = item === activeTab;

                  return (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => handleSelectTab(item)}
                        className={[
                          "cursor-pointer bg-transparent p-0 text-sm font-medium transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              className="h-8 w-8 rounded-lg"
              onClick={toggleTheme}
            >
              <Icon name={isDark ? "sun" : "moon"} size={18} />
            </Button>

            <div className="hidden items-center gap-3 md:flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wallet"
                className="h-8 w-8 rounded-lg"
                onClick={showComingSoonToast}
              >
                <Icon name="wallet" size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log in"
                className="h-8 w-8 rounded-lg"
                onClick={showComingSoonToast}
              >
                <Icon name="login" size={18} />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className="h-8 w-8 rounded-lg md:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <Icon name={isMobileMenuOpen ? "close" : "menu"} size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 md:hidden",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className={[
            "relative flex h-full flex-col bg-background px-4 pb-6 pt-4 text-foreground transition-opacity",
            isMobileMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="chart" className="text-primary" size={22} />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                Test
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              className="h-8 w-8 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon name="close" size={18} />
            </Button>
          </div>

          <nav
            aria-label="Mobile primary navigation"
            className="flex flex-1 items-center justify-center"
          >
            <ul className="grid justify-items-center gap-5 text-center">
              {navItems.map((item) => {
                const isActive = item === activeTab;

                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => handleSelectTab(item)}
                      className={[
                        "bg-transparent py-2 text-center text-2xl font-medium transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      <span>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              className="justify-center lg:justify-start px-0"
              onClick={showComingSoonToast}
            >
              <Icon name="wallet" size={18} />
              <span>Wallet</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="justify-center lg:justify-start px-0"
              onClick={showComingSoonToast}
            >
              <Icon name="login" size={18} />
              <span>Log in</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
