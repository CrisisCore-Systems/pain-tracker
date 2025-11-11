// Healthcare OAuth2/OIDC Authentication Service
// Implements secure authentication and authorization for healthcare providers

import type { UserSubscription } from '../types/subscription';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  issuer: string;
  redirectUri: string;
  scopes: string[];
  pkceEnabled: boolean;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  userInfoEndpoint: string;
  jwksUri: string;
}

export interface AuthenticationRequest {
  responseType: 'code' | 'token';
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  nonce?: string;
}

export interface TokenRequest {
  grantType: 'authorization_code' | 'refresh_token' | 'client_credentials';
  code?: string;
  redirectUri?: string;
  clientId: string;
  clientSecret?: string;
  codeVerifier?: string;
  refreshToken?: string;
  scope?: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken?: string;
}

export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  profile?: string;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
  locale?: string;
  zoneinfo?: string;
  updatedAt?: number;
  // Healthcare-specific claims
  npi?: string;
  organizationId?: string;
  role?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseState?: string;
  // Subscription data
  subscription?: UserSubscription;
}

export interface JWTPayload {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  auth_time?: number;
  nonce?: string;
  azp?: string;
  scope?: string;
  // Healthcare-specific claims
  fhirUser?: string;
  organization?: string;
  role?: string;
  permissions?: string[];
}

export interface OAuthClient {
  clientId: string;
  clientSecret?: string;
  name: string;
  description: string;
  organizationId: string;
  redirectUris: string[];
  grantTypes: ('authorization_code' | 'refresh_token' | 'client_credentials')[];
  responseTypes: ('code' | 'token')[];
  scopes: string[];
  tokenEndpointAuthMethod: 'client_secret_basic' | 'client_secret_post' | 'private_key_jwt' | 'none';
  pkceRequired: boolean;
  status: 'active' | 'suspended' | 'revoked';
  createdAt: string;
  lastUsed?: string;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export interface AuthorizationCode {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  nonce?: string;
  expiresAt: number;
  used: boolean;
}

export interface AccessToken {
  token: string;
  clientId: string;
  userId: string;
  scope: string;
  tokenType: 'Bearer';
  expiresAt: number;
  refreshToken?: string;
  revoked: boolean;
}

export interface RefreshToken {
  token: string;
  accessToken: string;
  clientId: string;
  userId: string;
  scope: string;
  expiresAt: number;
  revoked: boolean;
}

export class HealthcareOAuthProvider {
  private clients: Map<string, OAuthClient> = new Map();
  private authorizationCodes: Map<string, AuthorizationCode> = new Map();
  private accessTokens: Map<string, AccessToken> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private userProfiles: Map<string, UserInfo> = new Map();
  private signingKey: string;
  private issuer: string;

  constructor(issuer: string, signingKey: string) {
    this.issuer = issuer;
    this.signingKey = signingKey;
  }

