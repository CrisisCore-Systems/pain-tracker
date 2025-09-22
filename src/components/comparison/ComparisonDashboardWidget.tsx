import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { TimePeriodComparisonComponent } from './TimePeriodComparison';
import { TreatmentComparison } from './TreatmentComparison';
import { ConditionComparison } from './ConditionComparison';
import type { PainEntry } from '../../types';
import type { ComparisonResult } from '../../types/comparison';
import {
  BarChart3,
  Calendar,
  Pill,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';

interface ComparisonDashboardWidgetProps {
  painEntries: PainEntry[];
  className?: string;
}

const COMPARISON_TYPES = [
  {
    id: 'time-period',
    label: 'Time Periods',
    description: 'Compare pain levels across different time periods',
    icon: Calendar,
  component: TimePeriodComparisonComponent,
  },
  {
    id: 'treatment',
    label: 'Treatments',
    description: 'Compare pain levels before and after treatments',
    icon: Pill,
    component: TreatmentComparison,
  },
  {
    id: 'condition',
    label: 'Conditions',
    description: 'Compare pain patterns across different conditions',
    icon: AlertTriangle,
    component: ConditionComparison,
  },
];

export const ComparisonDashboardWidget: React.FC<ComparisonDashboardWidgetProps> = ({
  painEntries,
  className,
}) => {
  const [activeComparison, setActiveComparison] = useState<string>('time-period');
  const [recentComparisons, setRecentComparisons] = useState<Array<{
    id: string;
    type: string;
    title: string;
    timestamp: Date;
    insights: number;
  }>>([]);

  const handleComparisonComplete = (result: ComparisonResult, type: string) => {
    // Add to recent comparisons
    const newComparison = {
      id: Date.now().toString(),
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Comparison`,
      timestamp: new Date(),
      insights: result.insights?.length || 0,
    };

    setRecentComparisons(prev => [newComparison, ...prev.slice(0, 4)]); // Keep last 5
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Data Comparison</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Compare your pain data across different dimensions to identify patterns and insights
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid w-full grid-cols-3 gap-2">
            {COMPARISON_TYPES.map((type) => {
              const Icon = type.icon;
              const active = activeComparison === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveComparison(type.id)}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-md border ${active ? 'border-primary text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time period comparison uses 'entries' prop; others use painEntries per their definitions */}
          {activeComparison === 'time-period' && (
            <div className="mt-6">
            <TimePeriodComparisonComponent
              entries={painEntries}
              onComparisonComplete={(result: ComparisonResult) => handleComparisonComplete(result, 'time-period')}
            />
            </div>
          )}

          {activeComparison === 'treatment' && (
            <div className="mt-6">
            <TreatmentComparison
              entries={painEntries}
            />
            </div>
          )}

          {activeComparison === 'condition' && (
            <div className="mt-6">
            <ConditionComparison
              entries={painEntries}
            />
            </div>
          )}
        </div>

        {/* Recent Comparisons Summary */}
        {recentComparisons.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Comparisons</span>
            </h4>
            <div className="space-y-3">
              {recentComparisons.map((comparison) => (
                <Card key={comparison.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {comparison.type === 'time-period' && <Calendar className="h-4 w-4 text-blue-600" />}
                        {comparison.type === 'treatment' && <Pill className="h-4 w-4 text-green-600" />}
                        {comparison.type === 'condition' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                        <span className="font-medium">{comparison.title}</span>
                      </div>
                      {comparison.insights > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {comparison.insights} insights
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {comparison.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{painEntries.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Comparisons Made</p>
                <p className="text-2xl font-bold">{recentComparisons.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Insights Generated</p>
                <p className="text-2xl font-bold">
                  {recentComparisons.reduce((sum, comp) => sum + comp.insights, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
