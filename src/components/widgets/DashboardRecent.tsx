import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Clock, CheckCircle, Activity, AlertTriangle, Zap } from 'lucide-react';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { getPainLevelColor } from '../../design-system/utils/chart-colors';

function getActivityIcon(pain: number) {
  if (pain <= 2) return <CheckCircle className="h-4 w-4 text-destructive-foreground" />;
  if (pain <= 5) return <Activity className="h-4 w-4 text-accent-foreground" />;
  if (pain <= 8) return <AlertTriangle className="h-4 w-4 text-accent-foreground" />;
  return <Zap className="h-4 w-4 text-destructive-foreground" />;
}

export function DashboardRecent({ entries }: { entries: PainEntry[] }) {
  const recent = entries.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0,5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><Clock className="h-5 w-5" /><span>Recent Activity</span></CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length > 0 ? (
          <div className="space-y-4">
            {recent.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(item.baselineData.pain)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Pain Level: {item.baselineData.pain}/10</span>
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getPainLevelColor(item.baselineData.pain))}>
                        {item.baselineData.pain <= 2 ? 'Mild' : item.baselineData.pain <= 5 ? 'Moderate' : item.baselineData.pain <= 8 ? 'Severe' : 'Extreme'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Your recent pain entries will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DashboardRecent;
