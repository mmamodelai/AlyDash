# Slack Integration Guide (AlyDash)

This adds an optional, lightweight bridge between AlyDash and Slack. It uses a single workspace bot token so every user runs from the same git clone without per‑user sign‑in.

Important: HIPAA
- Only use Slack that’s covered by your org’s BAA. Otherwise, do not post PHI.

## Overview
- Read messages from selected channels (poll every 30s)
- Post messages from AlyDash to Slack (via bot)
- No inbound webhooks or public callbacks required
- Feature‑flagged via `.env` so you can disable easily

## 1) Create the Slack App (Bot)
1. Sign in to the correct Slack workspace in a browser
2. Open `https://api.slack.com/apps` → “Create New App” → “From Manifest” → choose the workspace
3. Paste this manifest and create the app:
   ```yaml
   display_information:
     name: AlyDash Bridge
   features:
     bot_user:
       display_name: AlyDash Bot
       always_online: true
   oauth_config:
     scopes:
       bot:
         - chat:write
         - channels:read
         - channels:history
         - groups:read          # for private channels if needed
         - groups:history       # for private channels if needed
         - users:read           # optional (names/avatars)
   settings:
     interactivity:
       is_enabled: false
   ```
4. On the app page → “Install App” → “Install to Workspace”
5. Copy the “Bot User OAuth Token” (starts with `xoxb-`)

## 2) Invite the Bot and Collect Channel IDs
1. In each Slack channel you want AlyDash to access, run: `/invite @AlyDash Bot`
2. Get the channel IDs (format `C12345678`):
   - Open the channel in the browser; the URL often ends with the ID
   - Or run `View channel details` → `More` to see the ID

## 3) Configure AlyDash (.env)
Create (or update) your `.env` in the project root (never commit real tokens):
```
ENABLE_SLACK=true
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxx
SLACK_CHANNEL_IDS=C12345678,C23456789
```

Notes:
- `SLACK_CHANNEL_IDS` is a comma‑separated list; include private channel IDs only if the bot is invited and you granted `groups:*` scopes.
- If `ENABLE_SLACK=false` or missing, the Slack UI/bridge remains disabled.

## 4) Run Locally
```
npm install
npm start
```
Open `http://localhost:3000` → Slack tab (once the bridge is enabled).

## 5) What This Branch Will Add
- Backend endpoints (poll‑based):
  - `GET /api/slack/messages?channel=C123…` – fetch recent messages
  - `POST /api/slack/send { channel, text, thread_ts? }` – post via bot
- UI:
  - Slack tab listing configured channels
  - In composer: toggle “Post to Slack” + channel picker
  - “Open in Slack” deep‑link buttons

## 6) Security & Operational Tips
- Do not commit real tokens; use `.env` / secret stores
- Restrict bot scopes to the minimum you need
- Invite bot only to the channels required
- If you archive channels, remove their IDs from `SLACK_CHANNEL_IDS`

## 7) Troubleshooting
- 403 or not_in_channel: Invite the bot to the channel (`/invite @AlyDash Bot`)
- Missing messages from a private channel: add `groups:read` / `groups:history` scopes and re‑install
- Token errors: regenerate the bot token and update `.env`

---
This integration is optional and off by default. Remove `.env` values or set `ENABLE_SLACK=false` to disable at any time.


