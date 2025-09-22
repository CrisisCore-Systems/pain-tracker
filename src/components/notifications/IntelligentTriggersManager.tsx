import React from 'react';
import { useIntelligentTriggers, useTriggerManagement } from '../../hooks/useIntelligentTriggers';
import type { IntelligentTrigger, TriggerCondition } from '../../utils/notifications/intelligent';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Settings,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface IntelligentTriggersManagerProps {
  className?: string;
}

export const IntelligentTriggersManager: React.FC<IntelligentTriggersManagerProps> = ({
  className = ''
}) => {
  const {
    triggers,
    isAnalyzing,
    lastAnalysis,
    updateTrigger,
    resetToDefaults,
    getTriggerStats
  } = useIntelligentTriggers();

  const {
    selectedTrigger,
    isEditing,
    showStats,
    selectTrigger,
    startEditing,
    cancelEditing,
    openStats
  } = useTriggerManagement();

  const getTriggerIcon = (type: IntelligentTrigger['type']) => {
    switch (type) {
      case 'pain_reminder':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medication_alert':
        return <Clock className="w-4 h-4" />;
      case 'goal_achievement':
        return <Target className="w-4 h-4" />;
      case 'progress_checkin':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: IntelligentTrigger['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCooldown = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const formatLastTriggered = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Recently';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Intelligent Triggers</h2>
            <p className="text-sm text-gray-600">
              Smart notifications based on your pain patterns and goals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastAnalysis && (
            <span className="text-sm text-gray-500">
              Last analyzed: {lastAnalysis.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-800">Analyzing your data for smart notifications...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggers List */}
      <div className="grid gap-4">
        {triggers.map((trigger) => {
          const stats = getTriggerStats(trigger.id);
          const isSelected = selectedTrigger?.id === trigger.id;

          return (
            <Card
              key={trigger.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => selectTrigger(trigger)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTriggerIcon(trigger.type)}
                    <div>
                      <CardTitle className="text-lg">{trigger.name}</CardTitle>
                      <p className="text-sm text-gray-600">{trigger.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getPriorityColor(trigger.priority)} text-white`}
                    >
                      {trigger.priority}
                    </Badge>
                    <Switch
                      checked={trigger.isActive}
                      onCheckedChange={(checked: boolean) =>
                        updateTrigger(trigger.id, { isActive: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.triggerCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Triggers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCooldown(trigger.cooldownPeriod)}
                    </div>
                    <div className="text-xs text-gray-500">Cooldown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {trigger.maxTriggersPerDay}
                    </div>
                    <div className="text-xs text-gray-500">Max/Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatLastTriggered(stats?.lastTriggered)}
                    </div>
                    <div className="text-xs text-gray-500">Last Trigger</div>
                  </div>
                </div>

                {/* Conditions Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Trigger Conditions:</h4>
                    <div className="flex flex-wrap gap-2">
                    {trigger.conditions.map((condition: TriggerCondition, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {String(condition.type).replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      openStats();
                    }}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      startEditing();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Trigger Details */}
      {selectedTrigger && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTriggerIcon(selectedTrigger.type)}
              {selectedTrigger.name} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showStats ? (
              <TriggerStatsView trigger={selectedTrigger} stats={getTriggerStats(selectedTrigger.id)} />
            ) : isEditing ? (
              <TriggerEditView
                trigger={selectedTrigger}
                onSave={(updates) => {
                  updateTrigger(selectedTrigger.id, updates);
                  cancelEditing();
                }}
                onCancel={cancelEditing}
              />
            ) : (
              <TriggerDetailsView trigger={selectedTrigger} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {triggers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Intelligent Triggers</h3>
            <p className="text-gray-600 mb-4">
              Set up smart notifications that respond to your pain patterns and goals.
            </p>
            <Button onClick={resetToDefaults}>
              Create Default Triggers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Sub-components for detailed views
const TriggerDetailsView: React.FC<{ trigger: IntelligentTrigger }> = ({ trigger }) => (
  <div className="space-y-4">
    <div>
      <h4 className="font-medium mb-2">Description</h4>
      <p className="text-gray-600">{trigger.description}</p>
    </div>

    <div>
      <h4 className="font-medium mb-2">Trigger Conditions</h4>
      <div className="space-y-2">
        {trigger.conditions.map((condition, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Info className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium capitalize">
                {condition.type.replace('_', ' ')}
              </div>
              {condition.threshold && (
                <div className="text-sm text-gray-600">
                  Threshold: {condition.threshold}
                </div>
              )}
              {condition.timeWindow && (
                <div className="text-sm text-gray-600">
                  Time Window: {condition.timeWindow}h
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium mb-2">Settings</h4>
        <div className="space-y-1 text-sm">
          <div>Cooldown: {formatCooldown(trigger.cooldownPeriod)}</div>
          <div>Max per day: {trigger.maxTriggersPerDay}</div>
          <div>Priority: <Badge className={getPriorityColor(trigger.priority)}>{trigger.priority}</Badge></div>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Status</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            {trigger.isActive ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            )}
            {trigger.isActive ? 'Active' : 'Inactive'}
          </div>
          <div>Triggers sent: {trigger.triggerCount}</div>
        </div>
      </div>
    </div>
  </div>
);

const TriggerStatsView: React.FC<{
  trigger: IntelligentTrigger;
  stats: { triggerCount: number; lastTriggered?: string } | null;
}> = ({ trigger, stats }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{stats?.triggerCount || 0}</div>
        <div className="text-sm text-gray-600">Total Triggers</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {stats?.lastTriggered ? formatLastTriggered(stats.lastTriggered) : 'Never'}
        </div>
        <div className="text-sm text-gray-600">Last Triggered</div>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">
          {Math.round((trigger.triggerCount / Math.max(1, trigger.maxTriggersPerDay)) * 100)}%
        </div>
        <div className="text-sm text-gray-600">Daily Usage</div>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-2">Performance</h4>
      <Progress
        value={(trigger.triggerCount / Math.max(1, trigger.maxTriggersPerDay * 7)) * 100}
        className="mb-2"
      />
      <p className="text-sm text-gray-600">
        {trigger.triggerCount} triggers sent this week
      </p>
    </div>
  </div>
);

const TriggerEditView: React.FC<{
  trigger: IntelligentTrigger;
  onSave: (updates: Partial<IntelligentTrigger>) => void;
  onCancel: () => void;
}> = ({ trigger, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    isActive: trigger.isActive,
    cooldownPeriod: trigger.cooldownPeriod,
    maxTriggersPerDay: trigger.maxTriggersPerDay,
    priority: trigger.priority
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Active</label>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as IntelligentTrigger['priority'] }))}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cooldown (minutes)</label>
          <input
            type="number"
            value={formData.cooldownPeriod}
            onChange={(e) => setFormData(prev => ({ ...prev, cooldownPeriod: parseInt(e.target.value) }))}
            className="w-full p-2 border rounded"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max per Day</label>
          <input
            type="number"
            value={formData.maxTriggersPerDay}
            onChange={(e) => setFormData(prev => ({ ...prev, maxTriggersPerDay: parseInt(e.target.value) }))}
            className="w-full p-2 border rounded"
            min="1"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// Helper function (defined outside component for reuse)
const formatCooldown = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
};

const formatLastTriggered = (dateString?: string) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'Recently';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const getPriorityColor = (priority: IntelligentTrigger['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};
