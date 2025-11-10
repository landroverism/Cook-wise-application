# Cookwise Recipe Sharing App
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`whimsical-mammoth-823`](https://dashboard.convex.dev/d/whimsical-mammoth-823).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## AI Recipe Generation (Groq API Setup)

This app uses Groq API for AI-powered recipe generation. To set it up:

1. **Add your Groq API key to `.env.local`**:
   ```bash
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

2. **Sync the API key to Convex**:
   ```bash
   npm run setup:groq
   ```
   
   Or manually:
   ```bash
   npx convex env set GROQ_API_KEY your_actual_groq_api_key_here
   ```

3. **Get your Groq API key**: Sign up at [console.groq.com](https://console.groq.com) and create an API key.

The AI recipe generation will automatically use the Groq API once the environment variable is set in Convex.