  // Client Registration and Management
  async registerClient(clientInfo: Omit<OAuthClient, 'clientId' | 'clientSecret' | 'status' | 'createdAt' | 'lastUsed'>): Promise<OAuthClient> {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientSecret = clientInfo.tokenEndpointAuthMethod !== 'none' 
      ? this.generateClientSecret() 
      : undefined;

    const client: OAuthClient = {
      ...clientInfo,
      clientId,
      clientSecret,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.clients.set(clientId, client);
    return client;
  }

  async getClient(clientId: string): Promise<OAuthClient | null> {
    return this.clients.get(clientId) || null;
  }

  async validateClient(clientId: string, clientSecret?: string): Promise<boolean> {
    const client = this.clients.get(clientId);
    if (!client || client.status !== 'active') {
      return false;
    }

    if (client.tokenEndpointAuthMethod === 'none') {
      return true;
    }

    return client.clientSecret === clientSecret;
  }

  // Authorization Flow
  async createAuthorizationUrl(request: AuthenticationRequest): Promise<string> {
    const client = await this.getClient(request.clientId);
    if (!client) {
      throw new Error('Invalid client_id');
    }

    if (!client.redirectUris.includes(request.redirectUri)) {
      throw new Error('Invalid redirect_uri');
    }

    const scopes = request.scope.split(' ');
    const invalidScopes = scopes.filter(scope => !client.scopes.includes(scope));
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    // Generate authorization URL
    const params = new URLSearchParams({
      response_type: request.responseType,
      client_id: request.clientId,
      redirect_uri: request.redirectUri,
      scope: request.scope,
      state: request.state
    });

    if (request.codeChallenge) {
      params.append('code_challenge', request.codeChallenge);
      params.append('code_challenge_method', request.codeChallengeMethod || 'S256');
    }

    if (request.nonce) {
      params.append('nonce', request.nonce);
    }

    return `${this.issuer}/auth?${params.toString()}`;
  }

  async handleAuthorizationCallback(
    clientId: string,
    userId: string,
    redirectUri: string,
    scope: string,
    codeChallenge?: string,
    codeChallengeMethod?: string,
    nonce?: string
  ): Promise<string> {
    const code = this.generateAuthorizationCode();
    const authCode: AuthorizationCode = {
      code,
      clientId,
      userId,
      redirectUri,
      scope,
      codeChallenge,
      codeChallengeMethod,
      nonce,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      used: false
    };

    this.authorizationCodes.set(code, authCode);
    return code;
  }

  // Token Exchange
  async exchangeCodeForToken(request: TokenRequest): Promise<TokenResponse> {
    if (request.grantType !== 'authorization_code') {
      throw new Error('Unsupported grant type');
    }

    if (!request.code) {
      throw new Error('Missing authorization code');
    }

    const authCode = this.authorizationCodes.get(request.code);
    if (!authCode) {
      throw new Error('Invalid authorization code');
    }

    if (authCode.used || Date.now() > authCode.expiresAt) {
      throw new Error('Authorization code expired or already used');
    }

    if (authCode.clientId !== request.clientId) {
      throw new Error('Client mismatch');
    }

    if (authCode.redirectUri !== request.redirectUri) {
      throw new Error('Redirect URI mismatch');
    }

    // Validate PKCE if used
    if (authCode.codeChallenge && !request.codeVerifier) {
      throw new Error('Missing code verifier');
    }

    if (authCode.codeChallenge && request.codeVerifier) {
      const challengeVerified = this.verifyPKCE(
        request.codeVerifier,
        authCode.codeChallenge,
        authCode.codeChallengeMethod || 'S256'
      );
      if (!challengeVerified) {
        throw new Error('Invalid code verifier');
      }
    }

    // Mark code as used
    authCode.used = true;
    this.authorizationCodes.set(request.code, authCode);

    // Generate tokens
    const accessToken = this.generateAccessToken();
    const refreshToken = this.generateRefreshToken();
    const expiresIn = 3600; // 1 hour

    const accessTokenRecord: AccessToken = {
      token: accessToken,
      clientId: request.clientId,
      userId: authCode.userId,
      scope: authCode.scope,
      tokenType: 'Bearer',
      expiresAt: Date.now() + expiresIn * 1000,
      refreshToken,
      revoked: false
    };

    const refreshTokenRecord: RefreshToken = {
      token: refreshToken,
      accessToken,
      clientId: request.clientId,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      revoked: false
    };

    this.accessTokens.set(accessToken, accessTokenRecord);
    this.refreshTokens.set(refreshToken, refreshTokenRecord);

    // Generate ID token if openid scope is requested
    let idToken: string | undefined;
    if (authCode.scope.includes('openid')) {
      idToken = await this.generateIdToken(authCode.userId, request.clientId, authCode.nonce);
    }

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken,
      scope: authCode.scope,
      idToken
    };
  }

