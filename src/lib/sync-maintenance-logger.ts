export class SyncMaintenanceLogger {
  localOnlyNoDestination(): void {
    console.info('BackgroundSync: Sync disabled: No authorized destination.');
  }

  localOnlyQueueCleared(count: number): void {
    console.info(
      `BackgroundSync: Sync disabled: No authorized destination. Cleared ${count} queued items.`
    );
  }

  localOnlyQueueClearFailed(error: unknown): void {
    console.error('BackgroundSync: Failed to clear disabled sync queue:', error);
  }

  localOnlyQueueAttemptBlocked(): void {
    console.warn('BackgroundSync: Sync disabled: No authorized destination.');
  }
}
