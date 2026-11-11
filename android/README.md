# Android app (Trusted Web Activity)

The Android app is a thin wrapper around the deployed Resident portal (the PWA). It runs the real site in
Chrome, so the service worker, offline cache and every release of the web app reach users without a new
Play Store upload.

## Before you start
1. The Resident portal must be live on **HTTPS** at its production domain.
2. The domain is already set to `clubatibis-resident.vercel.app` in `twa-manifest.json`.
3. Create a Google Play Console account (one-time $25). Keep `android.keystore` private and backed up. Never commit it.

## Build the app bundle (works on Windows)
```bash
npm i -g @bubblewrap/cli
cd android
bubblewrap init --manifest=https://clubatibis-resident.vercel.app/manifest.webmanifest   # or reuse twa-manifest.json
bubblewrap build        # produces app-release-bundle.aab (+ a signed .apk for quick device testing)
```
Bubblewrap needs JDK 17 and the Android SDK. It offers to download both on first run.
Alternative with no CLI: paste the URL into https://www.pwabuilder.com and download the Android package.

## Remove the browser address bar (Digital Asset Links)
1. Upload the `.aab` to Play Console (Internal testing first).
2. In Play Console open **Test and release > App integrity > App signing** and copy the
   **SHA-256 certificate fingerprint** of the *app signing key*.
3. Put it in `public/.well-known/assetlinks.json` (replace the placeholder), deploy the web app, and check
   `https://clubatibis-resident.vercel.app/.well-known/assetlinks.json` opens and shows your fingerprint.
4. If you also install a locally built `.apk`, add that keystore's fingerprint as a second entry in the array.

## Publish
- Fill in the store listing, screenshots, privacy policy URL and the Data safety form.
- Personal developer accounts must run a closed test with 12 testers for 14 days before applying for production.
- Add a demo login for the reviewers in the app access notes.

## Updating
- Web changes: just deploy the site.
- Only bump `appVersion` / `appVersionCode` and re-upload when the wrapper itself changes (icon, name, colours).
