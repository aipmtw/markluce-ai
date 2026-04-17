# Seamless LINE Login on Mobile

## Problem

When a user opens app.markluce.ai on their phone and taps "Sign in with LINE", they're forced to type their LINE username and password — even though LINE is already installed and logged in on that same phone. This is unnecessary friction.

## Two scenarios, two solutions

### 1. User opens via LINE chat link (inside LINE's in-app browser)

Use **LIFF SDK** — login is completely automatic, zero input needed. The user is already inside LINE's environment, so identity is already available.

### 2. User opens in Safari/Chrome (external browser) with LINE app installed

Use LINE's **app-to-app OAuth** — instead of showing a web login form, the phone switches to the LINE app for one-tap consent, then returns to the browser. Similar to how WeChat in China lets you long-press a QR code to trigger WeChat login seamlessly.

## Implementation items

- Integrate LIFF SDK for the in-LINE-browser auto-login case
- Ensure LINE OAuth uses universal links so the LINE app handles auth natively on mobile
- Consider an "Open in LINE" deep link button as a fallback for external browser users
- Test on both iOS and Android
