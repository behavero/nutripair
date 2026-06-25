# NutriPair — iOS wrapper (Capacitor)

A thin native iOS shell that loads the **live** NutriPair Worker
(`https://nutripair.martin-503.workers.dev`) in a `WKWebView`. The frontend is
**not** embedded — the app always shows whatever is deployed to the Worker, so
web and iOS stay in sync with zero rebuilds. The native layer exists to (a) ship
on the App Store and (b) deliver **push notifications** for future KV-change
alerts (e.g. "Giulia a coché 3 articles").

> **App Store note (guideline 4.2):** a pure remote-URL wrapper can be rejected
> as "just a website". Push notifications are the native value-add that justifies
> the native app — keep that capability wired before submitting.

## What's in this folder

| Path | Purpose |
|------|---------|
| `capacitor.config.json` | App id, name, and `server.url` → the live Worker |
| `package.json` | Capacitor 7 + `@capacitor/push-notifications` + asset generator |
| `www/index.html` | Offline/bootstrap fallback (shown only when offline at launch) |
| `assets/icon-only.svg` | Icon source (same artwork as the Worker's `/icon.svg`) |
| `ios-config/App.entitlements` | Reference Push Notifications entitlement |

## Prerequisites (on your Mac)

The native steps need the **full Xcode** (not just Command Line Tools) and
**CocoaPods**:

```bash
xcode-select --install            # if needed
sudo xcodebuild -license accept
# Install Xcode from the App Store, then:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
brew install cocoapods            # or: sudo gem install cocoapods
```

## One-time setup

```bash
cd ios-wrapper
npm install                       # already done by the scaffold; re-run if needed
npx cap add ios                   # generates the native ios/ Xcode project (needs Xcode + CocoaPods)
npm run assets                    # generates the AppIcon set from assets/icon-only.svg
npx cap sync ios                  # copies config + installs native plugin pods
npx cap open ios                  # opens ios/App/App.xcworkspace in Xcode
```

## Enable Push Notifications (in Xcode)

1. Select the **App** target → **Signing & Capabilities**.
2. Set your **Team** (Apple Developer account) and a unique bundle id
   (`ro.behave.nutripair` is preset in `capacitor.config.json`).
3. Click **+ Capability → Push Notifications**. Xcode creates
   `ios/App/App/App.entitlements` with `aps-environment` — it should match
   `ios-config/App.entitlements` in this repo. Use `production` for App Store / TestFlight.
4. (Recommended) **+ Capability → Background Modes → Remote notifications**.

### AppDelegate wiring

Capacitor's push plugin needs the APNs token forwarded. In
`ios/App/App/AppDelegate.swift` add inside the `AppDelegate` class:

```swift
import Capacitor

func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NotificationCenter.default.post(
        name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
}

func application(_ application: UIApplication,
                 didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(
        name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}
```

### Registering from the web app

Because the WebView loads the remote Worker, the registration call must live in
the frontend, guarded so it only runs inside the native app. Add this to the
Worker's `buildScript()` (future step — drop it in `showApp()`):

```js
// Native-only: ask for push permission and register the APNs token.
if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
  var Push = window.Capacitor.Plugins.PushNotifications;
  Push.requestPermissions().then(function(res){
    if (res.receive === 'granted') Push.register();
  });
  Push.addListener('registration', function(token){
    // POST token.value to a future /api/register-device route → store in KV,
    // so the Worker can fan out APNs pushes on state changes.
    fetch('/api/register-device', {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ token: token.value, user: user, platform: 'ios' })});
  });
}
```

The Capacitor native bridge is injected even for an external `server.url`, so
`window.Capacitor.Plugins.PushNotifications` is available on the remote page.

## Run

```bash
npx cap open ios     # then press ▶ in Xcode on a simulator or device
```

Pushes require a **real device** (the simulator can't receive remote APNs).

## Updating

- **Frontend changes** → just `npm run deploy` in the Worker project. The app
  picks them up on next launch (nothing to rebuild).
- **Native/config changes** (icon, plugins, entitlements) → `npx cap sync ios`.

## Still TODO for end-to-end push (server side)

1. A `/api/register-device` route in the Worker → store device tokens in KV.
2. An APNs sender (Worker can call APNs over HTTP/2 with a `.p8` auth key) that
   fires when `/api/toggle` etc. mutate state.
3. Switch `aps-environment` to `production` for the App Store build.
