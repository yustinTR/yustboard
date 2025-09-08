# YustBoard Deployment Guide

This comprehensive guide covers deployment options for YustBoard.

## Table of Contents
- [Vercel + Supabase Deployment](#vercel--supabase-deployment)
- [Plesk VPS Deployment](#plesk-vps-deployment)

---

# Vercel + Supabase Deployment

Deploy YustBoard naar Vercel met Supabase als database (gratis tier).

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

## Troubleshooting Vercel

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

---

# Plesk VPS Deployment

Deploy YustBoard op je Plesk VPS op domein `yustboard.yustintroost.nl`.

## Voorbereidingen

### 1. Lokale Build Test
Test eerst lokaal of je applicatie correct build:
```bash
npm run build
npm start
```

### 2. Environment Variabelen
Maak een `.env.production` bestand aan met je productie configuratie:
```env
DATABASE_URL="postgresql://[DB_USER]:[DB_PASS]@localhost:5432/[DB_NAME]"
NEXTAUTH_URL=https://yustboard.yustintroost.nl
NEXTAUTH_SECRET=[GENEREER_NIEUWE_SECRET]
GOOGLE_CLIENT_ID=[JE_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[JE_GOOGLE_CLIENT_SECRET]
GOOGLE_MAPS_API_KEY=[JE_MAPS_API_KEY]
NEWS_API_KEY=[JE_NEWS_API_KEY]
OPENWEATHER_API_KEY=[JE_WEATHER_API_KEY]
```

**Belangrijk:** Genereer een nieuwe NEXTAUTH_SECRET met:
```bash
openssl rand -base64 32
```

## Stappen op Plesk VPS

### 1. Domein Setup in Plesk
1. Log in op je Plesk dashboard
2. Ga naar "Websites & Domains"
3. Klik op "Add Domain" of "Add Subdomain"
4. Voer `yustboard.yustintroost.nl` in
5. Selecteer de juiste service plan

### 2. Node.js Installatie
1. Ga naar je domein in Plesk
2. Klik op "Node.js"
3. Klik op "Enable Node.js"
4. Selecteer Node.js versie 18.x of hoger
5. Stel het Application Root in naar je project directory

### 3. Database Setup
1. Ga naar "Databases" in Plesk
2. Klik op "Add Database"
3. Maak een PostgreSQL database aan
4. Noteer de database credentials

### 4. Project Upload
Upload je project naar de server via een van deze methoden:

#### Optie A: Via Git (Aanbevolen)
1. SSH naar je server:
   ```bash
   ssh [username]@[server-ip]
   ```
2. Ga naar je domein directory:
   ```bash
   cd /var/www/vhosts/yustintroost.nl/yustboard.yustintroost.nl
   ```
3. Clone je repository:
   ```bash
   git clone https://github.com/yustinTR/yustboard.git .
   ```

#### Optie B: Via Plesk File Manager
1. Ga naar "File Manager" in Plesk
2. Upload je project bestanden (exclusief node_modules en .next)

### 5. Applicatie Configuratie

1. Maak een `.env.production` bestand aan in je project root met de juiste productie waarden

2. Installeer dependencies:
   ```bash
   npm install
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Build de applicatie:
   ```bash
   npm run build
   ```

### 6. Plesk Node.js Configuratie
1. Ga naar Node.js settings voor je domein
2. Configureer:
   - **Application Root**: `/httpdocs` (of waar je project staat)
   - **Application Startup File**: `node_modules/.bin/next`
   - **Application Mode**: `production`

3. Voeg deze environment variabelen toe in Plesk:
   - Alle variabelen uit je `.env.production`
   - `NODE_ENV=production`
   - `PORT=3000`

4. Voeg dit NPM script toe als "Run script":
   ```
   start
   ```

### 7. Nginx Configuratie
Voeg deze regels toe aan je Nginx configuratie in Plesk (onder "Apache & nginx Settings"):

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /_next/static {
    alias /var/www/vhosts/yustintroost.nl/yustboard.yustintroost.nl/.next/static;
    expires 365d;
    add_header Cache-Control "public, immutable";
}

location /public {
    alias /var/www/vhosts/yustintroost.nl/yustboard.yustintroost.nl/public;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 8. SSL Certificaat
1. Ga naar "SSL/TLS Certificates"
2. Installeer een Let's Encrypt certificaat voor je domein

### 9. Start de Applicatie
1. Ga terug naar Node.js settings
2. Klik op "Restart App"
3. Check de logs voor eventuele errors

## Updates Deployen

Voor toekomstige updates:

```bash
# SSH naar server
ssh [username]@[server-ip]
cd /var/www/vhosts/yustintroost.nl/yustboard.yustintroost.nl

# Pull laatste changes
git pull origin main

# Install nieuwe dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Build applicatie
npm run build

# Restart via Plesk Node.js panel
```

## Troubleshooting Plesk

### Applicatie start niet
- Check de Node.js logs in Plesk
- Verifieer dat alle environment variabelen correct zijn ingesteld
- Check of de database connectie werkt

### 502 Bad Gateway
- Controleer of de Node.js app draait
- Check de Nginx configuratie
- Verifieer dat poort 3000 wordt gebruikt

### Database connectie errors
- Check DATABASE_URL format
- Verifieer database credentials
- Zorg dat PostgreSQL draait

### Build errors
- Zorg voor voldoende RAM tijdens build (minimaal 1GB)
- Check Node.js versie compatibiliteit
- Verwijder .next folder en probeer opnieuw

## Monitoring
- Gebruik Plesk's monitoring tools
- Check regelmatig de Node.js logs
- Monitor resource gebruik (CPU/RAM)