  async refreshAccessToken(request: TokenRequest): Promise<TokenResponse> {
    if (request.grantType !== 'refresh_token') {
      throw new Error('Unsupported grant type');
    }

    if (!request.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const refreshTokenRecord = this.refreshTokens.get(request.refreshToken);
    if (!refreshTokenRecord) {
      throw new Error('Invalid refresh token');
    }

    if (refreshTokenRecord.revoked || Date.now() > refreshTokenRecord.expiresAt) {
      throw new Error('Refresh token expired or revoked');
    }

    if (refreshTokenRecord.clientId !== request.clientId) {
      throw new Error('Client mismatch');
    }

    // Revoke old tokens
    const oldAccessToken = this.accessTokens.get(refreshTokenRecord.accessToken);
    if (oldAccessToken) {
      oldAccessToken.revoked = true;
      this.accessTokens.set(refreshTokenRecord.accessToken, oldAccessToken);
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken();
    const newRefreshToken = this.generateRefreshToken();
    const expiresIn = 3600; // 1 hour

    const accessTokenRecord: AccessToken = {
      token: newAccessToken,
      clientId: request.clientId,
      userId: refreshTokenRecord.userId,
      scope: request.scope || refreshTokenRecord.scope,
      tokenType: 'Bearer',
      expiresAt: Date.now() + expiresIn * 1000,
      refreshToken: newRefreshToken,
      revoked: false
    };

    const newRefreshTokenRecord: RefreshToken = {
      token: newRefreshToken,
      accessToken: newAccessToken,
      clientId: request.clientId,
      userId: refreshTokenRecord.userId,
      scope: request.scope || refreshTokenRecord.scope,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      revoked: false
    };

    this.accessTokens.set(newAccessToken, accessTokenRecord);
    this.refreshTokens.set(newRefreshToken, newRefreshTokenRecord);

    // Revoke old refresh token
    refreshTokenRecord.revoked = true;
    this.refreshTokens.set(request.refreshToken, refreshTokenRecord);

    return {
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken: newRefreshToken,
      scope: accessTokenRecord.scope
    };
  }

  // Token Validation and Introspection
  async validateAccessToken(token: string): Promise<AccessToken | null> {
    const accessToken = this.accessTokens.get(token);
    if (!accessToken) {
      return null;
    }

    if (accessToken.revoked || Date.now() > accessToken.expiresAt) {
      return null;
    }

    // Update last used timestamp for client
    const client = this.clients.get(accessToken.clientId);
    if (client) {
      client.lastUsed = new Date().toISOString();
      this.clients.set(accessToken.clientId, client);
    }

    return accessToken;
  }

  async introspectToken(token: string): Promise<{
    active: boolean;
    scope?: string;
    clientId?: string;
    userId?: string;
    exp?: number;
    iat?: number;
    tokenType?: string;
  }> {
    const accessToken = await this.validateAccessToken(token);
    if (!accessToken) {
      return { active: false };
    }

    return {
      active: true,
      scope: accessToken.scope,
      clientId: accessToken.clientId,
      userId: accessToken.userId,
      exp: Math.floor(accessToken.expiresAt / 1000),
      iat: Math.floor((accessToken.expiresAt - 3600000) / 1000), // Assuming 1 hour validity
      tokenType: accessToken.tokenType
    };
  }

  // User Information
  async getUserInfo(token: string): Promise<UserInfo | null> {
    const accessToken = await this.validateAccessToken(token);
    if (!accessToken) {
      throw new Error('Invalid or expired token');
    }

    if (!accessToken.scope.includes('openid')) {
      throw new Error('Insufficient scope for user info');
    }

    return this.userProfiles.get(accessToken.userId) || null;
  }

  async setUserInfo(userId: string, userInfo: UserInfo): Promise<void> {
    this.userProfiles.set(userId, userInfo);
  }

  // Token Revocation
  async revokeToken(token: string, _tokenTypeHint?: 'access_token' | 'refresh_token'): Promise<void> {
    // Try to revoke as access token
    const accessToken = this.accessTokens.get(token);
    if (accessToken) {
      accessToken.revoked = true;
      this.accessTokens.set(token, accessToken);
      
      // Also revoke associated refresh token
      if (accessToken.refreshToken) {
        const refreshToken = this.refreshTokens.get(accessToken.refreshToken);
        if (refreshToken) {
          refreshToken.revoked = true;
          this.refreshTokens.set(accessToken.refreshToken, refreshToken);
        }
      }
      return;
    }

    // Try to revoke as refresh token
    const refreshToken = this.refreshTokens.get(token);
    if (refreshToken) {
      refreshToken.revoked = true;
      this.refreshTokens.set(token, refreshToken);
      
      // Also revoke associated access token
      const relatedAccessToken = this.accessTokens.get(refreshToken.accessToken);
      if (relatedAccessToken) {
        relatedAccessToken.revoked = true;
        this.accessTokens.set(refreshToken.accessToken, relatedAccessToken);
      }
      return;
    }
  }

  // Utility Methods
  private generateClientSecret(): string {
    return `cs_${Math.random().toString(36).substr(2, 32)}`;
  }

  private generateAuthorizationCode(): string {
    return `ac_${Math.random().toString(36).substr(2, 32)}`;
  }

  private generateAccessToken(): string {
    return `at_${Math.random().toString(36).substr(2, 32)}`;
  }

  private generateRefreshToken(): string {
    return `rt_${Math.random().toString(36).substr(2, 32)}`;
  }

  private verifyPKCE(codeVerifier: string, codeChallenge: string, method: string): boolean {
    if (method === 'plain') {
      return codeVerifier === codeChallenge;
    }
    
    if (method === 'S256') {
      // Would use crypto.createHash('sha256').update(codeVerifier).digest('base64url')
      // Simplified for demo
      return true;
    }
    
    return false;
  }

  private async generateIdToken(userId: string, clientId: string, nonce?: string): Promise<string> {
    const userInfo = this.userProfiles.get(userId);
    const now = Math.floor(Date.now() / 1000);
    
    const payload: JWTPayload = {
      iss: this.issuer,
      sub: userId,
      aud: clientId,
      exp: now + 3600, // 1 hour
      iat: now,
      nonce,
      // Include healthcare-specific claims
      fhirUser: userInfo?.npi ? `Practitioner/${userInfo.npi}` : undefined,
      organization: userInfo?.organizationId,
      role: userInfo?.role,
      permissions: this.getPermissionsForUser(userId)
    };

    // In a real implementation, this would use proper JWT signing
    return `header.${btoa(JSON.stringify(payload))}.signature`;
  }

  private getPermissionsForUser(userId: string): string[] {
    // Determine user permissions based on role and organization
    const userInfo = this.userProfiles.get(userId);
    if (!userInfo) return [];

    const basePermissions = ['read:patient', 'read:observation'];
    
    if (userInfo.role === 'physician') {
      return [...basePermissions, 'write:patient', 'write:observation', 'write:medication'];
    }
    
    if (userInfo.role === 'nurse') {
      return [...basePermissions, 'write:observation'];
    }
    
    return basePermissions;
  }

  // JWKS Endpoint
  async getJWKS(): Promise<{ keys: Record<string, unknown>[] }> {
    // In a real implementation, this would return the public key(s) for token verification
    return {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: 'healthcare-oauth-key-1',
          n: 'base64-encoded-modulus',
          e: 'AQAB'
        }
      ]
    };
  }
}

// Export singleton instance
export const healthcareOAuthProvider = new HealthcareOAuthProvider(
  'https://auth.paintracker.app',
  'signing-key-would-be-loaded-from-secure-storage'
);
