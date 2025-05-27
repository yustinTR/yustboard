# Setting Up Google APIs for Yustboard

This guide will help you set up the necessary Google APIs to enable Gmail, Drive, Calendar, and Maps integration in your Yustboard application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name and create it

## 2. Enable Required APIs

In your Google Cloud project:

1. Go to "APIs & Services" > "Library"
2. Search for and enable each of these APIs:
   - Google Calendar API
   - Gmail API
   - Google Drive API

## 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (or "Internal" if this is for your organization only)
3. Fill in the required app information:
   - App name
   - User support email
   - Developer contact information
4. Add the following scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.labels`
5. Add test users if your app is in testing mode

## 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add your authorized JavaScript origins (e.g., `http://localhost:3000`)
5. Add your authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Click "Create" and note your Client ID and Client Secret


## 5. Configure Environment Variables

Create or update your `.env.local` file with:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

For production, make sure to update `NEXTAUTH_URL` to your production URL.

## 6. Verify Your Setup

1. Start your application: `npm run dev`
2. Go to the login page and sign in with Google
3. You should be asked to grant permission for the requested scopes
4. After authorization, you should see your Gmail messages, Drive files, and other Google data in the dashboard widgets

## Troubleshooting

### No Emails or Files Appear

1. Check browser console for errors
2. Verify you've enabled the correct APIs
3. Ensure the OAuth scopes are correctly configured
4. Verify your access token is being correctly passed to the API endpoints

### Authentication Errors

1. Check that your redirect URIs match exactly what's configured in Google Cloud
2. Ensure your environment variables are correctly set
3. If using the application in production, make sure your domain is properly configured in the OAuth consent screen

### API Quota Limits

For testing and personal use, the free tier quota should be sufficient. If you encounter quota limits:

1. Set up a billing account in Google Cloud
2. Monitor your API usage in the Google Cloud Console

## Next Steps

- Consider setting up additional security measures
- Implement caching for API responses to reduce quota usage
- Add more features such as email composition or file upload

For more details on the Google APIs used, refer to:
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)