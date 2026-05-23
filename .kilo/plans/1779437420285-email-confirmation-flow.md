# Email Confirmation Flow Review

## Current Implementation

**Signup Flow (`app/api/auth/signup/route.ts`):**
- Creates user with `emailVerified: false` and `verificationToken` (UUID)
- Sends verification email via Brevo SMTP with token in URL
- Logs verification URL to console in development

**Verification Flow (`app/api/auth/verify-email/route.ts`):**
- Validates token against database
- Sets `emailVerified: true` and clears `verificationToken`
- No token expiration handling

**Login Flow (`lib/auth.ts`):**
- Checks `emailVerified` in authorize callback
- Throws generic error: "Please verify your email before logging in."
- NextAuth returns `EMAIL_NOT_VERIFIED` error code

**Login UI (`app/login/page.tsx`):**
- Handles `EMAIL_NOT_VERIFIED` error
- Shows message: "Please verify your email before signing in..."

## Issues Identified

1. **Error Code Mismatch**: The authorize callback throws a generic error, but NextAuth needs `EMAIL_NOT_VERIFIED` return value. Currently the login page expects this code but the auth callback throws an error.

2. **Missing Resend Option**: No way for users to resend verification email if they didn't receive it.

3. **No Token Expiration**: Verification tokens never expire, creating security risk.

## Recommended Improvements

### 1. Fix Error Code (High Priority)
Update `lib/auth.ts` to return proper error code:
```typescript
if (!user.emailVerified) {
  return null // Instead of throwing error
}
// In callbacks, map to EMAIL_NOT_VERIFIED
```

### 2. Add Resend Verification Endpoint (Medium Priority)
Create `POST /api/auth/resend-verification` that:
- Accepts email address
- Checks if user exists and isn't already verified
- Generates new token and sends email

### 3. Add Token Expiration (Medium Priority)
- Add `verificationTokenExpires: Date` field to User model
- Set expiration (e.g., 24 hours) on signup
- Check expiration in verify endpoint