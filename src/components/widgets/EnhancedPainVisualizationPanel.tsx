import { useState } from 'react';
import { BarChart3, Map, Brain, TrendingUp } from 'lucide-react';
import type { PainEntry } from '../../types';
import { PainChart } from '../pain-tracker/PainChart';
import { InteractiveBodyMap } from '../body-mapping/InteractiveBodyMap';
import { PainAnalyticsPanel } from '../analytics/PainAnalyticsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '../../design-system';

interface EnhancedPainVisualizationPanelProps {
  entries: PainEntry[];
}

type VisualizationType = 'chart' | 'bodymap' | 'analytics';

export function EnhancedPainVisualizationPanel({ entries }: EnhancedPainVisualizationPanelProps) {
  const [activeView, setActiveView] = useState<VisualizationType>('chart');

  const visualizationOptions = [
    {
      id: 'chart' as const,
      name: 'Trend Chart',
      icon: BarChart3,
      description: 'Pain levels over time'
    },
    {
      id: 'bodymap' as const,
      name: 'Body Map',
      icon: Map,
      description: 'Pain location heatmap'
    },
    {
      id: 'analytics' as const,
      name: 'AI Insights',
      icon: Brain,
      description: 'Predictive analysis'
    }
  ];

  return (
    <Card className="xl:col-span-1" data-walkthrough="pain-visualization">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Advanced Pain Visualization</span>
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your pain patterns and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visualization Type Selector */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted rounded-lg">
          {visualizationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={activeView === option.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView(option.id)}
                className="flex-1 min-w-fit"
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{option.name}</span>
                <span className="sm:hidden">{option.name.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>

        {/* Visualization Content */}
        <div className="min-h-[400px]">
          {activeView === 'chart' && (
            <div>
              <PainChart entries={entries} />
              {entries.length >= 5 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Insights:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Average Pain Level: {calculateAveragePain(entries)}</p>
                    <p>• Total Entries: {entries.length}</p>
                    <p>• Tracking Period: {calculateTrackingPeriod(entries)} days</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'bodymap' && (
            <div>
              <InteractiveBodyMap
                entries={entries}
                mode="heatmap"
                className="mb-4"
              />
              {entries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Record pain entries to see location heatmap</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="max-h-[500px] overflow-y-auto pr-2">
              <PainAnalyticsPanel entries={entries} />
            </div>
          )}
        </div>

        {/* Data Summary Bar */}
        {entries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-muted">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {entries.length}
                </div>
                <div className="text-xs text-muted-foreground">Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {calculateAveragePain(entries)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Pain</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {getUniqueLocations(entries)}
                </div>
                <div className="text-xs text-muted-foreground">Locations</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function calculateAveragePain(entries: PainEntry[]): string {
  if (entries.length === 0) return '0.0';
  const sum = entries.reduce((acc, entry) => acc + entry.baselineData.pain, 0);
  return (sum / entries.length).toFixed(1);
}

function calculateTrackingPeriod(entries: PainEntry[]): number {
  if (entries.length === 0) return 0;
  
  const dates = entries.map(entry => new Date(entry.timestamp));
  const earliest = Math.min(...dates.map(d => d.getTime()));
  const latest = Math.max(...dates.map(d => d.getTime()));
  
  return Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24)) + 1;
}

function getUniqueLocations(entries: PainEntry[]): number {
  const locations = new Set<string>();
  entries.forEach(entry => {
    entry.baselineData.locations.forEach(location => {
      locations.add(location);
    });
  });
  return locations.size;
}