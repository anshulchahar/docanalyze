'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // Get detailed error information
    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case 'OAuthSignin':
                return 'Error starting the OAuth sign-in flow.';
            case 'OAuthCallback':
                return 'Error in the OAuth callback. The callback URL might be misconfigured in your OAuth provider.';
            case 'OAuthCreateAccount':
                return 'Error creating OAuth account. The account might already exist or there might be permission issues.';
            case 'EmailCreateAccount':
                return 'Error creating email account.';
            case 'Callback':
                return 'Error in the OAuth callback. Check if the callback URL is properly configured.';
            case 'OAuthAccountNotLinked':
                return 'The email associated with this OAuth account is already linked to another account.';
            case 'EmailSignin':
                return 'Error sending the email sign-in link.';
            case 'CredentialsSignin':
                return 'Sign in failed. Check the details you provided are correct.';
            case 'SessionRequired':
                return 'Please sign in to access this page.';
            case 'Configuration':
                return 'There is a problem with the server configuration. Please notify the site administrator.';
            default:
                return 'An unknown error occurred during authentication.';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Error</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        There was a problem signing you in
                    </p>
                </div>

                <div className="mt-6">
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error Code: {error || 'Unknown'}</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{getErrorMessage(error)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-sm text-gray-500">
                        <strong>Debugging Tips:</strong>
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-xs text-gray-500 space-y-1">
                        <li>Ensure your Google OAuth credentials are correctly configured</li>
                        <li>Check that <code>http://localhost:3002/api/auth/callback/google</code> is added as an authorized redirect URI in Google Cloud Console</li>
                        <li>Verify your .env file has the correct NEXTAUTH_URL set to <code>http://localhost:3002</code></li>
                        <li>Make sure your Google account has access to the OAuth application</li>
                    </ul>
                </div>

                <div className="mt-6">
                    <Link
                        href="/auth/signin"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
} 