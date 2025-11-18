import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Goal, GoalTemplate, GoalType, GoalPriority } from '../../types/goals';
import { DEFAULT_GOAL_TEMPLATES, GOAL_TYPE_LABELS, GOAL_PRIORITY_LABELS } from '../../types/goals';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Target, Calendar, Award, Plus, X, Star, CheckCircle } from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long'),
  type: z.enum([
    'pain_reduction',
    'frequency_reduction',
    'consistency',
    'medication_adherence',
    'activity_increase',
    'sleep_improvement',
    'mood_tracking',
    'custom',
  ] as const),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  duration: z.number().min(1).max(365),
  targetValue: z.number().min(0),
  targetUnit: z.string().min(1),
  customFrequency: z
    .object({
      interval: z.number().min(1),
      reminderTime: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()),
  motivation: z.string().max(200),
  obstacles: z.array(z.string()),
  strategies: z.array(z.string()),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalCreationFormProps {
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Goal>;
}

export const GoalCreationForm: React.FC<GoalCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [newTag, setNewTag] = useState('');
  const [newObstacle, setNewObstacle] = useState('');
  const [newStrategy, setNewStrategy] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'custom',
      priority: initialData?.priority || 'medium',
      duration: 30,
      targetValue: 0,
      targetUnit: '',
      tags: initialData?.tags || [],
      motivation: initialData?.motivation || '',
      obstacles: initialData?.obstacles || [],
      strategies: initialData?.strategies || [],
    },
  });

  const watchedType = watch('type');
  const watchedTags = watch('tags');
  const watchedObstacles = watch('obstacles');
  const watchedStrategies = watch('strategies');

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate) {
      setValue('title', selectedTemplate.name);
      setValue('description', selectedTemplate.description);
      setValue('type', selectedTemplate.type);
      setValue('duration', selectedTemplate.duration);
      if (selectedTemplate.targets[0]) {
        setValue('targetValue', selectedTemplate.targets[0].targetValue);
        setValue('targetUnit', selectedTemplate.targets[0].unit);
      }
    }
  }, [selectedTemplate, setValue]);

  const handleFormSubmit = (data: GoalFormData) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + data.duration);

    const goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'current-user',
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'active',
      priority: data.priority,
      targets: [
        {
          metric: data.type === 'pain_reduction' ? 'pain_level' : 'custom',
          targetValue: data.targetValue,
          currentValue: 0,
          unit: data.targetUnit,
          comparison: data.type === 'pain_reduction' ? 'percentage_decrease' : 'greater_than',
        },
      ],
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      frequency: 'daily',
      customFrequency: data.customFrequency,
      milestones:
        selectedTemplate?.milestones.map(m => ({
          ...m,
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isCompleted: false,
        })) || [],
      progress: [],
      tags: data.tags,
      isPublic: false,
      motivation: data.motivation,
      obstacles: data.obstacles,
      strategies: data.strategies,
    };

    onSubmit(goal);
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      'tags',
      watchedTags.filter((t: string) => t !== tag)
    );
  };

  const addObstacle = () => {
    if (newObstacle.trim() && !watchedObstacles.includes(newObstacle.trim())) {
      setValue('obstacles', [...watchedObstacles, newObstacle.trim()]);
      setNewObstacle('');
    }
  };

  const removeObstacle = (obstacle: string) => {
    setValue(
      'obstacles',
      watchedObstacles.filter((o: string) => o !== obstacle)
    );
  };

  const addStrategy = () => {
    if (newStrategy.trim() && !watchedStrategies.includes(newStrategy.trim())) {
      setValue('strategies', [...watchedStrategies, newStrategy.trim()]);
      setNewStrategy('');
    }
  };

  const removeStrategy = (strategy: string) => {
    setValue(
      'strategies',
      watchedStrategies.filter((s: string) => s !== strategy)
    );
  };

  const getDifficultyColor = (difficulty: GoalTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create New Goal</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Set meaningful goals to track your progress and stay motivated
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as 'templates' | 'custom')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Use Template</TabsTrigger>
          <TabsTrigger value="custom">Custom Goal</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_GOAL_TEMPLATES.map(template => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {template.duration} days
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4 mr-2" />
                      {template.estimatedSuccess}% success rate
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 mr-2" />
                      {template.milestones.length} milestones
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Selected: {selectedTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Milestones:</h4>
                    <div className="space-y-2">
                      {selectedTemplate.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          {milestone.title} - {milestone.targetValue}
                          {selectedTemplate.targets[0]?.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="e.g., Reduce daily pain by 30%"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="type">Goal Type</Label>
                    <Select
                      value={watchedType}
                      onValueChange={(value: string) => setValue('type', value as GoalType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your goal and what you hope to achieve..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={watch('priority')}
                      onValueChange={(value: string) => setValue('priority', value as GoalPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...register('duration', { valueAsNumber: true })}
                      min="1"
                      max="365"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      {...register('targetValue', { valueAsNumber: true })}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetUnit">Target Unit</Label>
                  <Input
                    id="targetUnit"
                    {...register('targetUnit')}
                    placeholder="e.g., %, points, minutes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      e.key === 'Enter' && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motivation and Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Motivation & Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="motivation">What motivates you to achieve this goal?</Label>
                  <Textarea
                    id="motivation"
                    {...register('motivation')}
                    placeholder="e.g., I want to feel more in control of my health..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Potential Obstacles</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newObstacle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewObstacle(e.target.value)
                      }
                      placeholder="Add an obstacle..."
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        e.key === 'Enter' && (e.preventDefault(), addObstacle())
                      }
                    />
                    <Button type="button" onClick={addObstacle} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedObstacles.map((obstacle: string) => (
                      <Badge
                        key={obstacle}
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        {obstacle}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeObstacle(obstacle)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Strategies to Overcome Challenges</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newStrategy}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewStrategy(e.target.value)
                      }
                      placeholder="Add a strategy..."
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        e.key === 'Enter' && (e.preventDefault(), addStrategy())
                      }
                    />
                    <Button type="button" onClick={addStrategy} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedStrategies.map((strategy: string) => (
                      <Badge key={strategy} variant="default" className="flex items-center gap-1">
                        {strategy}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeStrategy(strategy)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Target className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
