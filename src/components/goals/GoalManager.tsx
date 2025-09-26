import React, { useState } from 'react';
import type { Goal } from '../../types/goals';
import { goalStorage } from '../../utils/goals/storage';
import { GoalCreationForm } from './GoalCreationForm';
import { GoalList } from './GoalList';
import { GoalProgressTracker } from './GoalProgressTracker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Target,
  BarChart3,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface GoalManagerProps {
  onClose?: () => void;
  className?: string;
}

export const GoalManager: React.FC<GoalManagerProps> = ({
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'progress'>('list');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null); // Clear any previous errors
      const goal: Goal = {
        ...goalData,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await goalStorage.saveGoal(goal);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to create goal:', error);
      setError('Failed to create goal. Please try again.');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setActiveTab('create');
  };

  const handleViewProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setActiveTab('progress');
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedGoal(null);
    setEditingGoal(null);
    setError(null); // Clear any errors when going back
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {activeTab !== 'list' && (
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-blue-600" />
            Goal Management
          </h1>
          <p className="text-gray-600 mt-1">
            Set, track, and achieve your health and wellness goals
          </p>
        </div>
      </div>
      {onClose && (
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <GoalCreationForm
            onSubmit={handleCreateGoal}
            onCancel={handleBackToList}
            initialData={editingGoal || undefined}
          />
        );

      case 'progress':
        return selectedGoal ? (
          <GoalProgressTracker
            goal={selectedGoal}
            onBack={handleBackToList}
          />
        ) : (
          <div className="text-center py-12">
            <p>No goal selected</p>
            <Button onClick={handleBackToList} className="mt-4">
              Back to Goals
            </Button>
          </div>
        );

      case 'list':
      default:
        return (
          <GoalList
            onCreateGoal={() => setActiveTab('create')}
            onEditGoal={handleEditGoal}
            onViewProgress={handleViewProgress}
          />
        );
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {renderHeader()}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

// Quick Actions Component for Dashboard Integration
interface GoalQuickActionsProps {
  onOpenManager: () => void;
  className?: string;
}

export const GoalQuickActions: React.FC<GoalQuickActionsProps> = ({
  onOpenManager,
  className = ''
}) => {
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    avgProgress: 0
  });

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const goals = await goalStorage.getAllGoals();
      const activeGoals = goals.filter(g => g.status === 'active');
      const completedGoals = goals.filter(g => g.status === 'completed');

      // Calculate average progress
      const totalProgress = goals.reduce((sum, goal) => {
        // Simple progress calculation - could be enhanced
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(goal.startDate).getTime()) / (24 * 60 * 60 * 1000)
        );
        const totalDays = goal.endDate ?
          Math.floor((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (24 * 60 * 60 * 1000)) :
          30;
        return sum + Math.min(100, (daysSinceStart / totalDays) * 100);
      }, 0);

      setStats({
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        avgProgress: goals.length > 0 ? Math.round(totalProgress / goals.length) : 0
      });
    } catch (error) {
      console.error('Failed to load goal stats:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Goals
          </div>
          <Button variant="ghost" size="sm" onClick={onOpenManager}>
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.activeGoals}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.completedGoals}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>

        {stats.totalGoals > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{stats.avgProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={onOpenManager}
          className="w-full"
          variant={stats.totalGoals === 0 ? "default" : "outline"}
        >
          {stats.totalGoals === 0 ? 'Create Your First Goal' : 'Manage Goals'}
        </Button>
      </CardContent>
    </Card>
  );
};
