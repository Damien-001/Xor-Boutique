import { useState, useEffect } from 'react';

/**
 * Custom Hook: useLiveViewers
 * Generates an organic, live dynamic viewer counter for products,
 * and tracks total persistent product views.
 */
export function useLiveViewers(productId) {
  const [liveViewers, setLiveViewers] = useState(12);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (!productId) return;

    // Deterministic base count from productId (between 6 and 21 viewers)
    const strId = String(productId);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
      hash = (hash << 5) - hash + strId.charCodeAt(i);
      hash |= 0;
    }
    const baseCount = 6 + (Math.abs(hash) % 16);
    setLiveViewers(baseCount);

    // Track total persistent views
    const storageKey = `damshop_views_${productId}`;
    const stored = localStorage.getItem(storageKey);
    let currentTotal = stored ? Number(stored) : (baseCount * 14 + (Math.abs(hash) % 45));
    currentTotal += 1;
    try {
      localStorage.setItem(storageKey, currentTotal);
    } catch (e) {}
    setTotalViews(currentTotal);

    // Organic periodic fluctuation (every 6 to 11 seconds)
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = Math.max(3, Math.min(baseCount + 9, prev + delta));
        return next;
      });
    }, 6000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [productId]);

  return { liveViewers, totalViews };
}
