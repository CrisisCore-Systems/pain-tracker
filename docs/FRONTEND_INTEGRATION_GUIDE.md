# Frontend Integration Guide - HttpOnly Cookies & CSRF

This guide explains how to update your frontend to work with the new httpOnly cookie-based authentication and CSRF protection.

## 📋 Overview of Changes

The authentication system has been upgraded from localStorage-based tokens to httpOnly cookies for enhanced security:

**Before (localStorage)**:
- Tokens stored in localStorage (vulnerable to XSS)
- Manual token management required
- No CSRF protection

**After (httpOnly cookies)**:
- Tokens stored in httpOnly cookies (XSS-proof)
- Automatic token management by browser
- CSRF protection with double-submit pattern

---

## 🔄 Migration Steps

### Step 1: Update ClinicAuthContext

Replace `src/contexts/ClinicAuthContext.tsx` with the new version that supports httpOnly cookies:

```bash
# Backup old version
cp src/contexts/ClinicAuthContext.tsx src/contexts/ClinicAuthContext.old.tsx

# Use new version
cp src/contexts/ClinicAuthContext.v2.tsx src/contexts/ClinicAuthContext.tsx
```

Key changes in the new version:
- All `fetch()` calls include `credentials: 'include'`
- CSRF tokens retrieved from cookies, not localStorage
- No manual token storage/retrieval
- Added `refreshSession()` method

### Step 2: Update API Request Helper

Create a centralized API request helper that handles cookies and CSRF:

```typescript
// src/utils/api.ts
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token from cookie
  const csrfToken = getCsrfToken();
  
  // Merge headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add CSRF token for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  return fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Always send cookies
  });
}

function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('csrfToken='));
  if (!csrfCookie) return null;
  return csrfCookie.split('=')[1] || null;
}
```

### Step 3: Update Login Component

Update your login form to support MFA:

```tsx
// src/components/clinic/LoginForm.tsx
import { useState } from 'react';
import { useClinicAuth } from '../../contexts/ClinicAuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const { login, error, isLoading, requiresMfa } = useClinicAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password, mfaCode || undefined);
      // Success - redirect handled by auth context
    } catch (err) {
      // Error displayed via context
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      {requiresMfa && (
        <input
          type="text"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          placeholder="MFA Code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
      )}
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Step 4: Update All API Calls

Replace manual fetch calls with the new helper:

**Before:**
```typescript
const response = await fetch('/api/clinic/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

**After:**
```typescript
const response = await apiRequest('/api/clinic/patients', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### Step 5: Remove localStorage References

Search and remove all localStorage token references:

```bash
# Find references
grep -r "localStorage.getItem.*token" src/
grep -r "localStorage.setItem.*token" src/
grep -r "localStorage.removeItem.*token" src/

# Remove these patterns:
# - localStorage.getItem('clinic_access_token')
# - localStorage.setItem('clinic_access_token', ...)
# - localStorage.getItem('clinic_refresh_token')
# - localStorage.removeItem('clinic_access_token')
```

---

## 🔒 CSRF Protection Usage

### Automatic CSRF Validation

CSRF validation happens automatically for mutating requests (POST, PUT, DELETE, PATCH).

The frontend just needs to:
1. Include `credentials: 'include'` in all requests
2. Read CSRF token from cookie
3. Send CSRF token in `X-CSRF-Token` header

This is handled automatically by the `apiRequest()` helper.

### Manual CSRF Token Retrieval

If you need direct access to the CSRF token:

```typescript
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('csrfToken='));
  if (!csrfCookie) return null;
  return csrfCookie.split('=')[1] || null;
}
```

### Handling CSRF Errors

If you get a 403 CSRF error:

```typescript
try {
  const response = await apiRequest('/api/clinic/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.status === 403) {
    const data = await response.json();
    if (data.error?.includes('CSRF')) {
      // CSRF token expired or invalid
      // Trigger session refresh
      await refreshSession();
      // Retry request
      return apiRequest('/api/clinic/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## 🧪 Testing Checklist

### Local Testing

- [ ] Login works and sets httpOnly cookies
- [ ] Session persists across page refreshes
- [ ] Logout clears cookies
- [ ] CSRF token sent with POST/PUT/DELETE requests
- [ ] Rate limiting shows appropriate error messages
- [ ] MFA flow works (if enabled)
- [ ] Session refresh works automatically

### Browser DevTools Checks

1. **Check cookies** (Application > Cookies):
   - `accessToken` - HttpOnly, Secure (in production)
   - `refreshToken` - HttpOnly, Secure (in production)
   - `csrfToken` - NOT HttpOnly (readable by JS)

2. **Check Network tab**:
   - Login request sets `Set-Cookie` headers
   - Subsequent requests include `Cookie` header
   - POST requests include `X-CSRF-Token` header

3. **Console check**:
   ```javascript
   // This should return null (httpOnly prevents JS access)
   document.cookie.match(/accessToken=([^;]+)/);
   
   // This should return the CSRF token
   document.cookie.match(/csrfToken=([^;]+)/);
   ```

---

## 🚨 Common Issues & Solutions

### Issue: "CSRF token required"

**Cause**: CSRF token not sent with request
**Solution**: Ensure `X-CSRF-Token` header is set for POST/PUT/DELETE requests

```typescript
const csrfToken = getCsrfToken();
headers['X-CSRF-Token'] = csrfToken;
```

### Issue: "Session not found"

**Cause**: Cookies not sent with request
**Solution**: Add `credentials: 'include'` to fetch options

```typescript
fetch('/api/endpoint', {
  credentials: 'include', // Required for cookies
});
```

### Issue: CORS errors with cookies

**Cause**: CORS policy blocking credentials
**Solution**: Update server CORS configuration

```typescript
// In Vercel serverless function
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', 'https://paintracker.ca');
```

### Issue: Cookies not set in production

**Cause**: `secure` flag requires HTTPS
**Solution**: Ensure production uses HTTPS, or set `secure: false` for development

```typescript
const isProduction = process.env.NODE_ENV === 'production';
serialize('accessToken', token, {
  secure: isProduction, // Only require HTTPS in production
});
```

### Issue: Session expires too quickly

**Cause**: Access token has short lifetime (15 min)
**Solution**: Implement automatic refresh

```typescript
// Refresh token every 10 minutes
useEffect(() => {
  const interval = setInterval(async () => {
    if (isAuthenticated) {
      await refreshSession();
    }
  }, 10 * 60 * 1000); // 10 minutes
  
  return () => clearInterval(interval);
}, [isAuthenticated]);
```

---

## 📱 Mobile/React Native Considerations

If you're building a mobile app, httpOnly cookies may not work the same way. Consider:

1. **Use token-based auth** for mobile apps
2. **Create separate endpoints** for mobile vs web
3. **Implement secure storage** (Keychain/Keystore)

Example:
```typescript
// For web
const authType = 'cookie'; // httpOnly cookies

// For mobile
const authType = 'bearer'; // Authorization header
```

---

## 🔐 Security Best Practices

1. **Always use `credentials: 'include'`** for authenticated requests
2. **Never store tokens in localStorage** (use httpOnly cookies)
3. **Always send CSRF tokens** with mutating requests
4. **Implement session refresh** to handle token expiration
5. **Handle rate limiting gracefully** with user-friendly messages
6. **Use HTTPS in production** to protect cookies
7. **Implement MFA** for admin accounts
8. **Log out from all devices** when password is reset

---

## 📚 Related Documentation

- [Production Security Complete](./PRODUCTION_SECURITY_COMPLETE.md)
- [CSRF Middleware Documentation](../api/lib/csrfMiddleware.ts)
- [Email Service Documentation](../api/lib/emailService.ts)
- [Rate Limiting Documentation](../api/lib/rateLimit.ts)

---

## ✅ Migration Checklist

- [ ] Update ClinicAuthContext to v2
- [ ] Create apiRequest helper
- [ ] Update login component with MFA support
- [ ] Replace all fetch calls with apiRequest
- [ ] Remove localStorage token references
- [ ] Test login/logout flow
- [ ] Test CSRF protection
- [ ] Test session refresh
- [ ] Test rate limiting
- [ ] Test MFA (if enabled)
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] End-to-end testing
- [ ] Deploy to production

---

**Need Help?** Check the test script: `scripts/test-security.js`
