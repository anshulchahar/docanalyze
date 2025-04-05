# Google OAuth Setup Guide

To fix the `redirect_uri_mismatch` error, you need to configure your Google OAuth credentials in the Google Cloud Console:

## Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one if needed)
3. In the left sidebar, navigate to **APIs & Services** > **Credentials**

## Step 2: Configure OAuth Client ID

1. Find your OAuth 2.0 Client ID and click the edit (pencil) icon
2. Under **Authorized redirect URIs**, add the following URLs:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   http://localhost:3002/api/auth/callback/google
   http://localhost:3003/api/auth/callback/google
   http://localhost:3004/api/auth/callback/google
   ```
3. This ensures that no matter which port your application runs on, the authentication will work correctly
4. Click **Save**

## Step 3: Verify Configuration

1. Make sure the NEXTAUTH_URL in your .env file matches the actual URL of your application
2. Currently, your application is running on: `http://localhost:3004`
3. Your NEXTAUTH_URL should be set to: `http://localhost:3004`

## Additional Troubleshooting

If you continue to experience issues:

1. Ensure you're using the correct Client ID and Client Secret in your .env file
2. Try clearing your browser cookies and cache before testing again
3. Check the Google Cloud Console logs for any authentication errors
4. Verify that you have the necessary OAuth scopes enabled for your application 