# Setting up Supabase Storage for YustBoard

This guide explains how to set up Supabase Storage for image uploads in YustBoard.

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