import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Clock, CheckCircle, Activity, AlertTriangle, Zap } from 'lucide-react';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';

function getPainLevelColor(pain: number) {
  if (pain <= 2) return 'text-green-600 bg-green-50';
  if (pain <= 5) return 'text-yellow-600 bg-yellow-50';
  if (pain <= 8) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

function getActivityIcon(pain: number) {
  if (pain <= 2) return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (pain <= 5) return <Activity className="h-4 w-4 text-yellow-600" />;
  if (pain <= 8) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  return <Zap className="h-4 w-4 text-red-600" />;
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
