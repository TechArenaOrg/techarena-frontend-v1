# Google Sign-In — Backend Spec Request

**Status: proposed, not yet implemented.** No Google/OAuth endpoint exists on the
backend today (checked live `/api/docs-json` - only `login`, `register`, `logout`,
`refresh-token`, `profile`, password-reset, and email-verification exist under
`/auth`). This doc proposes what's needed so the frontend can add Google sign-in.

## Why this needs backend work, not just a frontend toggle

Every authenticated request this frontend makes uses a **backend-issued JWT**
(`accessToken`, from `POST /auth/login`'s response) via NextAuth's session - it's not
optional plumbing, it's how the whole app talks to the backend (cart, orders,
dashboard, everything). Google confirming someone's identity isn't enough on its own;
the app still needs *this backend* to issue its own token for that identity before
anything past the login screen works. That requires one new endpoint.

## Proposed endpoint: `POST /api/v1/auth/google`

### Request body

```jsonc
{
  "idToken": "string"  // Google ID token (JWT) from the frontend's OAuth flow
}
```
The frontend gets this token directly from Google via NextAuth's Google provider -
the backend verifies it against Google's public keys (standard OAuth ID token
verification, e.g. `google-auth-library`'s `verifyIdToken`) rather than trusting a
client-supplied email/name directly. This is the standard, secure pattern for
"verify a Google identity server-side."

### Behavior

1. Verify the ID token's signature and audience (must match this app's Google
   Client ID) using Google's public keys.
2. Extract `email`, `email_verified`, `given_name`, `family_name`, `picture` from the
   verified token payload.
3. **If a user with this email already exists** (e.g. they originally registered with
   email/password): log them in as that user. Recommend also setting
   `emailVerified: true` on that account if it wasn't already, since Google already
   verified the email.
4. **If no user exists with this email**: create one. **Open question:** `POST
   /auth/register` currently requires `phone` and `password` - a Google-only signup
   won't have either. Recommend making `phone`/`password` nullable for
   Google-originated accounts (with `password: null` meaning "can't log in via
   email/password, only Google," and `phone` collected later via a profile-completion
   prompt) rather than blocking Google signup on data Google doesn't provide.
5. Return the **exact same shape** `POST /auth/login` already returns, so the
   frontend's existing session/token handling needs zero changes beyond adding this
   as an alternate way to obtain it:

```jsonc
{
  "success": true,
  "data": {
    "user": { /* same User shape as /auth/login - id, email, role, status, emailVerified, phone, profile{firstName,lastName,avatar,...}, ... */ },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Edge cases to define

- **Role assignment**: new Google signups presumably default to `role: "customer"`
  (matching `/auth/register`'s default) - confirm.
- **Email collision with a different auth method**: if someone registered with
  email/password and later tries Google sign-in with the same email, should that
  silently link the accounts (recommended - same person, same email), or reject with
  an error telling them to use their password instead? Recommend silent linking for
  the best UX, but flagging since it's a real product decision, not just a technical
  one.
- **Unverified Google email**: Google's `email_verified` claim is occasionally
  `false` (e.g. some Workspace configs) - recommend rejecting sign-in in that case
  with a clear error, rather than trusting an unverified email as an account
  identifier.

## Frontend-side changes (once the endpoint exists)

- Add `GoogleProvider` from `next-auth/providers/google` to `src/auth.ts`, alongside
  the existing `CredentialsProvider`.
- Requires a Google Cloud Console OAuth Client ID/Secret (web application type,
  authorized redirect URI `<app-url>/api/auth/callback/google`) - these become
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` env vars.
- In the `signIn` callback, when the provider is `google`, call the new
  `POST /auth/google` endpoint with the ID token NextAuth received from Google, and
  attach the returned `accessToken`/`refreshToken`/`user` to the NextAuth JWT exactly
  like the existing `CredentialsProvider.authorize()` does today - same downstream
  session/refresh logic, no changes needed there.
- Add a "Sign in with Google" button to `src/components/auth/login-form.tsx` (and
  probably `register-form.tsx`) calling NextAuth's `signIn('google')`.
