# MeetPol
Job-matching platform: React + TypeScript + Vite, React Three Fiber (3D), Supabase (Postgres, Auth, RLS), deployed on Vercel.
Choice: no custom Node server. Supabase is the backend and RLS enforces security, which suits Vercel's static hosting (Node/npm is the toolchain).

## Tables
profiles(id PK→auth.users, role, onboarded) · applicants(id PK, user_id UNIQUE→auth.users) · postings(id PK, employer_id→auth.users) · site_settings(key PK)

## Setup
1. **Supabase**: Dashboard > SQL Editor > paste `supabase/schema.sql` > Run.
2. **Env**: `cp .env.example .env` and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. `npm install && npm run dev`.
3. **Google sign-in**: Google Cloud Console > APIs & Services > Credentials > OAuth client ID (Web). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`. In Supabase > Authentication > Providers > Google: enable, paste Client ID/Secret. Then Authentication > URL Configuration: set Site URL to your Vercel URL and add `http://localhost:5173/**` and `https://<your-app>.vercel.app/**` to Redirect URLs.
4. **Admin**: sign in once with Google (pick any role), then in SQL Editor run:
   `update public.profiles set role='admin', onboarded=true where email='you@gmail.com';` Reload — an Admin link appears.
5. **Vercel**: push to GitHub > vercel.com > Add New Project > import repo (Vite preset auto-detected) > add the two env vars > Deploy. `vercel.json` handles SPA routing.
