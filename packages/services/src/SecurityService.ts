// Copied from src/services/SecurityService.ts (trimmed for package)
export class SecurityService {
  async performSecurityAudit() { return { passed: true, score: 1, issues: [], recommendations: [], lastAudit: new Date() }; }
}

export const securityService = new SecurityService();
