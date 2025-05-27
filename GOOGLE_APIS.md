# Google Cloud APIs Configuration

To properly use all Google services in this application, you need to enable the following APIs in your Google Cloud Console project:

## Required APIs

1. **Google Calendar API**
   - Used for: Calendar events and tasks integration
   - API Name: `calendar-json.googleapis.com`
   - Access Method: OAuth 2.0

2. **Gmail API**
   - Used for: Email widget and inbox display
   - API Name: `gmail.googleapis.com`
   - Access Method: OAuth 2.0

3. **Google Drive API**
   - Used for: Recent files widget
   - API Name: `drive.googleapis.com`
   - Access Method: OAuth 2.0


4. **Google Identity Services / OAuth 2.0**
   - Used for: Authentication and authorization
   - API Name: `oauth2.googleapis.com`

## How to Enable APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to "APIs & Services" > "Library" in the left sidebar
4. Search for each API listed above
5. Click on each API and click the "Enable" button

## OAuth Consent Screen Configuration

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose the appropriate user type (External or Internal)
3. Fill in the required app information
4. Add the following scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.labels`
   - `https://www.googleapis.com/auth/maps-platform.places`
   - `https://www.googleapis.com/auth/maps-platform.routes`

## Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add your authorized JavaScript origins (e.g., `http://localhost:3000`)
5. Add your authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)
6. Click "Create"
7. Copy the Client ID and Client Secret

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=your_base_url_here (e.g., http://localhost:3000)
NEXTAUTH_SECRET=your_random_secret_here
```

## API Billing

Note that some APIs (especially Maps Platform APIs) require a billing account. Make sure to set up billing if you plan to use these services in production. Google offers a free tier for most APIs that should be sufficient for development and testing.