
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width: number | string;
  renderItem: ({ index, style, data }: { 
    index: number; 
    style: React.CSSProperties; 
    data: T[] 
  }) => React.ReactElement;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  width,
  renderItem,
  className = ""
}: VirtualizedListProps<T>) {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => items, [items]);

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
      >
        {renderItem}
      </List>
    </div>
  );
}
