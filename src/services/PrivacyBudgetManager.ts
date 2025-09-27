export interface PrivacyBudgetRecord {
  userId: string;
  epsilonRemaining: number;
}

export class PrivacyBudgetManager {
  private budgets = new Map<string, number>();

  constructor(private defaultEpsilon = 1.0) {}

  getRemaining(userId: string): number {
    return this.budgets.get(userId) ?? this.defaultEpsilon;
  }

  consume(userId: string, epsilon: number): boolean {
    const remaining = this.getRemaining(userId);
    if (epsilon <= 0) return true; // nothing to consume
    if (remaining < epsilon) return false; // not enough budget
    this.budgets.set(userId, remaining - epsilon);
    return true;
  }

  reset(userId: string, epsilon?: number) {
    this.budgets.set(userId, epsilon ?? this.defaultEpsilon);
  }

  // For testing/inspection
  dump(): PrivacyBudgetRecord[] {
    return Array.from(this.budgets.entries()).map(([userId, epsilonRemaining]) => ({ userId, epsilonRemaining }));
  }
}

export function createPrivacyBudgetManager(defaultEpsilon = 1.0) {
  return new PrivacyBudgetManager(defaultEpsilon);
}
