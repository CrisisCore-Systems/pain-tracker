export type NotificationType =
  | 'pain_reminder'
  | 'medication_alert'
  | 'appointment_reminder'
  | 'goal_achievement'
  | 'progress_checkin'
  | 'data_backup'
  | 'system_update'
  | 'custom';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'dismissed' | 'archived';

export type DeliveryMethod = 'browser' | 'in_app' | 'email' | 'sms';

export interface NotificationTrigger {
  type: 'time_based' | 'event_based' | 'pattern_based';
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    dayOfMonth?: number;
  };
  conditions?: {
    painThreshold?: number;
    medicationDue?: boolean;
    appointmentWithinHours?: number;
    goalProgress?: number;
  };
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: NotificationPriority;
  category: string;
  isSystemGenerated: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  deliveryMethods: DeliveryMethod[];
  trigger?: NotificationTrigger;
  scheduledFor?: string; // ISO date string
  sentAt?: string; // ISO date string
  readAt?: string; // ISO date string
  dismissedAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  deliveryMethods: {
    browser: boolean;
    in_app: boolean;
    email: boolean;
    sms: boolean;
  };
  categories: {
    pain_reminders: boolean;
    medication_alerts: boolean;
    appointment_reminders: boolean;
    goal_achievements: boolean;
    progress_checkins: boolean;
    system_updates: boolean;
    custom: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  frequencyLimits: {
    maxPerDay: number;
    maxPerHour: number;
  };
}

export interface NotificationSchedule {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  trigger: NotificationTrigger;
  template: NotificationTemplate;
  isActive: boolean;
  lastTriggered?: string;
  nextTrigger?: string;
  createdAt: string;
  updatedAt: string;
}

// Default notification templates
export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'pain_reminder',
    type: 'pain_reminder',
    title: 'Daily Check-in',
    message:
      "How are you holding up today? Take a quick moment to log your pain and how you're coping — it helps the app give kinder, more useful insights.",
    actionLabel: 'Check In',
    actionUrl: '/track',
    priority: 'medium',
    category: 'health',
    isSystemGenerated: true,
  },
  {
    id: 'medication_reminder',
    type: 'medication_alert',
    title: 'Medication Time',
    message:
      "It's time to take your {{medication_name}}. Remember to track how it's working for you.",
    actionLabel: 'Log Medication',
    actionUrl: '/medications',
    priority: 'high',
    category: 'medication',
    isSystemGenerated: true,
  },
  {
    id: 'appointment_reminder',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message:
      "You have an appointment with {{provider_name}} in {{hours_until}} hours. Don't forget to prepare any questions.",
    actionLabel: 'View Details',
    actionUrl: '/appointments',
    priority: 'high',
    category: 'appointments',
    isSystemGenerated: true,
  },
  {
    id: 'goal_achievement',
    type: 'goal_achievement',
    title: 'Goal Achievement! 🎉',
    message:
      "Congratulations! You've reached your goal of {{goal_description}}. You're doing amazing work.",
    actionLabel: 'View Progress',
    actionUrl: '/goals',
    priority: 'medium',
    category: 'goals',
    isSystemGenerated: true,
  },
  {
    id: 'weekly_progress',
    type: 'progress_checkin',
    title: 'Weekly Check-in',
    message:
      "It's been a week — a quick moment to reflect on your pain and wellbeing can surface useful patterns. How has this week been for you?",
    actionLabel: 'Review Week',
    actionUrl: '/analytics',
    priority: 'low',
    category: 'progress',
    isSystemGenerated: true,
  },
  {
    id: 'data_backup',
    type: 'data_backup',
    title: 'Data Backup Reminder',
    message:
      "It's been {{days_since_backup}} days since your last data backup. Keep your health data safe.",
    actionLabel: 'Backup Data',
    actionUrl: '/settings/backup',
    priority: 'low',
    category: 'system',
    isSystemGenerated: true,
  },
];

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  deliveryMethods: {
    browser: true,
    in_app: true,
    email: false,
    sms: false,
  },
  categories: {
    pain_reminders: true,
    medication_alerts: true,
    appointment_reminders: true,
    goal_achievements: true,
    progress_checkins: true,
    system_updates: false,
    custom: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  frequencyLimits: {
    maxPerDay: 10,
    maxPerHour: 3,
  },
};
