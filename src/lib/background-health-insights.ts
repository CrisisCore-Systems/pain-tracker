/**
 * Background Health Insights Service
 * Manages web workers for health pattern analysis and insights generation
 */

import type { PainEntry } from '../types';

// Re-export worker types
export interface HealthInsight {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: {
    values?: number[];
    labels?: string[];
    correlations?: Array<{
      factor1: string;
      factor2: string;
      strength: number;
      significance: number;
    }>;
    predictions?: Array<{
      date: string;
      value: number;
      confidence: number;
    }>;
    recommendations?: Array<{
      action: string;
      rationale: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  };
  generatedAt: string;
  validUntil?: string;
  traumaInformed: boolean;
  actionable: boolean;
  metadata: {
    basedOnEntries: number;
    timeframeDays: number;
    algorithm: string;
    version: string;
  };
}

interface HealthInsightTask {
  id: string;
  type: 'pattern-analysis' | 'trend-detection' | 'correlation-analysis' | 'anomaly-detection' | 'prediction' | 'summary-generation';
  data: {
    entries: PainEntry[];
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    context?: {
      userPreferences?: Record<string, unknown>;
      previousInsights?: HealthInsight[];
      currentDate?: string;
    };
  };
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface InsightSubscriber {
  id: string;
  callback: (insights: HealthInsight[]) => void;
  filters?: {
    types?: HealthInsight['type'][];
    minConfidence?: number;
    maxAge?: number; // hours
  };
}

interface ProcessingStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  lastProcessed: string | null;
  queueSize: number;
}

export class BackgroundHealthInsightsService {
  private static instance: BackgroundHealthInsightsService;
  private workers: Worker[] = [];
  private workerCount: number = Math.min(4, navigator.hardwareConcurrency || 2);
  private taskQueue: HealthInsightTask[] = [];
  private activeTasks: Map<string, { workerId: number; startTime: number }> = new Map();
  private insights: Map<string, HealthInsight> = new Map();
  private subscribers: Map<string, InsightSubscriber> = new Map();
  private processingStats: ProcessingStats = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageProcessingTime: 0,
    lastProcessed: null,
    queueSize: 0
  };
  private isInitialized: boolean = false;
  private readonly maxQueueSize = 50;
  private readonly maxInsightAge = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.initialize();
  }

  static getInstance(): BackgroundHealthInsightsService {
    if (!BackgroundHealthInsightsService.instance) {
      BackgroundHealthInsightsService.instance = new BackgroundHealthInsightsService();
    }
    return BackgroundHealthInsightsService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize workers
      for (let i = 0; i < this.workerCount; i++) {
        await this.createWorker(i);
      }

      // Start background processing
      this.startBackgroundProcessing();
      
      // Clean up old insights periodically
      setInterval(() => this.cleanupOldInsights(), 60 * 60 * 1000); // Every hour

      this.isInitialized = true;
      console.log(`BackgroundHealthInsights: Initialized with ${this.workerCount} workers`);
    } catch (error) {
      console.error('Failed to initialize health insights service:', error);
    }
  }

  private async createWorker(workerId: number): Promise<void> {
    try {
      // Create worker from the worker file
      const worker = new Worker(new URL('../workers/health-insights-worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (e) => this.handleWorkerMessage(workerId, e);
      worker.onerror = (error) => this.handleWorkerError(workerId, error);

      this.workers[workerId] = worker;
    } catch (error) {
      console.error(`Failed to create worker ${workerId}:`, error);
      // Fallback: reduce worker count if we can't create all workers
      this.workerCount = Math.max(1, workerId);
    }
  }

  private handleWorkerMessage(workerId: number, event: MessageEvent): void {
    const { type, taskId, data, error, progress } = event.data;

    switch (type) {
      case 'result':
        this.handleTaskCompletion(taskId, data as HealthInsight[], workerId);
        break;
      
      case 'error':
        this.handleTaskError(taskId, error, workerId);
        break;
      
      case 'progress':
        // Could emit progress events to UI if needed
        console.debug(`Task ${taskId} progress: ${progress}%`);
        break;
    }
  }

  private handleWorkerError(workerId: number, error: ErrorEvent): void {
    console.error(`Worker ${workerId} error:`, error);
    
    // Restart the worker
    this.workers[workerId].terminate();
    this.createWorker(workerId);
  }

  private handleTaskCompletion(taskId: string, insights: HealthInsight[], workerId: number): void {
    const taskInfo = this.activeTasks.get(taskId);
    if (!taskInfo) {
      console.warn(`Received result for unknown task: ${taskId}`);
      return;
    }

    // Update processing stats
    const processingTime = Date.now() - taskInfo.startTime;
    this.processingStats.completedTasks++;
    this.processingStats.averageProcessingTime = 
      (this.processingStats.averageProcessingTime * (this.processingStats.completedTasks - 1) + processingTime) / 
      this.processingStats.completedTasks;
    this.processingStats.lastProcessed = new Date().toISOString();

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });

    // Notify subscribers
    this.notifySubscribers(insights);

    // Remove from active tasks
    this.activeTasks.delete(taskId);

    // Process next task in queue
    this.processNextTask(workerId);

    console.log(`Task ${taskId} completed by worker ${workerId}, generated ${insights.length} insights`);
  }

  private handleTaskError(taskId: string, error: string, workerId: number): void {
    console.error(`Task ${taskId} failed on worker ${workerId}:`, error);
    
    this.processingStats.failedTasks++;
    this.activeTasks.delete(taskId);
    
    // Process next task
    this.processNextTask(workerId);
  }

  private startBackgroundProcessing(): void {
    // Process tasks on all available workers
    for (let i = 0; i < this.workers.length; i++) {
      this.processNextTask(i);
    }
  }

  private processNextTask(workerId: number): void {
    if (!this.workers[workerId] || this.taskQueue.length === 0) {
      return;
    }

    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    // Track active task
    this.activeTasks.set(task.id, {
      workerId,
      startTime: Date.now()
    });

    this.processingStats.queueSize = this.taskQueue.length;

    // Send task to worker
    this.workers[workerId].postMessage({
      type: 'task',
      taskId: task.id,
      data: task
    });

    console.log(`Dispatched task ${task.id} to worker ${workerId}`);
  }

  public async analyzePatterns(
    entries: PainEntry[], 
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const taskId = crypto.randomUUID();
    const task: HealthInsightTask = {
      id: taskId,
      type: 'pattern-analysis',
      data: {
        entries,
        timeframe,
        context: {
          currentDate: new Date().toISOString()
        }
      },
      priority,
      timestamp: new Date().toISOString()
    };

    return this.queueTask(task);
  }

  public async detectTrends(
    entries: PainEntry[],
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const taskId = crypto.randomUUID();
    const task: HealthInsightTask = {
      id: taskId,
      type: 'trend-detection',
      data: {
        entries,
        timeframe
      },
      priority,
      timestamp: new Date().toISOString()
    };

    return this.queueTask(task);
  }

  public async analyzeCorrelations(
    entries: PainEntry[],
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const taskId = crypto.randomUUID();
    const task: HealthInsightTask = {
      id: taskId,
      type: 'correlation-analysis',
      data: {
        entries
      },
      priority,
      timestamp: new Date().toISOString()
    };

    return this.queueTask(task);
  }

  private queueTask(task: HealthInsightTask): string {
    if (this.taskQueue.length >= this.maxQueueSize) {
      // Remove oldest low-priority task to make room
      const lowPriorityIndex = this.taskQueue.findIndex(t => t.priority === 'low');
      if (lowPriorityIndex !== -1) {
        this.taskQueue.splice(lowPriorityIndex, 1);
      } else {
        throw new Error('Task queue is full');
      }
    }

    this.taskQueue.push(task);
    this.processingStats.totalTasks++;
    this.processingStats.queueSize = this.taskQueue.length;

    // Try to process immediately if workers are available
    const availableWorker = this.findAvailableWorker();
    if (availableWorker !== -1) {
      this.processNextTask(availableWorker);
    }

    return task.id;
  }

  private findAvailableWorker(): number {
    for (let i = 0; i < this.workers.length; i++) {
      const isWorkerBusy = Array.from(this.activeTasks.values()).some(task => task.workerId === i);
      if (!isWorkerBusy) {
        return i;
      }
    }
    return -1;
  }

  private async waitForInitialization(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    while (!this.isInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.isInitialized) {
      throw new Error('Health insights service failed to initialize');
    }
  }

  // Subscription management
  public subscribe(
    callback: (insights: HealthInsight[]) => void,
    filters?: InsightSubscriber['filters']
  ): string {
    const subscriberId = crypto.randomUUID();
    this.subscribers.set(subscriberId, {
      id: subscriberId,
      callback,
      filters
    });
    
    // Send existing insights that match filters
    const existingInsights = this.getInsights(filters);
    if (existingInsights.length > 0) {
      callback(existingInsights);
    }
    
    return subscriberId;
  }

  public unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  private notifySubscribers(newInsights: HealthInsight[]): void {
    for (const subscriber of this.subscribers.values()) {
      const filteredInsights = this.filterInsights(newInsights, subscriber.filters);
      if (filteredInsights.length > 0) {
        try {
          subscriber.callback(filteredInsights);
        } catch (error) {
          console.error(`Error notifying subscriber ${subscriber.id}:`, error);
        }
      }
    }
  }

  private filterInsights(insights: HealthInsight[], filters?: InsightSubscriber['filters']): HealthInsight[] {
    if (!filters) {
      return insights;
    }

    return insights.filter(insight => {
      // Type filter
      if (filters.types && !filters.types.includes(insight.type)) {
        return false;
      }

      // Confidence filter
      if (filters.minConfidence && insight.confidence < filters.minConfidence) {
        return false;
      }

      // Age filter
      if (filters.maxAge) {
        const ageHours = (Date.now() - new Date(insight.generatedAt).getTime()) / (1000 * 60 * 60);
        if (ageHours > filters.maxAge) {
          return false;
        }
      }

      return true;
    });
  }

  // Public API methods
  public getInsights(filters?: InsightSubscriber['filters']): HealthInsight[] {
    const allInsights = Array.from(this.insights.values());
    return this.filterInsights(allInsights, filters);
  }

  public getInsight(id: string): HealthInsight | null {
    return this.insights.get(id) || null;
  }

  public getProcessingStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  public clearInsights(): void {
    this.insights.clear();
  }

  private cleanupOldInsights(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, insight] of this.insights.entries()) {
      const age = now - new Date(insight.generatedAt).getTime();
      if (age > this.maxInsightAge) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => this.insights.delete(id));
    
    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} old insights`);
    }
  }

  // Emergency processing for critical insights
  public async processUrgent(entries: PainEntry[]): Promise<HealthInsight[]> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    // Process immediately without queuing for urgent cases (e.g., severe pain patterns)
    const taskId = await this.analyzePatterns(entries, 'week', 'high');
    
    // Wait for completion (with timeout)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Urgent processing timeout'));
      }, 30000); // 30 seconds timeout

      const checkCompletion = () => {
        if (!this.activeTasks.has(taskId)) {
          clearTimeout(timeout);
          const insights = this.getInsights({ minConfidence: 70 });
          resolve(insights);
        } else {
          setTimeout(checkCompletion, 500);
        }
      };

      checkCompletion();
    });
  }

  // Terminate all workers when shutting down
  public terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.isInitialized = false;
  }
}

// Export a lazy getter for the singleton instance to avoid side-effects at module import time.
// Creating workers (which uses new URL(..., import.meta.url)) during module import can cause
// test runners and bundlers to receive URL objects unexpectedly. Make initialization
// happen on first use instead.
let _healthInsightsInstance: BackgroundHealthInsightsService | null = null;
export function getHealthInsightsService(): BackgroundHealthInsightsService {
  if (!_healthInsightsInstance) {
    _healthInsightsInstance = BackgroundHealthInsightsService.getInstance();
  }
  return _healthInsightsInstance;
}

// Helper function for UI components
export function getInsightIcon(type: HealthInsight['type']): string {
  const iconMap = {
    'pattern': '📊',
    'trend': '📈',
    'correlation': '🔗',
    'anomaly': '⚠️',
    'prediction': '🔮',
    'recommendation': '💡'
  };
  return iconMap[type] || '📋';
}

export function getInsightColor(severity: HealthInsight['severity']): string {
  const colorMap = {
    'critical': 'text-red-600 bg-red-50',
    'high': 'text-orange-600 bg-orange-50',
    'medium': 'text-blue-600 bg-blue-50',
    'low': 'text-gray-600 bg-gray-50'
  };
  return colorMap[severity];
}

export function formatConfidence(confidence: number): string {
  if (confidence >= 90) return 'Very High';
  if (confidence >= 70) return 'High';
  if (confidence >= 50) return 'Medium';
  if (confidence >= 30) return 'Low';
  return 'Very Low';
}
