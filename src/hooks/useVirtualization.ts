import { useState, useCallback } from 'react';

interface UseVirtualizationProps {
  totalItems: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UseVirtualizationReturn {
  visibleRange: { start: number; end: number };
  visibleItems: number[];
  containerStyle: React.CSSProperties;
  totalHeight: number;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const useVirtualization = ({
  totalItems,
  itemHeight,
  containerHeight,
  overscan = 2
}: UseVirtualizationProps): UseVirtualizationReturn => {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = totalItems * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleRange = { start: startIndex, end: endIndex };
  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  );

  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative'
  };

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    visibleItems,
    containerStyle,
    totalHeight,
    handleScroll
  };
};
