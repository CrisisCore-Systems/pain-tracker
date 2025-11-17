import type { NotificationSchedule, Notification } from '../../types/notifications';
import { notificationStorage } from './storage';
import { browserNotificationManager } from './browser';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../../types/notifications';

export interface ScheduledNotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Start the scheduler
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Notification scheduler started');

    // Schedule existing notifications
    this.scheduleExistingNotifications();

    // Set up periodic check every minute
    setInterval(() => {
      this.checkAndTriggerNotifications();
    }, 60000); // Check every minute
  }

  // Stop the scheduler
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    // Clear all active timeouts
    for (const timeout of this.activeTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.activeTimeouts.clear();

    console.log('Notification scheduler stopped');
  }

  // Schedule a notification
  async scheduleNotification(schedule: NotificationSchedule): Promise<void> {
    try {
      await notificationStorage.saveSchedule(schedule);
      this.scheduleNotificationTimeout(schedule);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  // Cancel a scheduled notification
  async cancelScheduledNotification(scheduleId: string): Promise<void> {
    try {
      // Clear timeout if exists
      const timeout = this.activeTimeouts.get(scheduleId);
      if (timeout) {
        clearTimeout(timeout);
        this.activeTimeouts.delete(scheduleId);
      }

      // Remove from storage
      await notificationStorage.deleteSchedule(scheduleId);
    } catch (error) {
      console.error('Failed to cancel scheduled notification:', error);
      throw new Error('Failed to cancel scheduled notification');
    }
  }

  // Get next trigger time for a schedule
  getNextTriggerTime(schedule: NotificationSchedule): Date | null {
    const now = new Date();
    const trigger = schedule.trigger;

    if (trigger.type === 'time_based' && trigger.schedule) {
      const scheduleConfig = trigger.schedule;

      if (scheduleConfig.frequency === 'once') {
        // For one-time notifications, return null if already triggered
        if (schedule.lastTriggered) return null;
        return new Date(scheduleConfig.time || now.toISOString());
      }

      if (scheduleConfig.frequency === 'daily') {
        return this.getNextDailyTrigger(now, scheduleConfig.time);
      }

      if (scheduleConfig.frequency === 'weekly') {
        return this.getNextWeeklyTrigger(now, scheduleConfig.daysOfWeek, scheduleConfig.time);
      }

      if (scheduleConfig.frequency === 'monthly') {
        return this.getNextMonthlyTrigger(now, scheduleConfig.dayOfMonth, scheduleConfig.time);
      }
    }

    return null;
  }

  // Check and trigger due notifications
  private async checkAndTriggerNotifications(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const schedules = await notificationStorage.getAllSchedules();
      const now = new Date();

      for (const schedule of schedules) {
        if (!schedule.isActive) continue;

        const nextTrigger = this.getNextTriggerTime(schedule);
        if (!nextTrigger) continue;

        // Check if it's time to trigger
        if (nextTrigger <= now) {
          await this.triggerNotification(schedule);
        }
      }
    } catch (error) {
      console.error('Failed to check and trigger notifications:', error);
    }
  }

  // Trigger a notification
  private async triggerNotification(
    schedule: NotificationSchedule
  ): Promise<ScheduledNotificationResult> {
    try {
      // Create notification from template
      const notification: Omit<Notification, 'id'> = {
        userId: 'current-user', // In a real app, this would be the actual user ID
        type: schedule.type,
        title: schedule.template.title,
        message: schedule.template.message,
        priority: schedule.template.priority,
        status: 'sent',
        deliveryMethods: ['in_app'], // Default to in-app, can be expanded
        scheduledFor: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        metadata: {
          scheduleId: schedule.id,
          templateId: schedule.template.id,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generate ID and save
      const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullNotification: Notification = { ...notification, id: notificationId };

      await notificationStorage.saveNotification(fullNotification);

      // Update schedule's last triggered time
      const updatedSchedule: NotificationSchedule = {
        ...schedule,
        lastTriggered: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await notificationStorage.saveSchedule(updatedSchedule);

      // Reschedule for next occurrence
      this.scheduleNotificationTimeout(updatedSchedule);

      // Show browser notification if supported and enabled
      if (
        browserNotificationManager.isSupported() &&
        browserNotificationManager.getPermission() === 'granted'
      ) {
        await browserNotificationManager.showFromNotification(fullNotification);
      }

      return { success: true, notificationId };
    } catch (error) {
      console.error('Failed to trigger notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Schedule timeout for next trigger
  private scheduleNotificationTimeout(schedule: NotificationSchedule): void {
    const nextTrigger = this.getNextTriggerTime(schedule);
    if (!nextTrigger) return;

    const now = new Date();
    const delay = nextTrigger.getTime() - now.getTime();

    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.triggerNotification(schedule);
      }, delay);

      this.activeTimeouts.set(schedule.id, timeout);
    }
  }

  // Schedule all existing notifications
  private async scheduleExistingNotifications(): Promise<void> {
    try {
      const schedules = await notificationStorage.getAllSchedules();

      for (const schedule of schedules) {
        if (schedule.isActive) {
          this.scheduleNotificationTimeout(schedule);
        }
      }
    } catch (error) {
      console.error('Failed to schedule existing notifications:', error);
    }
  }

  // Helper methods for calculating next trigger times
  private getNextDailyTrigger(now: Date, timeString?: string): Date {
    const targetTime = timeString ? this.parseTimeString(timeString) : { hours: 9, minutes: 0 };
    const nextTrigger = new Date(now);
    nextTrigger.setHours(targetTime.hours, targetTime.minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextTrigger <= now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }

    return nextTrigger;
  }

  private getNextWeeklyTrigger(now: Date, daysOfWeek?: number[], timeString?: string): Date {
    if (!daysOfWeek || daysOfWeek.length === 0) {
      return this.getNextDailyTrigger(now, timeString);
    }

    const targetTime = timeString ? this.parseTimeString(timeString) : { hours: 9, minutes: 0 };
    const nextTrigger = new Date(now);
    const currentDay = now.getDay(); // 0 = Sunday

    // Find the next day of the week
    let nextDay = daysOfWeek.find(day => day > currentDay);
    if (nextDay === undefined) {
      // No more days this week, get the first day next week
      nextDay = Math.min(...daysOfWeek);
      nextTrigger.setDate(nextTrigger.getDate() + (7 - currentDay + nextDay));
    } else {
      nextTrigger.setDate(nextTrigger.getDate() + (nextDay - currentDay));
    }

    nextTrigger.setHours(targetTime.hours, targetTime.minutes, 0, 0);
    return nextTrigger;
  }

  private getNextMonthlyTrigger(now: Date, dayOfMonth?: number, timeString?: string): Date {
    const targetTime = timeString ? this.parseTimeString(timeString) : { hours: 9, minutes: 0 };
    const nextTrigger = new Date(now);

    if (dayOfMonth) {
      nextTrigger.setDate(dayOfMonth);
      nextTrigger.setHours(targetTime.hours, targetTime.minutes, 0, 0);

      // If the date has already passed this month, schedule for next month
      if (nextTrigger <= now) {
        nextTrigger.setMonth(nextTrigger.getMonth() + 1);
      }
    } else {
      // Default to first day of next month
      nextTrigger.setMonth(nextTrigger.getMonth() + 1, 1);
      nextTrigger.setHours(targetTime.hours, targetTime.minutes, 0, 0);
    }

    return nextTrigger;
  }

  private parseTimeString(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return {
      hours: isNaN(hours) ? 9 : hours,
      minutes: isNaN(minutes) ? 0 : minutes,
    };
  }

  // Create common scheduled notifications
  async createDailyPainReminder(time: string = '09:00'): Promise<NotificationSchedule> {
    const schedule: NotificationSchedule = {
      id: `daily_pain_reminder_${Date.now()}`,
      name: 'Daily Pain Check-in',
      description: 'Daily reminder to track your pain levels',
      type: 'pain_reminder',
      trigger: {
        type: 'time_based',
        schedule: {
          frequency: 'daily',
          time: time,
        },
      },
      template: DEFAULT_NOTIFICATION_TEMPLATES.find(t => t.type === 'pain_reminder')!,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.scheduleNotification(schedule);
    return schedule;
  }

  async createMedicationReminder(
    medicationName: string,
    times: string[]
  ): Promise<NotificationSchedule[]> {
    const schedules: NotificationSchedule[] = [];

    for (const time of times) {
      const schedule: NotificationSchedule = {
        id: `medication_${medicationName}_${time}_${Date.now()}`,
        name: `Medication: ${medicationName}`,
        description: `Reminder to take ${medicationName}`,
        type: 'medication_alert',
        trigger: {
          type: 'time_based',
          schedule: {
            frequency: 'daily',
            time: time,
          },
        },
        template: {
          ...DEFAULT_NOTIFICATION_TEMPLATES.find(t => t.type === 'medication_alert')!,
          message: DEFAULT_NOTIFICATION_TEMPLATES.find(
            t => t.type === 'medication_alert'
          )!.message.replace('{{medication_name}}', medicationName),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.scheduleNotification(schedule);
      schedules.push(schedule);
    }

    return schedules;
  }

  async createWeeklyProgressCheckin(
    dayOfWeek: number = 1,
    time: string = '09:00'
  ): Promise<NotificationSchedule> {
    const schedule: NotificationSchedule = {
      id: `weekly_progress_${Date.now()}`,
      name: 'Weekly Progress Check-in',
      description: 'Weekly reminder to review your progress',
      type: 'progress_checkin',
      trigger: {
        type: 'time_based',
        schedule: {
          frequency: 'weekly',
          daysOfWeek: [dayOfWeek],
          time: time,
        },
      },
      template: DEFAULT_NOTIFICATION_TEMPLATES.find(t => t.type === 'progress_checkin')!,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.scheduleNotification(schedule);
    return schedule;
  }

  // Get scheduler status
  getStatus(): {
    isRunning: boolean;
    activeSchedules: number;
    nextTriggers: Array<{ scheduleId: string; nextTrigger: Date | null }>;
  } {
    const nextTriggers = Array.from(this.activeTimeouts.keys()).map(scheduleId => ({
      scheduleId,
      nextTrigger: null, // Would need to calculate this properly
    }));

    return {
      isRunning: this.isRunning,
      activeSchedules: this.activeTimeouts.size,
      nextTriggers,
    };
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();

// Utility functions for common scheduling patterns
export const scheduleCommonNotifications = async (): Promise<void> => {
  try {
    // Schedule daily pain reminder
    await notificationScheduler.createDailyPainReminder('09:00');

    // Schedule weekly progress check-in (Monday at 9 AM)
    await notificationScheduler.createWeeklyProgressCheckin(1, '09:00');

    console.log('Common notifications scheduled successfully');
  } catch (error) {
    console.error('Failed to schedule common notifications:', error);
  }
};

export const startNotificationScheduler = (): void => {
  notificationScheduler.start();
};

export const stopNotificationScheduler = (): void => {
  notificationScheduler.stop();
};
