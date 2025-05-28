# Deployment Guide: Vercel + Supabase

Deze guide helpt je bij het gratis deployen van Yustboard naar Vercel met Supabase als database.

## Stap 1: Supabase Setup

### 1.1 Account aanmaken
1. Ga naar [supabase.com](https://supabase.com)
2. Maak een gratis account aan
3. Klik op "New project"

### 1.2 Project configuratie
- **Project name**: yustboard
- **Database Password**: Genereer een sterk wachtwoord (BEWAAR DIT!)
- **Region**: Europe (Frankfurt) - voor beste performance
- **Pricing Plan**: Free tier

### 1.3 Database URL ophalen
1. Ga naar Project Settings → Database
2. Kopieer de "Connection string" → "URI"
3. Het ziet er ongeveer zo uit:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Stap 2: Project Voorbereiden

### 2.1 Update Prisma schema
Voeg deze regel toe aan je `prisma/schema.prisma` als die er nog niet is:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Voor Supabase connection pooling
}
```

### 2.2 Environment variabelen
Maak een `.env.production.local` bestand aan:
```env
# Supabase
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL=https://yustboard.vercel.app
NEXTAUTH_SECRET=[GENEREER NIEUWE SECRET]

# Google OAuth
GOOGLE_CLIENT_ID=606468891412-g610cq2s0arv91d7208m0lobmbda4113.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_MAPS_API_KEY=AIzaSyA3g4DONwmfjdlJnSUKKsixXibipbENut0

# APIs
NEWS_API_KEY=503eebf0bee946e584d4e2f5b578e036
OPENWEATHER_API_KEY=[JE_API_KEY]
```

**Belangrijk**: 
- Gebruik de "pooled connection" URL voor `DATABASE_URL`
- Gebruik de "direct connection" URL voor `DIRECT_URL`

### 2.3 Genereer NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Stap 3: Vercel Deployment

### 3.1 Vercel CLI installeren (optioneel)
```bash
npm i -g vercel
```

### 3.2 Deploy via GitHub (Aanbevolen)

1. **Push je code naar GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verbind met Vercel**:
   - Ga naar [vercel.com](https://vercel.com)
   - Log in met je GitHub account
   - Klik op "Import Project"
   - Selecteer je `yustboard` repository

3. **Configureer je project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build:production`
   - **Output Directory**: .next

4. **Environment Variables toevoegen**:
   Voeg deze variabelen toe in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_MAPS_API_KEY`
   - `NEWS_API_KEY`
   - `OPENWEATHER_API_KEY`

### 3.3 Database Migraties

Na de eerste deployment, run deze commando's lokaal:

```bash
# Set production environment variables
export DATABASE_URL="[JE_SUPABASE_URL]"

# Run migrations
npx prisma migrate deploy
npx prisma db seed # Als je seed data hebt
```

Of gebruik de Vercel CLI:
```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Stap 4: Custom Domain Setup

### 4.1 In Vercel
1. Ga naar je project in Vercel
2. Ga naar Settings → Domains
3. Voeg `yustboard.yustintroost.nl` toe

### 4.2 DNS Configuratie
Voeg deze records toe bij je DNS provider:

**Voor subdomain**:
```
Type: CNAME
Name: yustboard
Value: cname.vercel-dns.com
```

**Of voor A records**:
```
Type: A
Name: yustboard
Value: 76.76.21.21
```

## Stap 5: Google OAuth Update

Update je Google Cloud Console:
1. Ga naar [Google Cloud Console](https://console.cloud.google.com)
2. Selecteer je project
3. Ga naar APIs & Services → Credentials
4. Update je OAuth 2.0 Client:
   - **Authorized JavaScript origins**: 
     - `https://yustboard.yustintroost.nl`
     - `https://yustboard.vercel.app`
   - **Authorized redirect URIs**:
     - `https://yustboard.yustintroost.nl/api/auth/callback/google`
     - `https://yustboard.vercel.app/api/auth/callback/google`

## Stap 6: Post-Deployment Checklist

- [ ] Test login functionaliteit
- [ ] Check database connectie
- [ ] Verifieer alle API integraties
- [ ] Test file uploads
- [ ] Check responsive design
- [ ] Monitor Vercel logs voor errors

## Troubleshooting

### Database Connection Issues
- Check of je de juiste connection string gebruikt
- Verifieer dat je IP niet geblokkeerd is in Supabase

### Build Failures
- Check de Vercel build logs
- Zorg dat alle dependencies in package.json staan
- Verifieer environment variables

### Authentication Issues
- Check NEXTAUTH_URL matches je deployment URL
- Verifieer Google OAuth redirect URLs
- Check NEXTAUTH_SECRET is correct

## Monitoring

### Vercel Dashboard
- Real-time logs
- Performance metrics
- Error tracking

### Supabase Dashboard
- Database metrics
- Query performance
- Storage usage

## Updates Deployen

Elke push naar `main` branch triggert automatisch een nieuwe deployment:

```bash
git add .
git commit -m "Update features"
git push origin main
```

## Kosten Overzicht

### Gratis Limieten
- **Vercel**: 100GB bandwidth/maand, unlimited deployments
- **Supabase**: 500MB database, 1GB file storage, 2GB bandwidth

Voor een persoonlijk dashboard zijn deze limieten ruim voldoende!