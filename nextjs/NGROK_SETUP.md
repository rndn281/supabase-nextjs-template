# Expose Local Next.js App with ngrok

## Install ngrok

1. Download ngrok: https://ngrok.com/download
2. Extract to a folder (e.g., `C:\ngrok`)
3. Sign up for free account: https://dashboard.ngrok.com/signup
4. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
5. Run in terminal:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

## Start the Tunnel

1. Make sure Next.js is running:
   ```bash
   cd nextjs
   yarn dev
   ```

2. In a NEW terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

3. You'll see output like:
   ```
   Session Status                online
   Account                       your@email.com
   Version                       3.x.x
   Region                        Europe (eu)
   Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
   ```

4. Copy the `https://` URL (e.g., `https://abc123.ngrok-free.app`)

## Update Power Automate

1. Open your Power Automate flow
2. Find the HTTP action
3. Update settings:
   - **URI**: `https://abc123.ngrok-free.app/api/flights` (use YOUR ngrok URL)
   - **Method**: `POST`
   - **Headers**: Only `Content-Type: application/json`
   - **Remove** these headers if present:
     - `apikey`
     - `Authorization`
     - `Prefer`
   - **Body**: Keep the same JSON format

4. Save and test the flow

## Important Notes

- ⚠️ The ngrok URL changes each time you restart ngrok (unless you have a paid plan)
- ⚠️ Keep both terminals running (Next.js dev server + ngrok)
- ✅ This is for development/testing only
- ✅ For production, deploy to Vercel/Netlify and use that URL
