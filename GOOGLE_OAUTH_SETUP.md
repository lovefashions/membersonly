# Google OAuth 2.0 Setup Guide

This guide explains how to set up Google OAuth authentication for your Members Only app, allowing users to sign in with their Google accounts.

## Overview

Google OAuth allows users to log in using their Google account instead of creating a new password. This is optional alongside password login.

**Architecture:**
- Users click "Sign in with Google" button
- Frontend redirects to PocketBase OAuth handler
- PocketBase authenticates with Google
- Google redirects back to your app with auth token
- User is logged in and can access the app

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the **Project dropdown** at the top
3. Click **NEW PROJECT**
4. Enter a project name (e.g., "Apple Jucy Members")
5. Click **CREATE**
6. Wait for the project to be created (may take a few seconds)

---

## Step 2: Enable Google+ API

1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for **"Google+ API"** in the search box
3. Click on **Google+ API** (the one published by Google)
4. Click the **ENABLE** button
5. You should see "API enabled" confirmation

---

## Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click the **+ CREATE CREDENTIALS** button
3. Select **OAuth 2.0 Client ID**
4. If prompted, click **CONFIGURE CONSENT SCREEN** first

### Configure OAuth Consent Screen (if prompted)

1. Choose **External** as the User type
2. Click **CREATE**
3. Fill in the form:
   - **App name:** Apple Jucy
   - **User support email:** Use any valid email
   - **Developer contact information:** Use any valid email
4. Click **SAVE AND CONTINUE**
5. Skip the scopes screen and click **SAVE AND CONTINUE**
6. Skip the test users screen and click **SAVE AND CONTINUE**
7. Review and click **BACK TO DASHBOARD**

### Create the OAuth Credentials

1. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID** again
2. Select **Web application** as the application type
3. In the **Name** field, enter: `Apple Jucy App`
4. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   ```
   http://localhost:3000
   http://localhost:8090
   https://membersonly.applejucy.com
   ```
5. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   ```
   http://localhost:8090/auth/oauth2callback
   http://localhost:8090/auth/oauth2redirect
   https://membersonly.applejucy.com/auth/oauth2callback
   https://membersonly.applejucy.com/auth/oauth2redirect
   ```
6. Click **CREATE**
7. A popup will show your **Client ID** and **Client Secret**
8. **IMPORTANT:** Copy these values to a secure location

---

## Step 4: Configure PocketBase OAuth

1. Start your PocketBase server:
   ```bash
   cd apps/api/pocketbase
   ./pocketbase serve
   ```

2. Go to PocketBase Admin Panel:
   ```
   http://localhost:8090/admin
   ```

3. Log in with your admin credentials

4. In the left sidebar, click **Settings** → **Auth providers**

5. Look for **Google** in the list and click it

6. Enable Google OAuth:
   - Toggle **Enable Google OAuth2** to ON
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Set the scope to: `openid email profile`

7. Click **Save**

---

## Step 5: Add Environment Variables

The frontend reads Google credentials from `vite.config.js` or `.env` (optional for frontend, credentials are server-side in PocketBase).

1. If using environment variables in your frontend, add to `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

2. No need to add Client Secret to frontend (it's server-side only)

---

## Step 6: Test Google OAuth Locally

### Using Ngrok for Local Testing

If you want to test with an actual Google redirect URI:

1. Install ngrok:
   ```bash
   brew install ngrok  # Mac
   # or
   choco install ngrok  # Windows
   # or
   sudo apt-get install ngrok  # Linux (may need to build from source)
   ```

2. Run ngrok to expose your local server:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. Update Google Cloud Console:
   - Add the ngrok URL to **Authorized JavaScript origins**
   - Add `https://abc123.ngrok.io/auth/oauth2callback` to **Authorized redirect URIs**

5. Test the login flow

---

## Step 7: How Google OAuth Works in Your App

### Login Flow

1. User clicks "Sign in with Google" button on [LoginPage.jsx](apps/api/web/src/pages/LoginPage.jsx)
2. Frontend calls `googleAuth()` from [AuthContext.jsx](apps/api/web/src/contexts/AuthContext.jsx)
3. PocketBase `authWithOAuth2()` redirects browser to Google login
4. User logs in with their Google account
5. Google redirects back to `http://localhost:8090/auth/oauth2callback`
6. PocketBase exchanges the code for a token
7. Frontend receives the authenticated user
8. If first-time user, a profile is automatically created
9. User is redirected to `/dashboard`

### Signup Flow

Same as login - Google OAuth doesn't distinguish between signup and login. First time users are auto-created.

### Profile Creation

When a user logs in with Google for the first time:
- A user record is created in PocketBase
- A profile is automatically created with default tier "fan"
- Email is populated from Google account
- Status is set to "active"

---

## Step 8: Production Deployment

When deploying to production:

1. Update Google OAuth redirect URIs to use your production domain:
   ```
   https://membersonly.applejucy.com/auth/oauth2callback
   https://membersonly.applejucy.com/auth/oauth2redirect
   ```

2. Update PocketBase settings with production values

3. Update `.env` files on your production server

4. Test the full OAuth flow on production domain

---

## Troubleshooting

### "Invalid Client ID" Error
- Verify the Client ID is correct and matches what you pasted from Google Cloud
- Ensure Google+ API is enabled
- Clear browser cache and try again

### "Redirect URI mismatch" Error
- Check that your redirect URI exactly matches what's configured in Google Cloud Console
- If using ngrok, update the URI in Google Cloud
- Redirect URIs are case-sensitive

### User Created but Profile Not Created
- Check PocketBase logs for errors
- Verify the profiles collection has proper permissions
- Check that user_id is correctly set in profile

### OAuth Button Does Nothing
- Check browser console for errors
- Verify PocketBase OAuth provider is enabled and credentials are correct
- Test with: `curl http://localhost:8090/auth/oauth2authorize?provider=google`

### Ngrok URL Changes Each Time
- Ngrok free tier generates new URLs when you restart
- Paid ngrok allows static subdomains
- Update Google Cloud Console each time for testing

---

## Security Notes

1. **Never commit secrets** - Keep `.env` and credentials out of version control
2. **Client Secret is secret** - Only use it server-side (PocketBase), never in frontend code
3. **CSRF Protection** - PocketBase handles CSRF tokens automatically
4. **HTTPS Required** - Always use HTTPS in production
5. **Scope Minimization** - Only request `openid email profile` scopes

---

## Files Modified

- [.env.example](.env.example) - Added GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- [apps/api/web/src/contexts/AuthContext.jsx](apps/api/web/src/contexts/AuthContext.jsx) - Added `googleAuth()` method
- [apps/api/web/src/pages/LoginPage.jsx](apps/api/web/src/pages/LoginPage.jsx) - Added Google sign-in button
- [apps/api/web/src/pages/SignupPage.jsx](apps/api/web/src/pages/SignupPage.jsx) - Added Google sign-up button

---

## Next Steps

1. Complete the Google OAuth setup following steps 1-6 above
2. Restart your backend services
3. Test the login and signup flows
4. Deploy to production with production credentials

For questions or issues, check the troubleshooting section or consult the PocketBase OAuth documentation.
