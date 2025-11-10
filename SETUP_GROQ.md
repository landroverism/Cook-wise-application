# Setting up Groq API Key for Convex

## Quick Setup

The error you're seeing means the `GROQ_API_KEY` environment variable is not set in your Convex deployment.

### Step 1: Get your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key

### Step 2: Set the API Key in Convex

**Option A: Using the setup script (recommended)**

1. Make sure your `.env.local` file contains your actual API key:
   ```bash
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

2. Run the setup script:
   ```bash
   npm run setup:groq
   ```

**Option B: Set it directly via Convex CLI**

```bash
npx convex env set GROQ_API_KEY gsk_your_actual_api_key_here
```

Replace `gsk_your_actual_api_key_here` with your actual Groq API key.

### Step 3: Verify it's set

Check if the environment variable is set:
```bash
npx convex env list
```

You should see `GROQ_API_KEY` in the list.

### Step 4: Test it

1. Restart your Convex dev server if it's running
2. Try generating an AI recipe again

## Troubleshooting

- **"GROQ_API_KEY is not configured"**: Make sure you ran `npx convex env set GROQ_API_KEY <your_key>`
- **"Invalid API key"**: Double-check your API key is correct
- **Still not working**: Make sure your Convex dev server is restarted after setting the environment variable

## Important Notes

- The `.env.local` file is for local development reference only
- Convex requires environment variables to be set separately using `npx convex env set`
- Environment variables set via CLI are stored securely in Convex cloud
- You need to set this for each deployment (dev, preview, prod)

