export class HealthcareOAuthProvider {
  async createAuthorizationUrl(_req: unknown) { return 'https://auth.example/authorize'; }
  async exchangeCodeForToken(_req: unknown) { return { accessToken: 'at', tokenType: 'Bearer', expiresIn: 3600, scope: '' }; }
  async validateAccessToken(_token: string) { return null; }
  async introspectToken(_token: string) { return { active: false }; }
  async getUserInfo(_token: string) { return null; }
  async getJWKS() { return { keys: [] }; }
}

export const healthcareOAuthProvider = new HealthcareOAuthProvider();
