# Deployment Guide voor Yustboard op Plesk VPS

Deze guide helpt je bij het deployen van je Next.js applicatie naar je Plesk VPS op domein `yustboard.yustintroost.nl`.

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

## Troubleshooting

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