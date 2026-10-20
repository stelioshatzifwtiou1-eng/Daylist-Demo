# Daylist — DEMO build (Android)

This is a **stripped-down demo** of Daylist, meant for quick testing and feedback before any real launch. It has **no subscriptions, no payments, no accounts, and no online features** — so it doesn't need a privacy policy, terms of service, or a Google Play Billing review to hand out to testers.

This is a separate project folder from the full paid version (`daylist-app/`). Nothing here affects that project.

## What's different from the full app
- **No subscriptions.** `pro` is hardcoded on for every player — every habit/task limit, every meditation and workout, every theme and reminder is unlocked. There is no "Go Pro" button, no pricing, no purchase code, and the RevenueCat dependency has been removed entirely.
- **Online Arena/leaderboard: under construction.** The Arena tab shows a clear banner explaining that real multiplayer battles and the global leaderboard are coming in a future update. Offline battles against computer-controlled rivals and bosses still work fully — that part needs no account and sends no data anywhere.
- **No Supabase.** `online.js` and the database schema aren't included in this build, so the app makes no network calls to any backend at all. Nothing a tester does ever leaves their device, other than the two optional things below.
- **A visible "DEMO" badge** in the header, so testers always know what they're looking at.
- **A rating prompt** instead of a subscription upsell. After a little bit of play (a win or reaching level 4), a card invites the player to rate the app. Tapping it calls Google Play's own **In-App Review API** through the `@capacitor-community/in-app-review` plugin — Google shows its native prompt and decides for itself whether and how often to actually display it. The copy deliberately does **not** ask for a specific star rating: Play's Ratings and Reviews policy prohibits asking for 5-star ratings, incentivizing reviews, or only prompting happy-looking users, and violating it can get an app's listing suspended. If the plugin isn't available, it falls back to opening the Play Store listing page directly.
- **A feedback box** on the Stats tab. Testers can type a note and send it through the share sheet (or `mailto:` in a browser) to whatever app they choose — email, Notes, Messages. Nothing is collected or stored by the app itself; it's just handed off to the tester's own device.

## Before you distribute this
Even a free demo with no accounts and no tracking still touches a few things worth knowing:
- **Distribute via Google Play Console's Internal Testing track**, not a public listing. Internal testing is invite-only (up to 100 testers by email), skips the public Store listing requirements, and is the right fit for a build like this. A public listing (even in Closed/Open testing or Production) still requires a privacy policy URL and a completed Data Safety form in Play Console, regardless of price — so hold off on those tracks until the full version (with real Terms/Privacy) is ready.
- **Notification permission.** If a tester turns on a reminder, Android will still show its standard "Allow notifications?" system prompt — that's the OS, not this app, asking.
- **Update `www/native.js`** before building: set `packageId` to match `capacitor.config.json`'s `appId` exactly (needed for the Play Store fallback link), and `shareUrl` to wherever you want the Share button to point.
- **In Android Studio**, add the Google Play In-App Review capability is automatic via the plugin — no extra setup beyond `npm install` and `npx cap sync`.

## Install and build
Same as the full project:

    npm install
    npx cap add android
    npm run assets
    npm run sync
    npm run android     # opens Android Studio, press Run

Or use the included GitHub Actions workflow (`.github/workflows/build-apk.yml`) to get an installable debug APK without installing Android Studio — see the comments in that file, or ask for the walkthrough again.

## Known limits
- Reminders are local notifications only; Android 13+ will prompt for permission the first time one is set.
- Progress lives on the device only (no accounts, no cloud sync) — the in-app Backup feature (Stats tab) is the only way to move progress to another device.
- The icon/splash resources in `resources/` are shared with the full project; regenerate or restyle them if you want the demo to look visually distinct (e.g. a "DEMO" ribbon baked into the icon).
