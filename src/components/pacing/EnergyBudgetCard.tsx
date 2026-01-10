import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useEnergyStore } from '../../stores/energy-store';
import { Battery, Zap, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '../../design-system/utils';
import { format } from 'date-fns';
import { EnergyLogModal } from './EnergyLogModal';

function ProgressBar({ value, className, indicatorClassName }: { value: number, className?: string, indicatorClassName?: string }) {
    return (
        <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary", className)}>
             <div 
                className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} 
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
             />
        </div>
    );
}

export function EnergyBudgetCard({ className }: { className?: string }) {
  const [showLogModal, setShowLogModal] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const historyItem = useEnergyStore((state) => state.history[today]);
  const defaultCapacity = useEnergyStore((state) => state.settings.defaultDailyCapacity);
  const settings = useEnergyStore((state) => state.settings);

  const budget = historyItem || {
      date: today,
      capacity: defaultCapacity,
      transactions: []
  };

  // Calculate stats
  const used = budget.transactions
    .filter(t => t.cost > 0)
    .reduce((sum, t) => sum + t.cost, 0);
    
  const restored = budget.transactions
    .filter(t => t.cost < 0)
    .reduce((sum, t) => sum + Math.abs(t.cost), 0);

  const netUsed = used - restored;
  const remaining = budget.capacity - netUsed;
  const percentUsed = Math.min(100, Math.max(0, (netUsed / budget.capacity) * 100));
  
  const isOverLimit = netUsed > budget.capacity;
  const isWarning = !isOverLimit && percentUsed >= (settings.alertThreshold * 100);

  return (
    <Card className={cn("w-full relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
                <Battery className={cn("h-5 w-5", isOverLimit ? "text-destructive" : "text-primary")} />
                <span>Daily Energy</span>
            </CardTitle>
            <span className={cn(
                "text-2xl font-bold font-mono",
                isOverLimit ? "text-destructive" : "text-foreground"
            )}>
                {remaining.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ {budget.capacity}</span>
            </span>
        </div>
      </CardHeader>
      <CardContent>
         <div className="space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Used: {used.toFixed(1)}</span>
                    {restored > 0 && <span className="text-green-600">Restored: +{restored.toFixed(1)}</span>}
                </div>
                <ProgressBar 
                    value={percentUsed} 
                    className={cn("h-3", isOverLimit ? "bg-destructive/20" : "")}
                    indicatorClassName={cn(
                        isOverLimit ? "bg-destructive" : 
                        isWarning ? "bg-orange-500" : "bg-primary"
                    )}
                />
            </div>
            
            {isOverLimit && (
                <div className="flex items-start gap-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>Energy budget exceeded. Prioritize rest.</p>
                </div>
            )}
            
            {!isOverLimit && isWarning && (
                <div className="flex items-start gap-2 p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>80% capacity used. Slow down.</p>
                </div>
            )}

            <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowLogModal(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Log Activity
            </Button>
         </div>
      </CardContent>

      <EnergyLogModal 
        isOpen={showLogModal} 
        onClose={() => setShowLogModal(false)}
      />
    </Card>
  );
}
