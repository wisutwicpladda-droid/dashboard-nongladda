# Admin CRM Dashboard Runbook

## Local app

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `npm run dev`.
4. Open the local URL from Vite.

Demo data is available only when local Vite development explicitly sets
`VITE_ENABLE_DEMO=true`. Production fails closed when Supabase configuration is
missing or a query fails.

## Supabase Edge Function

Manual LINE replies go through `supabase/functions/ladda-manual-reply`.

Required Supabase function secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `DASHBOARD_ALLOWED_ORIGIN`

Deploy after secrets are set:

```powershell
npm exec supabase -- functions deploy ladda-manual-reply --project-ref fwzdgzpuajcsigwlyojr
```

## Admin behavior

- The browser uses the Supabase anon key and User JWT only.
- Admins read CRM data through RLS.
- Claiming a conversation calls `ladda_claim_conversation`.
- While a conversation is in manual mode, Hermes/bot reply guards should not send an automatic answer for that conversation.
- Sending a manual reply calls the Edge Function, which uses server-side credentials to push to LINE and record the outbound message.

## Production state

- Site URL: `https://dashboard.srv1651337.hstgr.cloud`
- Authentication: email magic link; Azure login remains disabled until its
  client credential is configured.
- Admin access: active rows in `Ladda_admin_profiles` only.
- Edge Function: deploy with JWT verification enabled.
- Frontend: build `compose.production.yml` with the public Supabase key supplied
  through the server-only `.env.production` file.
