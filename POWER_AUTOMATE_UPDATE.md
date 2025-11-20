# Power Automate Flow Update Instructions

## Overview
Update your Power Automate flow to send drone flight events to the new Next.js application instead of directly to Supabase.

## New Endpoint

**Development (Local):**
```
http://localhost:3000/api/flights
```

**Production (Once deployed):**
```
https://your-domain.com/api/flights
```

## Request Format

### Method
`POST`

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "eventId": "tAwm1NWs",
  "message": "Drone has successfully landed",
  "severity": "INFO",
  "drone": "DS-3DKC Garyp",
  "dock": "Garyp",
  "coordinates": "53.17235718, 5.99327872",
  "altitude": "0.00 m (0.00 ft) (RLT)",
  "site": "DFC Meldkamer",
  "organization": "Dronestars",
  "automation": "Landing",
  "battery": "91%",
  "flightDetails": "Mission (Garyp) - Raphael Donia Nota",
  "timestamp": "2025-11-02T17:39:47.000Z"
}
```

## Field Mapping

| Old Field | New Field | Required | Notes |
|-----------|-----------|----------|-------|
| eventId | eventId | No | Unique event identifier |
| message | message | No | Event description |
| severity | severity | No | INFO, WARNING, ERROR |
| drone | drone | **Yes** | Drone identifier |
| dock | dock | No | Dock location |
| coordinates | coordinates | No | "lat, lon" format |
| altitude | altitude | No | Altitude with units |
| site | site | No | Site name |
| organization | organization | No | Organization name |
| automation | automation | No | Automation type |
| battery | battery | No | Battery percentage |
| flightDetails | flightDetails | No | Flight details |
| timestamp | timestamp | **Yes** | ISO 8601 format |

## Update Steps

### Option 1: Update Existing HTTP Action

1. Open your Power Automate flow
2. Find the **HTTP** action that sends to Supabase
3. Update the **URI** to: `http://localhost:3000/api/flights` (or your production URL)
4. Ensure **Method** is `POST`
5. Keep the **Headers** as:
   ```
   Content-Type: application/json
   ```
6. Keep the **Body** the same format as before
7. Save and test the flow

### Option 2: Replace Supabase Action with HTTP Action

If you're using a Supabase connector:

1. Delete the Supabase action
2. Add a new **HTTP** action
3. Configure as shown above
4. Save and test

## Testing

### Test Locally (Development)

1. Ensure Next.js is running:
   ```bash
   cd nextjs
   yarn dev
   ```

2. Send a test POST request:
   ```bash
   curl -X POST http://localhost:3000/api/flights \
     -H "Content-Type: application/json" \
     -d '{
       "drone": "Test Drone",
       "timestamp": "2025-11-17T00:00:00.000Z",
       "message": "Test flight",
       "organization": "Test Org"
     }'
   ```

3. Expected response:
   ```json
   {
     "success": true,
     "message": "Flight data received and stored",
     "id": 123
   }
   ```

### Test from Power Automate

1. Use the **Test** button in Power Automate
2. Check the run history
3. Verify the HTTP action returns status `201`
4. Check your Supabase dashboard to see the new record

## Troubleshooting

### Error: "Missing required fields"
- Ensure `drone` and `timestamp` are present in the request body
- Check that `timestamp` is in ISO 8601 format

### Error: "Failed to insert flight data"
- Verify the migration has been applied (drone_flights table exists)
- Check Supabase credentials in `.env.local`
- Ensure RLS policies allow insertion

### Connection Refused (Local Development)
- Make sure Next.js dev server is running (`yarn dev`)
- Verify the port is 3000
- Check firewall settings

## Production Deployment

Once you deploy the Next.js app (Vercel, Netlify, etc.):

1. Get your production URL
2. Update Power Automate flow with production URL
3. Test the integration
4. Monitor the logs in your hosting platform

## Benefits of New Endpoint

✅ **Validation**: Request validation before inserting to database
✅ **Error Handling**: Better error messages and logging
✅ **Flexibility**: Can add custom logic (notifications, webhooks, etc.)
✅ **Security**: Controlled access through API route
✅ **Monitoring**: Track all incoming flight events
