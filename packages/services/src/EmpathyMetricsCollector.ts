export class EmpathyMetricsCollector {
  collect() { return {}; }
}

export function createEmpathyCollector() { return new EmpathyMetricsCollector(); }
