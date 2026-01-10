import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { useEnergyStore } from '../../stores/energy-store';
import { bayesianService, PredictionContext, FlareRiskPrediction } from '../../services/BayesianInferenceService';
import { differenceInHours, parseISO, format } from 'date-fns';
import { Brain, AlertTriangle } from 'lucide-react';

export const FlareForecastWidget: React.FC = () => {
  const { entries } = usePainTrackerStore();
  const history = useEnergyStore((state) => state.history);
  const settings = useEnergyStore((state) => state.settings);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBudget = history[today];
  const consumed = todayBudget?.transactions.reduce((acc, t) => acc + t.cost, 0) || 0;
  const dailyBudget = todayBudget?.capacity || settings.defaultDailyCapacity;

  const prediction: FlareRiskPrediction = useMemo(() => {
    // 1. Get recent sleep from last entry
    const lastEntry = entries[entries.length - 1];
    const recentSleepQuality = lastEntry?.qualityOfLife?.sleepQuality ?? 
                               (typeof lastEntry?.sleep === 'number' ? lastEntry.sleep : 5); // Default to neutral

    // 2. Estimate "Load/Strain"
    // Ideally this comes from historical activity data. 
    // Proxy: If using > 80% of energy budget, strain is high.
    const currentStrain = (consumed / dailyBudget) * 100;

    // 3. Triggers
    const activeTriggers = lastEntry?.triggers ?? [];

    const context: PredictionContext = {
      recentSleepQuality,
      yesterdayStrain: currentStrain, // Using current accum strain for immediate forecast
      hoursSinceLastEntry: lastEntry ? differenceInHours(new Date(), parseISO(lastEntry.timestamp)) : 24,
      triggersPresent: activeTriggers,
      // Weather context would be injected here if available
    };

    return bayesianService.predictFlareRisk(context, entries);
  }, [entries, consumed, dailyBudget]);

  const riskyTriggers = useMemo(() => {
    return bayesianService.detectTriggerCorrelations(entries);
  }, [entries]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'imminent': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 dark:bg-green-900/30';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'imminent': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <Card className="h-full border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden">
      {/* Background decoration for 'Local Intelligence' theme */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Brain size={100} />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-500" />
          <span>Flare Forecast</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            Beta
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          
          {/* Main Risk Indicator */}
          <div className={`p-4 rounded-lg flex items-center justify-between ${getRiskBg(prediction.riskLevel)}`}>
            <div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Current Risk</p>
              <h3 className={`text-2xl font-bold capitalize ${getRiskColor(prediction.riskLevel)}`}>
                {prediction.riskLevel}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black opacity-20">
                {Math.round(prediction.probability * 100)}%
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          {prediction.contributingFactors.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Contributing Factors</p>
              <ul className="space-y-1">
                {prediction.contributingFactors.map((f, i) => (
                  <li 
                    key={i}
                    className="text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span>{f.factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No significant risk factors detected based on recent logs.
            </div>
          )}
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>
              Confidence: {Math.round(prediction.confidence * 100)}% 
              {prediction.confidence < 0.2 && " (Need more logs)"}
            </p>
          </div>

          {/* Trigger Detective Section */}
          {riskyTriggers.length > 0 && (
             <div className="pt-2 border-t border-dashed">
                <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Trigger Detective
                </p>
                <div className="flex flex-wrap gap-2">
                  {riskyTriggers.map(t => (
                    <span key={t.trigger} className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900">
                       {t.trigger}: {t.risk.toFixed(1)}x Risk
                    </span>
                  ))}
                </div>
             </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
};
