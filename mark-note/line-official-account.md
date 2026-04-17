# LINE Official Account — MarkLuce馬克路思

## Account Info

- Billing email: caotunspring@gmail.com
- Account name: MarkLuce馬克路思
- LINE ID: @markluce
- Plan: 輕用量 (free tier)
- Premium ID: billed via Apple subscription at $1,090/年

## Management URLs

- LINE Official Account Manager: https://manager.line.biz/
- LINE Developers Console: https://developers.line.biz/console/
- LINE Official Account — Rich Menu editor: https://manager.line.biz/account/@markluce/richmenu
- LINE Official Account — Auto-reply (bot): https://manager.line.biz/account/@markluce/response
- LINE Official Account — Messaging API settings: https://manager.line.biz/account/@markluce/setting/messaging-api

## Related Accounts

- Supabase project owner: markluceai@gmail.com (separate from LINE billing)

## Security Alert

- GitGuardian alert (2026-04-14): LINE Messaging OAuth2 Keys exposed in aipmtw/markluce-ai
- ACTION NEEDED: rotate those credentials if not already done

## Plan: LINE Official Account + Bot for app.markluce.ai

### Goals

1. **Rich Menu（圖文選單）**: When users add @markluce as friend, show a designed menu with:
   - Link to app.markluce.ai storybook
   - Featured books / current issue
   - Subscription info
   - Customer support

2. **Auto-reply Bot**: Basic chatbot for:
   - Welcome message when user adds friend
   - Introduce app.markluce.ai and what it offers
   - Guide users to open storybooks (send LIFF URL for seamless login)
   - Answer common questions (pricing, how to read offline, etc.)

3. **Integration with Storybook App**:
   - Send LIFF URLs in bot messages → user taps → auto-login → read storybook
   - Push notifications for new monthly issues
   - Share QR codes in LINE chat → long-press → auto-login (see line-login-seamless-mobile feature)

### Technical Notes

- LINE Messaging API for bot replies
- Rich Menu via LINE Official Account Manager or API
- LIFF ID: 2009738746-2qigSpHh (shared across apps)
- Bot can send Flex Messages with book covers + "Read Now" buttons linking to LIFF URLs
