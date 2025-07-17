
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Save, RotateCcw } from 'lucide-react';
import { PerformanceMetrics } from '@/hooks/usePerformanceMonitor';

interface PerformanceComparisonProps {
  currentMetrics: PerformanceMetrics;
  isVisible: boolean;
  onClose: () => void;
}

interface BaselineMetrics {
  timestamp: number;
  metrics: PerformanceMetrics;
  label: string;
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  currentMetrics,
  isVisible,
  onClose,
}) => {
  const [baselines, setBaselines] = useState<BaselineMetrics[]>([]);
  const [selectedBaseline, setSelectedBaseline] = useState<BaselineMetrics | null>(null);

  // Load baselines from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('performance-baselines');
    if (stored) {
      try {
        setBaselines(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load performance baselines:', error);
      }
    }
  }, []);

  // Save baselines to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('performance-baselines', JSON.stringify(baselines));
  }, [baselines]);

  const saveBaseline = (label: string) => {
    const newBaseline: BaselineMetrics = {
      timestamp: Date.now(),
      metrics: { ...currentMetrics },
      label,
    };

    setBaselines(prev => [...prev, newBaseline].slice(-10)); // Keep last 10 baselines
  };

  const calculateImprovement = (current: number, baseline: number): {
    percentage: number;
    trend: 'up' | 'down' | 'same';
    color: string;
  } => {
    if (baseline === 0) return { percentage: 0, trend: 'same', color: 'text-gray-500' };
    
    const improvement = ((baseline - current) / baseline) * 100;
    
    if (Math.abs(improvement) < 1) {
      return { percentage: improvement, trend: 'same', color: 'text-gray-500' };
    }
    
    return {
      percentage: improvement,
      trend: improvement > 0 ? 'up' : 'down',
      color: improvement > 0 ? 'text-green-600' : 'text-red-600',
    };
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getAverageTime = (times: number[]) => {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Performance Comparison</h2>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => saveBaseline(`Baseline ${baselines.length + 1}`)}
              variant="outline" 
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current as Baseline
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          {baselines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No baseline metrics saved yet. Save current performance as a baseline to start comparing.
              </p>
              <Button onClick={() => saveBaseline('Initial Baseline')}>
                <Save className="w-4 h-4 mr-2" />
                Save Initial Baseline
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Baseline Selection */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Select Baseline for Comparison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {baselines.map((baseline, index) => (
                    <Button
                      key={index}
                      variant={selectedBaseline === baseline ? "default" : "outline"}
                      onClick={() => setSelectedBaseline(baseline)}
                      className="justify-start"
                    >
                      <div className="text-left">
                        <p className="font-medium">{baseline.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(baseline.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedBaseline && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Comparison with {selectedBaseline.label}
                    </h3>
                    <Button 
                      onClick={() => setSelectedBaseline(null)} 
                      variant="ghost" 
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>

                  {/* Core Web Vitals Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Core Web Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { 
                            label: 'Page Load Time', 
                            current: currentMetrics.pageLoadTime, 
                            baseline: selectedBaseline.metrics.pageLoadTime 
                          },
                          { 
                            label: 'First Contentful Paint', 
                            current: currentMetrics.firstContentfulPaint, 
                            baseline: selectedBaseline.metrics.firstContentfulPaint 
                          },
                          { 
                            label: 'Largest Contentful Paint', 
                            current: currentMetrics.largestContentfulPaint, 
                            baseline: selectedBaseline.metrics.largestContentfulPaint 
                          },
                        ].map((metric) => {
                          const improvement = calculateImprovement(metric.current, metric.baseline);
                          return (
                            <div key={metric.label} className="space-y-2">
                              <h4 className="text-sm font-medium">{metric.label}</h4>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold">{formatTime(metric.current)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    vs {formatTime(metric.baseline)}
                                  </p>
                                </div>
                                <div className={`flex items-center gap-1 ${improvement.color}`}>
                                  {renderTrendIcon(improvement.trend)}
                                  <span className="text-sm font-medium">
                                    {improvement.percentage > 0 ? '+' : ''}
                                    {improvement.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* API Performance Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>API Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.keys(currentMetrics.apiResponseTimes).map((endpoint) => {
                          const currentAvg = getAverageTime(currentMetrics.apiResponseTimes[endpoint] || []);
                          const baselineAvg = getAverageTime(selectedBaseline.metrics.apiResponseTimes[endpoint] || []);
                          const improvement = calculateImprovement(currentAvg, baselineAvg);

                          return (
                            <div key={endpoint} className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{endpoint}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(currentAvg)} (was {formatTime(baselineAvg)})
                                </p>
                              </div>
                              <div className={`flex items-center gap-1 ${improvement.color}`}>
                                {renderTrendIcon(improvement.trend)}
                                <span className="text-sm font-medium">
                                  {improvement.percentage > 0 ? '+' : ''}
                                  {improvement.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search Performance Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(() => {
                          const currentAvg = getAverageTime(currentMetrics.searchQueryTimes);
                          const baselineAvg = getAverageTime(selectedBaseline.metrics.searchQueryTimes);
                          const improvement = calculateImprovement(currentAvg, baselineAvg);

                          return (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Average Search Time</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(currentAvg)} (was {formatTime(baselineAvg)})
                                </p>
                              </div>
                              <div className={`flex items-center gap-1 ${improvement.color}`}>
                                {renderTrendIcon(improvement.trend)}
                                <span className="text-sm font-medium">
                                  {improvement.percentage > 0 ? '+' : ''}
                                  {improvement.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
