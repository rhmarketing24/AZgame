# Tap A → Z Rush (Final)

This is a ready-to-deploy Next.js (Pages Router) mini-app with Supabase integration and Base MiniApp-ready metadata.

## What is included
- Game: A→Z tap speed game with countdown, timer, correct/wrong feedback.
- Leaderboard: saves and shows top scores (server API using Supabase service role key).
- Public `.well-known` files for Base verification / Minikit.
- Manifest for MiniApp.
- `lib/supabase.js` (client) uses NEXT_PUBLIC_* env vars.
- API routes use SUPABASE_SERVICE_ROLE_KEY securely.

## Required Environment Variables (Vercel)
- NEXT_PUBLIC_SUPABASE_URL (= your Supabase project URL)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (= public anon key)
- SUPABASE_SERVICE_ROLE_KEY (= service role key — server only)

Set these in Vercel (Production & Preview) and redeploy.

## How to use
1. Upload this repository content to your GitHub repo (delete old files).
2. Connect repo to Vercel, set environment variables, deploy.
3. Visit your Vercel URL (e.g. https://a-zgame.vercel.app).
4. To verify as Base MiniApp, copy verification token into `public/.well-known/base-verify.txt` or add required meta as instructed by Base.

## Notes
- Do NOT expose the `SUPABASE_SERVICE_ROLE_KEY` publicly.
- You can replace the placeholder icons (`public/icon-192.png`, `public/icon-512.png`) later.
- Default username detection tries to read host-provided variables; fallback username is **rhmarketing24**.

