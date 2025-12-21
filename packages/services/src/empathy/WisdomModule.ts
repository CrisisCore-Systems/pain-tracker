export class WisdomModule {
  summarize(_entries: unknown[]) { return { insights: [] }; }
}

export const wisdomModule = new WisdomModule();
