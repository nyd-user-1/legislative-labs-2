
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3 } from 'lucide-react';
import { PerformanceDashboard } from './PerformanceDashboard';
import { PerformanceComparison } from './PerformanceComparison';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceToggleProps {
  isDevelopment?: boolean;
}

export const PerformanceToggle: React.FC<PerformanceToggleProps> = ({ 
  isDevelopment = process.env.NODE_ENV === 'development' 
}) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { metrics } = usePerformanceMonitor();

  // Only show in development mode
  if (!isDevelopment) return null;

  const getTotalApiCalls = () => {
    return Object.values(metrics.apiResponseTimes).reduce(
      (total, times) => total + times.length, 
      0
    );
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Load:</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {formatTime(metrics.pageLoadTime)}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">APIs:</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {getTotalApiCalls()}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">FCP:</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {formatTime(metrics.firstContentfulPaint)}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Search:</span>
              <Badge variant="outline" className="ml-1 text-xs">
                {metrics.searchQueryTimes.length}
              </Badge>
            </div>
          </div>

          <div className="flex gap-1">
            <Button 
              onClick={() => setShowDashboard(true)}
              size="sm" 
              variant="outline"
              className="flex-1 text-xs"
            >
              <Activity className="w-3 h-3 mr-1" />
              Dashboard
            </Button>
            <Button 
              onClick={() => setShowComparison(true)}
              size="sm" 
              variant="outline"
              className="flex-1 text-xs"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Compare
            </Button>
          </div>
        </div>
      </div>

      <PerformanceDashboard
        isVisible={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      <PerformanceComparison
        currentMetrics={metrics}
        isVisible={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
};
