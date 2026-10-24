'use client';

import { useEffect, useRef } from 'react';

interface AdPlacementProps {
  placement: 'header' | 'in_content' | 'after_content' | 'sidebar';
  adCode?: string | null;
  adsEnabled?: boolean;
  className?: string;
}

export default function AdPlacement({
  placement,
  adCode,
  adsEnabled = false,
  className = '',
}: AdPlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only execute if ads are globally enabled and this slot has a valid snippet
    if (!adsEnabled || !adCode || !adCode.trim() || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    // Create a safe range to parse external script tags without breaking React hydration
    try {
      const range = document.createRange();
      range.selectNode(container);
      const documentFragment = range.createContextualFragment(adCode);
      container.appendChild(documentFragment);
    } catch {
      // Avoid runtime crash if invalid code was provided in admin
    }
  }, [adCode, adsEnabled]);

  // If ads are disabled or no code is provided, reserve zero space or unobtrusive placeholder in admin
  if (!adsEnabled || !adCode || !adCode.trim()) {
    return null;
  }

  // Pre-allocated height to prevent Cumulative Layout Shift (CLS)
  const minHeightMap: Record<string, string> = {
    header: 'min-h-[90px]',
    in_content: 'min-h-[250px]',
    after_content: 'min-h-[250px]',
    sidebar: 'min-h-[300px]',
  };

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 flex flex-col items-center justify-center overflow-hidden rounded border border-stone-100 bg-stone-50/50 p-2 text-center text-xs text-stone-400 ${
        minHeightMap[placement] || 'min-h-[100px]'
      } ${className}`}
    >
      <span className="mb-1 text-[10px] tracking-wider uppercase text-stone-400">
        Advertisement
      </span>
      <div ref={containerRef} className="w-full flex justify-center items-center" />
    </aside>
  );
}
