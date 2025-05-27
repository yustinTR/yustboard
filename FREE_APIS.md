# Gratis API's voor YustBoard

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

## Google APIs (Gratis quota's)
De volgende Google APIs hebben gratis quota's:

### Google Calendar API
- **Gratis quota**: 1,000,000 requests per dag
- **Setup**: Via Google Cloud Console

### Google Drive API
- **Gratis quota**: 1,000,000,000 requests per dag
- **Setup**: Via Google Cloud Console

### Gmail API
- **Gratis quota**: 250 quota units per gebruiker per seconde
- **Setup**: Via Google Cloud Console

### Google Fit API
- **Gratis quota**: 150,000 requests per dag
- **Setup**: Via Google Cloud Console
- **Note**: Gebruikers moeten opnieuw inloggen voor Fitness permissions

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

3. **Google APIs**:
   - Zie `SETUP_GOOGLE_APIS.md` voor complete setup

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