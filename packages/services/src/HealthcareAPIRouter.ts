export class HealthcareAPIRouter {
  async handleFHIRRequest(_req: unknown) { return { success: true }; }
  async handleProviderRequest(_req: unknown) { return { success: true }; }
  async handleDataSharingRequest(_req: unknown) { return { success: true }; }
  async handleOAuthRequest(_req: unknown) { return { success: true }; }
  async route(_req: unknown) { return { success: true }; }
}

export const healthcareAPIRouter = new HealthcareAPIRouter();

export const API_DOCUMENTATION = { version: '1.0.0' };
