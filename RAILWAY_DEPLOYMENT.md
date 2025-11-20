# Railway Deployment Guide - IU Methodist EMS Dashboard

This comprehensive emergency tracking dashboard combines helicopter monitoring and AI-powered dispatch call analysis, designed for 24/7 TV display in emergency operations centers.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository with this code
- **Node.js 20+** (automatically configured via `.node-version` file)
- OpenAI API key (standard OpenAI account, not Replit AI Integrations)
- FlightRadar24 API key
- NocoDB instance with dispatch call data

## Important: OpenAI Configuration Update

⚠️ **This app currently uses Replit AI Integrations**. Before deploying to Railway, you must update the OpenAI configuration:

### Update `server/routes.ts` (Line 247-250):

**Change from:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});
```

**To:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

## Required Environment Variables

Set these in Railway dashboard under **Variables** tab:

### API Keys & External Services

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `FLIGHTRADAR24_API_KEY` | FlightRadar24 API authentication | https://www.flightradar24.com/premium |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini | https://platform.openai.com/api-keys |
| `NOCODB_BASE_URL` | NocoDB instance URL | Your NocoDB deployment (e.g., `https://nocodb-production.up.railway.app`) |
| `NOCODB_API_TOKEN` | NocoDB API authentication token | NocoDB Account Settings → Tokens |
| `NOCODB_TABLE_ID` | View ID for dispatch calls | `vwwf41cmlhx8atps` (or your custom view ID) |
| `SESSION_SECRET` | Session encryption key | Generate random string (e.g., `openssl rand -base64 32`) |
| `NODE_ENV` | Production environment | `production` |

### Environment Variable Setup Example

```env
FLIGHTRADAR24_API_KEY=your_fr24_api_key_here
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
NOCODB_BASE_URL=https://nocodb-production-9a14.up.railway.app
NOCODB_API_TOKEN=your_nocodb_token_here
NOCODB_TABLE_ID=vwwf41cmlhx8atps
SESSION_SECRET=your_random_secret_string_here
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Update OpenAI configuration** (see above)
   - Edit `server/routes.ts` to use standard OpenAI client
   - Commit the change

2. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Railway deployment"
   git push origin main
   ```

3. **Create Railway project**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Node.js app

4. **Configure environment variables**
   - In Railway dashboard, select your service
   - Go to "Variables" tab
   - Click "Add Variable" and add all required variables above
   - Or use "Raw Editor" to paste all variables at once

5. **Deploy**
   - Railway will automatically build and deploy
   - Build process runs: `npm install && npm run build`
   - Start command runs: `npm run start`
   - Monitor deployment in "Deployments" tab

6. **Get your public URL**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain" for Railway subdomain
   - Access your dashboard at `https://your-app.railway.app`

