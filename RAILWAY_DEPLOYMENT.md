# Railway Deployment Guide

This hospital dispatch dashboard is designed to be deployed on Railway with seamless GitHub integration.

## Required Environment Variables

Configure the following environment variables in your Railway project settings:

### NocoDB Connection

| Variable | Description | Example |
|----------|-------------|---------|
| `NOCODB_BASE_URL` | Base URL of your NocoDB instance | `https://nocodb-production-9a14.up.railway.app` |
| `NOCODB_API_TOKEN` | NocoDB API authentication token | Generate from Account Settings → Tokens |
| `NOCODB_TABLE_ID` | View ID for dispatch calls data | `vwwf41cmlhx8atps` |

### Session Management (Optional)

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret key for session encryption (auto-generated if not provided) |

## NocoDB Setup

### Getting Your NocoDB Credentials

1. **Base URL**: Copy your NocoDB instance URL (e.g., `https://your-instance.up.railway.app`)

2. **API Token**: 
   - Go to Account Settings in NocoDB
   - Navigate to "Tokens" section
   - Click "Add New Token"
   - Copy the token immediately (it won't be shown again)

3. **Table/View ID**:
   - This dashboard is configured to use **view ID**: `vwwf41cmlhx8atps`
   - The underlying **table ID** is: `meycc68yjf4w0hj`
   - If you need to use a different view, update the `NOCODB_TABLE_ID` variable

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Hospital dispatch dashboard ready for deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 3. Configure Environment Variables

In Railway project settings, add all required environment variables listed above.

### 4. Deploy

Railway will automatically:
- Install dependencies
- Build the application
- Start the server
- Assign a public URL

## Application Features

- **Real-time Updates**: Auto-refreshes every 15 seconds
- **TV-Optimized Display**: Large text, high contrast, readable from distance
- **Recent Calls Section**: Shows the 10 most recent dispatch calls
- **Call History**: Sortable table of older calls
- **Responsive Design**: Optimized for large TV displays (1920x1080 or 4K)

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Data Source**: NocoDB API v2
- **State Management**: React Query with 15s polling

## Troubleshooting

### Connection Errors

- Verify `NOCODB_BASE_URL` is correct and accessible
- Check that `NOCODB_API_TOKEN` is valid
- Ensure `NOCODB_TABLE_ID` (view ID) exists in your NocoDB instance

### No Data Displayed

- Confirm the NocoDB view has records
- Check that the view ID `vwwf41cmlhx8atps` is correct
- Verify table structure matches expected schema (id, timestamp, conversation_analysis)

### Deployment Issues

- Check Railway logs for error messages
- Ensure all environment variables are set
- Verify the build completed successfully

## Support

For issues or questions:
- Check Railway deployment logs
- Verify NocoDB API connectivity
- Review browser console for frontend errors
