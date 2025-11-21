# Railway Deployment Checklist ✅

## Pre-Deployment Steps

- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Get FlightRadar24 API key (if not already obtained)
- [ ] Verify NocoDB instance is accessible
- [ ] Push code to GitHub repository

## Railway Setup

- [ ] Create Railway account at https://railway.app
- [ ] Create new project from GitHub repo
- [ ] Add environment variables (see below)

## Environment Variables to Set

Copy these into Railway's "Variables" section (use "Raw Editor" for quick paste):

```env
FLIGHTRADAR24_API_KEY=your_fr24_key_here
OPENAI_API_KEY=sk-proj-your_openai_key_here
NOCODB_BASE_URL=https://your-nocodb-instance.railway.app
NOCODB_API_TOKEN=your_nocodb_token_here
NOCODB_TABLE_ID=your_ID_here
SESSION_SECRET=your_random_secret_here
NODE_ENV=production
```

## Generate Session Secret

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Post-Deployment Verification

- [ ] Check deployment logs for errors
- [ ] Visit your Railway URL (e.g., `https://your-app.railway.app`)
- [ ] Verify helicopter map loads (may show 0 helicopters - normal)
- [ ] Verify EMS calls display with AI-extracted chief complaints
- [ ] Test in fullscreen mode on TV display

## Optional: Custom Domain

- [ ] Go to Railway Settings → Networking
- [ ] Add custom domain (e.g., `ems.iumethodist.org`)
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate provisioning (~5 minutes)

## Cost Monitoring

Expected monthly costs:
- Railway: $5-10/month (24/7 operation)
- OpenAI API: $0.50-2/month (GPT-4o-mini is very cheap)
- Total: ~$6-12/month

## Support

Need help? Check:
- `RAILWAY_DEPLOYMENT.md` for detailed instructions
- Railway logs for error messages
- Browser console for frontend issues

## Notes

✅ **Code is already configured** to support both Replit and Railway deployments
- Uses `OPENAI_API_KEY` when `AI_INTEGRATIONS_OPENAI_API_KEY` is not available
- No code changes needed - just set environment variables!