### Option 2: Deploy using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set environment variables**
   ```bash
   railway variables set FLIGHTRADAR24_API_KEY=your_key
   railway variables set OPENAI_API_KEY=sk-proj-xxxxx
   railway variables set NOCODB_BASE_URL=https://your-nocodb.railway.app
   railway variables set NOCODB_API_TOKEN=your_token
   railway variables set NOCODB_TABLE_ID=vwwf41cmlhx8atps
   railway variables set SESSION_SECRET=$(openssl rand -base64 32)
   railway variables set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Application Architecture

### Build Process

Railway automatically executes:

1. **Install dependencies**: `npm install`
2. **Build application**: `npm run build`
   - Frontend: Vite builds React app to `dist/client`
   - Backend: esbuild bundles Express server to `dist/index.js`
3. **Start server**: `npm run start` (runs `node dist/index.js`)

### Port Configuration

Railway automatically sets `PORT` environment variable. App listens on `process.env.PORT || 5000`.

### Key Features

- **Split-screen dashboard**: Helicopter map (left) + EMS calls (right)
- **AI-powered chief complaints**: GPT-4o-mini extracts medical terminology
- **Real-time updates**: Auto-refresh every 15 seconds
- **TV-optimized design**: Large fonts, high contrast, dark theme
- **Smooth animations**: Helicopter position interpolation and flight trails

## NocoDB Configuration

### Expected Data Schema

Your NocoDB table should have:
- `id` (number): Unique call identifier
- `timestamp` (string, optional): Call timestamp (ISO 8601 format)
- `conversation_analysis` (JSON, optional): Object containing:
  - `summary` (string): Call summary text
  - `generatedAt` (string): Analysis timestamp

### View Configuration

- Default view ID: `vwwf41cmlhx8atps`
- Default table ID: `meycc68yjf4w0hj`
- The app uses view-based filtering for flexible data access

## Cost Estimates

### Railway
- **Starter Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (unlimited hours)
- Expected usage: ~$5-10/month for 24/7 operation

### External APIs
- **OpenAI API**: ~$0.50-2/month (GPT-4o-mini is very cheap)
  - Chief complaint extraction: ~$0.0001-0.0003 per call
  - Typical volume: 1000-5000 calls/month
- **FlightRadar24**: Varies by plan (check their pricing)
- **NocoDB**: Free (self-hosted) or Railway hosting (~$5-10/month)

## Custom Domain (Optional)

1. In Railway dashboard → "Settings" → "Networking"
2. Click "Custom Domain"
3. Add your domain (e.g., `ems.iumethodist.org`)
4. Update DNS records as instructed
5. Railway automatically provisions SSL certificate

## Monitoring & Troubleshooting

### View Logs
```bash
railway logs
```

Or in Railway dashboard → "Deployments" → Select deployment → "View Logs"

### Common Issues

**Build Fails**
- Check Node.js version compatibility (app **requires Node 20+** due to `import.meta.dirname` usage)
- The `.node-version` file in the repository ensures Railway uses Node 20
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

**App Crashes on Startup**
- Ensure all environment variables are set correctly
- Check `OPENAI_API_KEY` format (starts with `sk-proj-` or `sk-`)
- Verify NocoDB URL is accessible from Railway

**OpenAI Errors**
- Confirm you updated `server/routes.ts` to use standard OpenAI client
- Check OpenAI API key validity at https://platform.openai.com/api-keys
- Verify OpenAI account has available credits

**No Helicopters Showing**
- FlightRadar24 API returns only helicopters in Indianapolis area
- May be zero helicopters at certain times (this is normal)
- Check FlightRadar24 API key validity and rate limits

**Chief Complaints Not Extracting**
- Check OpenAI API logs for errors
- Verify `conversation_analysis.summary` exists in NocoDB data
- Review browser console for API errors

**Map Not Loading**
- Leaflet requires HTTPS in production (Railway provides this)
- Check browser console for tile loading errors
- Verify map component is receiving helicopter data

### Health Check

Test your deployment:
```bash
curl https://your-app.railway.app/api/helicopters
curl https://your-app.railway.app/api/dispatch-calls
```

## Performance Optimization

### Caching Strategy
- Chief complaints: Cached forever (staleTime: Infinity)
- Helicopter data: Auto-refresh every 15 seconds
- Dispatch calls: Auto-refresh every 15 seconds

### Production Considerations
- Railway auto-scales based on traffic
- App uses minimal resources (optimized for 24/7 operation)
- Consider monitoring OpenAI API usage in production

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **OpenAI API Status**: https://status.openai.com
- **FlightRadar24 Support**: https://www.flightradar24.com/contact-us

## Next Steps After Deployment

1. ✅ Verify all environment variables are set
2. ✅ Test helicopter tracking (may show 0 helicopters - normal)
3. ✅ Test EMS call display and AI extraction
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring/alerting (Railway provides metrics)
6. ✅ Display on TV in dispatch center

## Questions?

Contact your development team or create an issue in your GitHub repository.
