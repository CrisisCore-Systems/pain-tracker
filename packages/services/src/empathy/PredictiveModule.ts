export class PredictiveModule {
  predict(_entries: unknown[]) { return { prediction: null }; }
}

export const predictiveModule = new PredictiveModule();
