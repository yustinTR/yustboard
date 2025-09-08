# Google APIs Setup & Configuration

Complete guide for setting up Google APIs and integrations for YustBoard.

## Table of Contents
- [API Configuration](#api-configuration)
- [Google Cloud Setup](#google-cloud-setup)
- [Free APIs Available](#free-apis-available)
- [Supabase Storage](#supabase-storage)

---

# API Configuration

## Required APIs

### Google Cloud APIs

1. **Google Calendar API**
   - Used for: Calendar events and tasks integration
   - API Name: `calendar-json.googleapis.com`
   - Access Method: OAuth 2.0
   - Free quota: 1,000,000 requests per dag

2. **Gmail API**
   - Used for: Email widget and inbox display
   - API Name: `gmail.googleapis.com`
   - Access Method: OAuth 2.0
   - Free quota: 250 quota units per gebruiker per seconde

3. **Google Drive API**
   - Used for: Recent files widget
   - API Name: `drive.googleapis.com`
   - Access Method: OAuth 2.0
   - Free quota: 1,000,000,000 requests per dag

4. **Google Identity Services / OAuth 2.0**
   - Used for: Authentication and authorization
   - API Name: `oauth2.googleapis.com`

5. **Google Fit API**
   - Used for: Fitness data integration
   - Free quota: 150,000 requests per dag
   - Note: Gebruikers moeten opnieuw inloggen voor Fitness permissions

---

# Google Cloud Setup

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
   - `https://www.googleapis.com/auth/maps-platform.places`
   - `https://www.googleapis.com/auth/maps-platform.routes`
5. Add test users if your app is in testing mode

## 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add your authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
5. Add your authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Click "Create" and note your Client ID and Client Secret

## 5. Configure Environment Variables

Create or update your `.env.local` file with:

```env
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

---

# Free APIs Available

## News API (NewsAPI.org)
- **Website**: https://newsapi.org
- **Gratis tier**: 100 requests per dag
- **Registratie**: Maak een gratis account aan
- **Environment variable**: `NEWS_API_KEY`
- **Features**: Top headlines, zoeken, categorieën, landen

## Weather API (OpenWeatherMap)
- **Website**: https://openweathermap.org/api
- **Gratis tier**: 1,000 calls per dag
- **Registratie**: Maak een gratis account aan
- **Environment variable**: `OPENWEATHER_API_KEY`
- **Features**: Huidige weer, 5-daagse voorspelling, locatie-gebaseerd

## Setup instructies

1. **News API**:
   ```bash
   # Voeg toe aan .env.local
   NEWS_API_KEY=jouw_api_key_hier
   ```

2. **Weather API**:
   ```bash
   # Voeg toe aan .env.local
   OPENWEATHER_API_KEY=jouw_api_key_hier
   ```

## Toekomstige integraties

### Social Media APIs (Coming Soon)
- Twitter API v2 (Free tier: 1,500 tweets/month)
- Instagram Basic Display API
- LinkedIn API

### Andere interessante gratis APIs
- **Unsplash API**: Gratis stock foto's (50 requests/hour)
- **CoinGecko API**: Cryptocurrency data (10-50 calls/minute)
- **REST Countries**: Landen informatie (geen limiet)
- **JSONPlaceholder**: Mock REST API voor testing

---

# Supabase Storage

Setting up Supabase Storage for image uploads in YustBoard.

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. A Supabase project

## Setup Steps

### 1. Create a Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket with the following settings:
   - Name: `yustboard-images`
   - Public bucket: **Yes** (check this box)
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Bucket Permissions (Optional)

By default, public buckets allow read access to everyone. If you want more control:

1. Go to **Storage** → **Policies**
2. Create policies for your bucket:
   - **SELECT** (View): Allow for everyone or authenticated users
   - **INSERT** (Upload): Allow for authenticated users only
   - **DELETE**: Allow for authenticated users only

Example RLS policy for authenticated uploads:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'yustboard-images');

-- Allow public to view images
CREATE POLICY "Allow public to view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'yustboard-images');
```

## Features

Once configured, the application will:
- Automatically use Supabase Storage for all image uploads
- Fall back to local storage if Supabase is not configured
- Provide a media library for selecting previously uploaded images
- Support image deletion from Supabase Storage

## Fallback Behavior

If Supabase is not configured or unavailable:
- Images will be stored locally in `public/uploads/blog/`
- The application will continue to work normally
- You can migrate to Supabase Storage later without losing functionality

## Troubleshooting

### "Storage bucket not found" error
- Make sure the bucket name in the code (`yustboard-images`) matches your bucket name
- Ensure the bucket is set to public

### "Permission denied" errors
- Check that your service role key is correct
- Verify bucket policies allow the operations you're trying to perform

### Images not displaying
- Ensure your bucket is public
- Check that the Supabase project URL is correct
- Verify CORS settings in Supabase dashboard if needed

## API Billing

Note that some APIs (especially Maps Platform APIs) require a billing account. Make sure to set up billing if you plan to use these services in production. Google offers a free tier for most APIs that should be sufficient for development and testing.

## Next Steps

- Consider setting up additional security measures
- Implement caching for API responses to reduce quota usage
- Add more features such as email composition or file upload

For more details on the Google APIs used, refer to:
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)