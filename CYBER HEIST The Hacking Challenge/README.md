# CYBER HEIST

A mobile-first cybersecurity training simulation built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide, Howler, and Supabase. Players work through challenges in an isolated simulated terminal; answers and scores are verified by a Supabase Edge Function, and challenge answers stay in the database.

## Requirements

- Node.js 20.19+ or 22.12+
- A Supabase project
- Supabase CLI for migrations and Edge Function deployment

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
```

Set the project URL and publishable key in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Install the Supabase CLI, authenticate, and link the project:

```powershell
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push --remote
```

The migration creates the challenge bank, sessions, answer records, admin profiles, a safe public leaderboard table, RLS policies, rate-limit storage, and server-side scoring functions. Challenge answers are not readable by anonymous clients.

Set Edge Function secrets; never put the service-role key in a `VITE_` variable or browser code:

```powershell
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npx supabase secrets set SUPABASE_ANON_KEY=your-publishable-or-anon-key
npx supabase secrets set ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-domain.vercel.app
npx supabase functions deploy game-api --no-verify-jwt
```

The function validates admin JWTs itself. `--no-verify-jwt` is required because guest players call the same endpoint without signing in; administrator actions still require a valid authenticated user with an `admin_profiles` row.

Create an administrator in Supabase Auth, then grant the account access from the SQL Editor:

```sql
insert into public.admin_profiles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@example.com';
```

Start the app:

```powershell
npm run dev
```

Without Supabase configuration, the landing page remains available and clearly marks the backend as unconfigured; starting verified games, displaying scores, and admin sign-in require a configured project.

## In-game simulation

The terminal accepts only in-game commands; it never executes shell commands or connects to real targets. Each objective uses this flow:

1. `scan` maps a fictional training node.
2. `inspect` opens the evidence packet.
3. `analyze <finding>` (or `submit <finding>`) sends the finding for server-side validation. Letter shortcuts such as `analyze A` work when candidates are listed.
4. `hint` requests one hint for a 25-point penalty; `next` loads the next objective once the current one is resolved.

Use `help` to see commands, `status` to check the run, and `clear` to clear the terminal log.

## Database and Edge Function

- Migration: `supabase/migrations/20261114000100_cyber_heist.sql`
- Edge Function: `supabase/functions/game-api/index.ts`
- Public game sessions receive a random bearer token; only its SHA-256 hash is persisted.
- Rate limits are applied server-side, with a tighter limit for session creation.
- Game answers are checked in a transaction under a session lock. Duplicate request IDs are idempotent and scores cannot be submitted by the browser.
- The leaderboard table contains only public score fields and is subscribed to through Supabase Realtime.
- All-time and daily leaderboard points accumulate across completed runs for the same case-insensitive username; the fastest filter shows each username's best single run.
- Admin actions check Supabase Auth and the `admin_profiles` role before accessing private data.

After changing the migration or function:

```powershell
npx supabase db push --remote
npx supabase functions deploy game-api --no-verify-jwt
```

## Validation

```powershell
npm run lint
npm run build
```

## Vercel deployment

1. Import the project into Vercel and use the Vite preset.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel project environment.
3. Add the production and preview origins to the Supabase `ALLOWED_ORIGINS` secret.
4. Deploy the database migration and Edge Function to Supabase.
5. Redeploy the Vercel frontend after setting environment variables.

Only the Supabase publishable key belongs in frontend environment variables. Keep the Supabase service-role key exclusively in Edge Function secrets.
