export const MAX_FAILED_UNLOCK_ATTEMPTS = 3;

// Bounded restoration window for kill-switch-triggered wipes.
// Cancellation is only possible via a successful vault unlock.
export const PENDING_WIPE_WINDOW_MS = 10_000;
