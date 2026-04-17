# LINE OAuth2 Keys Exposed — Security TODO

## Issue

GitGuardian alert (2026-04-14): LINE Messaging OAuth2 Keys exposed in public repo `aipmtw/markluce-ai`.

Once credentials are in git history, they are compromised — even if the commit is deleted or the repo goes private. Bots and scrapers harvest leaked keys within minutes.

## Steps to Fix

### 1. Rotate credentials immediately (LINE Developers Console)

Go to https://developers.line.biz/console/ → select the channel → issue new credentials:

- **Channel Secret**: Channel settings → Issue new secret
- **Channel Access Token (Messaging API)**: Messaging API tab → Issue new long-lived token, then revoke the old one
- **LIFF**: LIFF apps themselves don't have secrets (LIFF ID is public), so no rotation needed there

### 2. Update credentials in your deploy environment

Wherever these keys are used (Vercel env vars, .env files, Supabase Edge Functions, etc.):

- Update `LINE_CHANNEL_SECRET` with the new secret
- Update `LINE_CHANNEL_ACCESS_TOKEN` with the new token
- Redeploy any services that use them

Files in this repo that reference LINE credentials:
- `api/line-auth.js` — uses LINE_CHANNEL_ID and LINE_CHANNEL_SECRET
- Check Supabase Edge Functions for any hardcoded values

### 3. Remove credentials from git history

Option A (easiest if repo is small):
```bash
# Use git-filter-repo to purge the file/commits containing secrets
pip install git-filter-repo
git filter-repo --replace-text <(echo 'OLD_SECRET_VALUE==>REDACTED')
git push --force
```

Option B (nuclear — if repo can be recreated):
- Delete the repo on GitHub
- Re-create with a clean history

### 4. Move secrets to environment variables

Never hardcode secrets in source code. Use:
- **Vercel**: Settings → Environment Variables
- **Supabase**: Edge Function secrets (`supabase secrets set`)
- **Local dev**: `.env` file (already in `.gitignore`)

Check that `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

### 5. Verify no unauthorized usage

In LINE Developers Console, check:
- Recent API call logs — any unexpected calls?
- Webhook URL — has it been changed?
- Linked LINE Official Account — still correct?

### 6. Dismiss GitGuardian alert

After rotating, go to GitGuardian dashboard and mark the incident as resolved.

## Priority

HIGH — do steps 1-2 today, steps 3-6 this week.
