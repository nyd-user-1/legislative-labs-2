
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Database, Cpu, BarChart3, Trash2 } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isVisible, 
  onClose 
}) => {
  const { metrics, clearMetrics, getWebVitals } = usePerformanceMonitor();
  const [webVitals, setWebVitals] = useState<any>({});

  useEffect(() => {
    if (isVisible) {
      getWebVitals().then(setWebVitals);
    }
  }, [isVisible, getWebVitals]);

  if (!isVisible) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getAverageTime = (times: number[]) => {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const getPerformanceRating = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; fair: number }> = {
      fcp: { good: 1800, fair: 3000 },
      lcp: { good: 2500, fair: 4000 },
      ttfb: { good: 800, fair: 1800 },
      cls: { good: 0.1, fair: 0.25 },
      fid: { good: 100, fair: 300 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.fair) return 'fair';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Performance Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={clearMetrics} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Metrics
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Page Load</p>
                        <p className="text-2xl font-bold">{formatTime(metrics.pageLoadTime)}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">API Calls</p>
                        <p className="text-2xl font-bold">
                          {Object.keys(metrics.apiResponseTimes).length}
                        </p>
                      </div>
                      <Database className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Components</p>
                        <p className="text-2xl font-bold">
                          {Object.keys(metrics.componentRenderTimes).length}
                        </p>
                      </div>
                      <Cpu className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Memory Usage</p>
                        <p className="text-2xl font-bold">
                          {metrics.memoryUsage.length > 0 
                            ? formatBytes(metrics.memoryUsage[metrics.memoryUsage.length - 1].used)
                            : '0 MB'
                          }
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Web Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle>Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">First Contentful Paint</span>
                        <Badge className={getRatingColor(getPerformanceRating('fcp', metrics.firstContentfulPaint))}>
                          {getPerformanceRating('fcp', metrics.firstContentfulPaint)}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold">{formatTime(metrics.firstContentfulPaint)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Largest Contentful Paint</span>
                        <Badge className={getRatingColor(getPerformanceRating('lcp', metrics.largestContentfulPaint))}>
                          {getPerformanceRating('lcp', metrics.largestContentfulPaint)}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold">{formatTime(metrics.largestContentfulPaint)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time to First Byte</span>
                        <Badge className={getRatingColor(getPerformanceRating('ttfb', metrics.timeToFirstByte))}>
                          {getPerformanceRating('ttfb', metrics.timeToFirstByte)}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold">{formatTime(metrics.timeToFirstByte)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loading" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Search Time</p>
                      <p className="text-xl font-bold">
                        {formatTime(getAverageTime(metrics.searchQueryTimes))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Searches</p>
                      <p className="text-xl font-bold">{metrics.searchQueryTimes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Fetching</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(metrics.dataFetchingDurations).map(([operation, times]) => (
                      <div key={operation} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{operation}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatTime(getAverageTime(times))}</p>
                          <p className="text-xs text-muted-foreground">{times.length} calls</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(metrics.apiResponseTimes).map(([endpoint, times]) => (
                      <div key={endpoint} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{endpoint}</span>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatTime(getAverageTime(times))}</p>
                            <p className="text-xs text-muted-foreground">{times.length} calls</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((getAverageTime(times) / 2000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Component Render Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(metrics.componentRenderTimes).map(([component, times]) => (
                      <div key={component} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{component}</span>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatTime(getAverageTime(times))}</p>
                            <p className="text-xs text-muted-foreground">{times.length} renders</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((getAverageTime(times) / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.memoryUsage.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Current</p>
                          <p className="text-lg font-bold">
                            {formatBytes(metrics.memoryUsage[metrics.memoryUsage.length - 1].used)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Available</p>
                          <p className="text-lg font-bold">
                            {formatBytes(metrics.memoryUsage[metrics.memoryUsage.length - 1].total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Usage %</p>
                          <p className="text-lg font-bold">
                            {(
                              (metrics.memoryUsage[metrics.memoryUsage.length - 1].used / 
                               metrics.memoryUsage[metrics.memoryUsage.length - 1].total) * 100
                            ).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={
                          (metrics.memoryUsage[metrics.memoryUsage.length - 1].used / 
                           metrics.memoryUsage[metrics.memoryUsage.length - 1].total) * 100
                        } 
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No memory data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
