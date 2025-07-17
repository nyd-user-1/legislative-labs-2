
import { useState, useEffect, useRef } from 'react';

interface UseEnhancedDebounceOptions {
  delay: number;
  enableCaching?: boolean;
  cacheSize?: number;
}

export function useEnhancedDebounce<T>(
  value: T, 
  options: UseEnhancedDebounceOptions
): T {
  const { delay, enableCaching = false, cacheSize = 50 } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cacheRef = useRef<Map<string, T>>(new Map());

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check cache first if enabled
    if (enableCaching) {
      const cacheKey = String(value);
      if (cacheRef.current.has(cacheKey)) {
        setDebouncedValue(cacheRef.current.get(cacheKey)!);
        return;
      }
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      
      // Cache the result if enabled
      if (enableCaching) {
        const cache = cacheRef.current;
        const cacheKey = String(value);
        
        // Manage cache size
        if (cache.size >= cacheSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        
        cache.set(cacheKey, value);
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, enableCaching, cacheSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
}
