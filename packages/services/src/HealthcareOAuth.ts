export class HealthcareOAuthProvider {
  async createAuthorizationUrl(_req: any) { return 'https://auth.example/authorize'; }
  async exchangeCodeForToken(_req: any) { return { accessToken: 'at', tokenType: 'Bearer', expiresIn: 3600, scope: '' }; }
  async validateAccessToken(_token: string) { return null; }
  async introspectToken(_token: string) { return { active: false }; }
  async getUserInfo(_token: string) { return null; }
  async getJWKS() { return { keys: [] }; }
}

export const healthcareOAuthProvider = new HealthcareOAuthProvider();
