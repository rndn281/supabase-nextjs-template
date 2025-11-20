# Complete Migration Guide

This guide will help you migrate from your old Supabase project to the new Next.js dashboard.

## Overview

**Old Project:** https://dvjjyzqsixrwyayvoeai.supabase.co
**New Project:** https://nidmjlkxptmplwjyuwqd.supabase.co

## Step-by-Step Migration

### Step 1: Apply Database Migration ✅

1. Go to your **NEW** Supabase project SQL Editor:
   https://supabase.com/dashboard/project/nidmjlkxptmplwjyuwqd/sql

2. Click **New Query**

3. Copy the entire contents of:
   `supabase/migrations/20251117001815_drone_flights.sql`

4. Paste into the SQL Editor

5. Click **Run** (or press Ctrl+Enter)

6. Verify success: You should see "Success. No rows returned"

7. Check the table was created:
   - Go to **Table Editor** in left sidebar
   - You should see `drone_flights` table

### Step 2: Migrate Existing Data 📦

1. Open terminal in the `nn` directory:
   ```bash
   cd "C:\Users\RaphaelDoniaNota\OneDrive - Drone Flight Academy\Documenten\Dashboard Flights\nn"
   ```

2. Run the migration script:
   ```bash
   node migrate-data.js
   ```

3. You should see output like:
   ```
   🚀 Starting data migration...
   📥 Fetching data from old Supabase project...
   ✅ Successfully fetched 1234 records from old project
   📤 Importing data to new Supabase project...
   🎉 Migration complete! Successfully migrated 1234 records.
   ```

4. Verify in Supabase dashboard:
   - Go to Table Editor
   - Click on `drone_flights` table
   - You should see all your flight records

### Step 3: Update Power Automate Flow 🔄

1. Open your Power Automate flow

2. Find the HTTP action that sends data to Supabase

3. **For Local Development Testing:**
   - Change URL to: `http://localhost:3000/api/flights`
   - Ensure Method is `POST`
   - Keep headers as `Content-Type: application/json`
   - Keep the body the same

4. **For Production (after deployment):**
   - Change URL to your production URL (e.g., `https://your-app.vercel.app/api/flights`)

5. Save the flow

6. Test the flow:
   - Click **Test** > **Manually**
   - Trigger a test event
   - Check run history - should show success (201)

### Step 4: Test the Integration ✅

#### Test the API Endpoint

1. Start the Next.js dev server:
   ```bash
   cd nextjs
   yarn dev
   ```

2. Test with curl (in a new terminal):
   ```bash
   curl -X POST http://localhost:3000/api/flights -H "Content-Type: application/json" -d "{\"drone\":\"Test Drone\",\"timestamp\":\"2025-11-17T00:00:00Z\",\"message\":\"Test flight\"}"
   ```

3. Expected response:
   ```json
   {"success":true,"message":"Flight data received and stored","id":1}
   ```

4. Verify in Supabase:
   - Check Table Editor for the new test record

#### Test Power Automate Integration

1. Trigger a real drone event (or use Power Automate test)

2. Check that data appears in new Supabase project

3. Verify no errors in Power Automate run history

### Step 5: Verify Everything Works 🎉

Checklist:
- [ ] Database migration applied successfully
- [ ] All historical data migrated to new project
- [ ] API endpoint responds to POST requests
- [ ] Power Automate flow sends to new endpoint
- [ ] New flight events appear in new Supabase project
- [ ] Next.js app runs without errors (`yarn dev`)

## Troubleshooting

### Migration Script Errors

**Error: "Cannot find module '@supabase/supabase-js'"**
```bash
cd nn
npm install @supabase/supabase-js
```

**Error: "Failed to fetch data"**
- Check old Supabase credentials in `migrate-data.js`
- Verify old project is accessible

**Error: "Failed to insert data"**
- Ensure Step 1 (migration) was completed
- Check new Supabase credentials in `migrate-data.js`

### API Endpoint Errors

**Error: "Module not found"**
- Ensure all dependencies are installed: `yarn install`

**Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Check `.env.local` file exists in `nextjs` folder
- Verify it contains all required environment variables

**Connection refused on localhost:3000**
- Make sure dev server is running: `yarn dev`
- Check no other app is using port 3000

### Power Automate Errors

**Error: "404 Not Found"**
- Verify the URL is correct
- Make sure Next.js dev server is running
- Check your network/firewall settings

**Error: "500 Internal Server Error"**
- Check Next.js console for error details
- Verify request body format matches expected format
- Check Supabase credentials

## Next Steps

After successful migration:

1. ✅ Continue building dashboard pages
2. ✅ Set up OAuth authentication
3. ✅ Deploy to production (Vercel/Netlify)
4. ✅ Update Power Automate to production URL

## Support

If you encounter issues:
1. Check the terminal output for error details
2. Check browser console (F12) for client-side errors
3. Check Supabase logs in dashboard
4. Review the troubleshooting section above
