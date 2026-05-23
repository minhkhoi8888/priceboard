import { useEffect, useRef, useState } from "react";

interface SmoothLoadingOptions {
  delayMs?: number;
  minVisibleMs?: number;
}

const DEFAULT_DELAY_MS = 120;
const DEFAULT_MIN_VISIBLE_MS = 240;

export const useSmoothLoading = (
  isLoading: boolean,
  options: SmoothLoadingOptions = {},
) => {
  const {
    delayMs = DEFAULT_DELAY_MS,
    minVisibleMs = DEFAULT_MIN_VISIBLE_MS,
  } = options;
  const [isVisible, setIsVisible] = useState(isLoading && delayMs === 0);
  const visibleAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    clearTimers();

    if (isLoading && delayMs === 0 && isVisible && visibleAtRef.current === null) {
      visibleAtRef.current = Date.now();
    }

    if (isLoading) {
      if (isVisible) {
        return clearTimers;
      }

      showTimerRef.current = window.setTimeout(() => {
        visibleAtRef.current = Date.now();
        setIsVisible(true);
        showTimerRef.current = null;
      }, delayMs);

      return clearTimers;
    }

    if (!isVisible) {
      return clearTimers;
    }

    const visibleFor = visibleAtRef.current
      ? Date.now() - visibleAtRef.current
      : minVisibleMs;
    const remainingVisibleTime = Math.max(minVisibleMs - visibleFor, 0);

    hideTimerRef.current = window.setTimeout(() => {
      visibleAtRef.current = null;
      setIsVisible(false);
      hideTimerRef.current = null;
    }, remainingVisibleTime);

    return clearTimers;
  }, [delayMs, isLoading, isVisible, minVisibleMs]);

  return isVisible;
};
