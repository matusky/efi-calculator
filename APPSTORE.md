# Shipping EFI Calculator to the App Store

This is the hand-off checklist for the **Apple account holder**. Everything here needs a human with the Apple ID, a credit card, or Xcode on a Mac — none of it can be done from the repo alone. Work top to bottom; each step assumes the ones above it are done.

**What the app actually is** (useful context for the answers below): the repo's `www/index.html` — one self-contained HTML file with its CSS and JavaScript inline, no scripts, stylesheets, fonts, or requests from anywhere else — wrapped in a [Capacitor](https://capacitorjs.com/) `WKWebView` shell. It scores the Endometriosis Fertility Index from Adamson & Pasta (2010). It has no accounts, no server, no analytics, and no storage: entries live in the DOM for the length of the session and are gone when the app closes.

Current native settings, already in the repo:

| Setting | Value | Where |
|---|---|---|
| App ID / bundle id | `com.plynth.efi` — **settled 2026-08-20, permanent** | `capacitor.config.ts` + Xcode target |
| App name | EFI Calculator | `capacitor.config.ts`, `CFBundleDisplayName` |
| Version / build | 1.0 / 1 | `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` |
| Minimum iOS | 15.0 | `IPHONEOS_DEPLOYMENT_TARGET` |
| Devices | iPhone + iPad | `TARGETED_DEVICE_FAMILY = "1,2"` |
| Signing style | Automatic | `CODE_SIGN_STYLE = Automatic` |
| Publisher / seller | **Plynth LLC** (CA B20260372673) | App Store Connect |
| Export compliance | declared exempt | `ITSAppUsesNonExemptEncryption = false` |
| Dependencies | `@capacitor/core`, `@capacitor/ios` only | `package.json` |

---

## Step 0 — Repo prerequisites (already done — verify, don't redo)

These shipped with the app-feasibility branch; each just needs a glance before submission.

- [x] **In-app disclaimer.** `www/index.html` shows a short disclaimer line directly under the header ("Informational tool — not medical advice…") and the full README disclaimer paragraph at the bottom of the page. Guideline 1.4.1 expects medical apps to state their limits inside the app; both are visible to a reviewer, the header line without any scrolling.
- [x] **App artwork.** The icon and splash screens are the custom EFI wordmark (white Georgia "EFI" on navy `#1e2a35`), not Capacitor templates: `AppIcon.appiconset/AppIcon-512@2x.png` (1024×1024, no alpha) plus six `Splash.imageset/Default@{1,2,3}x~universal~anyany[-dark].png` (2732×2732, light and dark). Regeneration pipeline: `assets/source/generate.sh` → `npx capacitor-assets generate --ios` (needs macOS with Chrome + ImageMagick).
- [x] **Privacy policy page.** `www/privacy.html` exists and states truthfully that nothing is collected, stored, or transmitted. The Pages workflow publishes `www/` as-is, so after the branch merges to `main` it is live at `https://matusky.github.io/efi-calculator/privacy.html` — confirm that URL loads before pasting it into App Store Connect.

**iPad stays in for v1** (decided 2026-08-20) — the worksheet is a two-column layout that earns the width. `TARGETED_DEVICE_FAMILY = "1,2"`, so both screenshot sets are mandatory; both are already generated and committed (see Step 8), so this costs nothing at submission time.

---

## Step 1 — Apple Developer Program — ✅ done

Organization enrollment for **Plynth LLC** was approved **2026-08-19**, membership
`432Q357UBY`. The seller name shown on the App Store is `Plynth LLC`.

Two things remain in this step, and both are **Account Holder actions** — nobody
else on the team can do them, and each silently blocks release if skipped:

- [ ] **Agreements.** App Store Connect → **Business** → **Agreements**. Accept the
  Free Apps agreement. Paid Apps is only needed if the app is ever sold; it drags in
  banking and tax forms, so skip it while the app is free.
- [ ] **EU Digital Services Act trader information.** App Store Connect → **Business**
  → **Trader Information** (also surfaced per-app under App Information). Supply
  Plynth LLC's registered address, a phone number, and an email, then submit for
  verification. Apple **removes apps from sale in the EU** without verified trader
  status. Verification is not instant — start it before submitting the build, not after.

This is the concrete payoff of publishing under the entity: the address Apple
publishes to EU users is Plynth's registered address, not a home address.

## Step 2 — Create the app record in App Store Connect

1. In App Store Connect → **Apps** → **+** → **New App**.
2. Fill in:
   - **Platform:** iOS
   - **Name:** `EFI Calculator` (30 characters max; must be unique across the App Store — if it's taken, `EFI Calculator — Endometriosis` or similar works, and the name here does not have to match `CFBundleDisplayName`)
   - **Primary language:** English (U.S.)
   - **Bundle ID:** `com.plynth.efi`
   - **SKU:** any private string, e.g. `efi-calculator-ios` (never shown to users)
   - **User access:** Full Access
3. The Bundle ID dropdown only lists identifiers registered to your team. If `com.plynth.efi` isn't there, register it first at <https://developer.apple.com/account/resources/identifiers/list> → **+** → App IDs → App → Description `EFI Calculator`, Bundle ID (explicit) `com.plynth.efi`, no capabilities checked. Or let Xcode register it for you during Step 3 and come back.

### The bundle id is settled — there is nothing to change

`com.plynth.efi`, decided 2026-08-20, and already in the repo: `capacitor.config.ts`
and both build configurations of the Xcode target. It was verified in a built
`Info.plist` and by launching on a simulator. Nothing here needs editing — just pick
it from the dropdown in step 2 above.

It reverse-DNSes to a domain Plynth LLC owns rather than to a personal one, which is
the point of publishing under the entity. Apple does not require the bundle id to
match the seller name; this is coherence, not a rule.

**It becomes permanent the moment this app ships.** After that, changing it means
publishing a *separate* app that loses the original's reviews, ratings and ranking
history. So if it were ever going to change, it would have to be before first
submission — and it is not going to change.

<details>
<summary>For a future app, changing an unshipped bundle id takes two edits</summary>

1. `capacitor.config.ts` → `appId: 'your.new.id'`
2. Xcode → App target → **Signing & Capabilities** → Bundle Identifier — this also
   writes `PRODUCT_BUNDLE_IDENTIFIER` into the project file, and `cap sync` does
   **not** do it for you

then `npx cap sync ios`. `ios/App/App/capacitor.config.json` is generated from the TS
config on every sync, so never hand-edit it.
</details>

---

## Step 3 — Signing (Xcode automatic signing)

1. From the repo root: `npm install && npx cap sync ios && npx cap open ios`. This project uses Swift Package Manager, so Xcode opens `ios/App/App.xcodeproj` — there is no `.xcworkspace`. Let Xcode finish resolving the Capacitor Swift packages before doing anything else.
2. Xcode → **Settings → Accounts → +** → Apple ID → sign in with the enrolled Apple ID. Your team appears once enrollment completes.
3. Select the **App** target → **Signing & Capabilities** tab.
4. Check **Automatically manage signing**, then pick your **Team** from the dropdown. The project already ships `CODE_SIGN_STYLE = Automatic`, so selecting the team is the only change; Xcode creates the development and distribution certificates and provisioning profiles for you.
5. Confirm **Bundle Identifier** reads `com.plynth.efi` and the status area shows no red errors. "Failed to register bundle identifier" means the id is claimed on another team — unlikely here, since `plynth.com` is Plynth's own domain. If it happens, it is almost certainly the dormant original-Plynth Apple ID rather than a stranger; open an Apple Developer support request to release it rather than quietly picking a different id.
6. Plug in an iPhone, select it as the run destination, and **Run** (⌘R) once. Trust the developer certificate on the device when prompted (Settings → General → VPN & Device Management). Confirm the calculator loads and scores correctly, then put the phone in Airplane Mode and confirm it still works — that is the offline check, and it should pass because no asset is remote.

---

## Step 4 — Archive and upload to TestFlight

Keep this manual for v1. It is a five-minute path through the Xcode UI, and automating it before the first successful upload means debugging two things at once.

1. In Xcode, set the run destination to **Any iOS Device (arm64)**. The Archive menu item is greyed out for a simulator destination.
2. Confirm the version and build: **General → Identity → Version** `1.0`, **Build** `1`. Every upload to App Store Connect needs a build number higher than the last one for that version — bump **Build** (1 → 2 → 3), not Version, between TestFlight uploads.
3. **Product → Archive.** Wait for the build.
4. The **Organizer** window opens on the Archives tab with the new archive selected. Click **Distribute App**.
5. Choose **App Store Connect** → **Upload** → **Next**. Accept the defaults on the following panes (include symbols, manage version and build number off), then **Upload**.
6. **Export compliance:** already declared. `ios/App/App/Info.plist` carries `ITSAppUsesNonExemptEncryption = false`, which is accurate — the app uses no encryption beyond what iOS itself provides — so Xcode will not ask on upload.
7. Upload takes a few minutes; processing on Apple's side takes 5–30 more. You'll get an email when the build finishes processing, and another if it fails validation.
8. In App Store Connect → your app → **TestFlight**, the build appears. Add yourself under **Internal Testing** (any of up to 100 users on your team; no Apple review required, available within minutes). Install via the TestFlight app on the device.
9. **External testers** — anyone not on your team — require a short **Beta App Review** and a "What to Test" note. Only bother if you want testers outside the team before release.

*Later, not now:* [fastlane](https://fastlane.tools) can collapse steps 1–7 into one `fastlane beta` command and run it from CI, and it handles certificates via `match`. Set it up after the first manual upload succeeds, once you know the build is genuinely clean.

---

## Step 5 — App Privacy answers

This is the easy path, because every honest answer is "no." App Store Connect → your app → **App Privacy** → **Get Started**.

- **"Do you or your third-party partners collect data from this app?"** → **No, we do not collect data from this app.**

That single answer ends the questionnaire and produces an empty "Data Not Collected" privacy label. It is accurate, and here is why, so you can answer follow-ups with confidence:

- The app makes **no network requests**. There is no remote script, stylesheet, font, or image anywhere in `www/index.html`; nothing is sent anywhere, because there is nowhere to send it.
- It uses **no storage APIs** — no `localStorage`, `sessionStorage`, `indexedDB`, or cookies. Entries exist only in the live page and vanish when the app is closed. (`www/sw.js` is a web-only service worker that caches the site's own files for the GitHub Pages build; it registers only over `http(s)` and is skipped under the app's `capacitor://` scheme. Even on the web it caches nothing but the app's own assets — no user input.)
- There are **no third-party SDKs**. The only npm dependencies are `@capacitor/core` and `@capacitor/ios`, which are the WebView shell itself; no analytics, crash reporting, advertising, or attribution libraries.
- Nothing is tracked, so the **App Tracking Transparency** prompt and `NSUserTrackingUsageDescription` do not apply, and no `NSPrivacyAccessedAPITypes` privacy manifest entries are needed.

Keep this true. Adding an analytics SDK, a crash reporter, or any "save my worksheet" feature later means revisiting this section before the next release.

You'll still need the **privacy policy URL** from Step 0 — App Store Connect requires it even with a Data Not Collected label.

---

## Step 6 — App Review: a medical-adjacent informational tool

The relevant rule is **App Store Review Guideline 1.4.1** (Physical Harm), which covers medical apps: they must be accurate, must state their methodology and data sources, and must not offer inaccurate diagnoses or treatment advice. Reviewers are cautious with anything touching fertility or pregnancy. Three things carry this app through:

**1. Position it as a clinical reference calculator, not a diagnostic.** It computes a published score from values a clinician has already observed during surgery. It does not diagnose, does not recommend treatment, and does not take patient data anywhere. Say exactly that.

**2. Keep the disclaimer prominent in the app** (Step 0). A reviewer should see it without scrolling or tapping. This is the single most common cause of a 1.4.1 rejection for a tool like this.

**3. Cite the source everywhere.** The app already carries the citation next to the results; repeat it in the App Store description and again in the review notes.

> Adamson GD & Pasta DJ. *Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system.* Fertil Steril 2010;94(5):1609–15 — plus the revised AFS/rASRM Classification System for the staging tables.

**Review notes** — paste this into App Store Connect → App Review Information → Notes:

> EFI Calculator is an offline reference calculator for the Endometriosis Fertility Index, a published clinical scoring system (Adamson GD & Pasta DJ, *Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system*, Fertil Steril 2010;94(5):1609–15) used together with the revised AFS/rASRM classification.
>
> The app is a scoring worksheet, not a diagnostic tool. The user enters findings already observed during surgery — implant sizes, adhesion extent, and the functional status of tubes, fimbriae, and ovaries — plus patient age, duration of infertility, and prior pregnancy history. The app arithmetically produces the rASRM stage, the Least Function score, and the 0–10 EFI total, then displays the published population-level pregnancy-rate table from the source paper. It makes no diagnosis and gives no treatment recommendation.
>
> A disclaimer is displayed prominently in the app stating that it is an informational tool, not a medical device, that it does not provide medical advice, diagnosis, or treatment, and that a qualified healthcare provider should be consulted for clinical decision-making.
>
> The app requires no account and no sign-in. It runs entirely offline: all assets are bundled, and it makes no network requests. It stores no data of any kind — entries exist only for the duration of the session and are discarded when the app closes.

**Other review-information fields:** no demo account is needed (leave the sign-in fields blank / unchecked); provide a contact first name, last name, phone, and email that Apple can actually reach.

**Age rating:** answer the questionnaire honestly. The item that applies is **Medical/Treatment Information** — the app presents clinical scoring and published pregnancy statistics. Answering it truthfully raises the rating above 4+, which is expected and fine for this category; understating it is a metadata rejection waiting to happen.

**If it gets rejected:** 1.4.1 rejections for calculators are usually fixed with wording, not code — a more prominent disclaimer, a clearer description, an explicit statement of the source and methodology. Reply in Resolution Center with the change rather than resubmitting silently.

---

## Step 7 — Metadata to write

All of this goes in App Store Connect → your app → the **1.0 Prepare for Submission** page. Character limits are hard limits.

| Field | Limit | Notes |
|---|---|---|
| Name | 30 | `EFI Calculator` |
| Subtitle | 30 | e.g. `Endometriosis Fertility Index` (29) |
| Promotional text | 170 | Editable without a new build — good place for updates |
| Description | 4000 | What it computes, the four steps (rASRM score → LF score → historical factors → EFI summary), the citation, and the disclaimer verbatim |
| Keywords | 100 total, comma-separated, no spaces | e.g. `EFI,endometriosis,fertility,rASRM,AFS,infertility,IVF,laparoscopy,gynecology,OBGYN` |
| Support URL | required | `https://github.com/matusky/efi-calculator` or the Pages site |
| Marketing URL | optional | `https://matusky.github.io/efi-calculator` |
| Privacy policy URL | required | The page from Step 0 |
| Category | — | Primary **Medical**; secondary **Reference** if you want one |
| Copyright | — | `2026 Plynth LLC` |
| Version | — | `1.0`, matching the archived build |
| Release | — | "Automatically release" vs. "Manually release" — manual gives you control over the go-live moment |

Do not put a price on it unless you intend to; Free is the default and avoids the tax/banking forms entirely. Paid apps require completing **Business → Agreements → Paid Apps**, including bank and tax information.

---

## Step 8 — Screenshots

Required per device family the app supports. The project currently targets **iPhone and iPad** (`TARGETED_DEVICE_FAMILY = "1,2"`), so both sets are mandatory unless you drop iPad in Step 0.

- **iPhone 6.9" display** — 1320 × 2868 or 1290 × 2796 portrait. 1 minimum, up to 10.
- **iPad 13" display** — 2064 × 2752 or 2048 × 2732 portrait. 1 minimum, up to 10.

App Store Connect scales these down for smaller devices automatically, so those two sets cover the whole catalog. Confirm the exact accepted dimensions on the upload page — Apple revises the required sizes when new hardware ships.

**Both sets are already generated and committed** under `assets/screenshots/`, at the exact accepted pixel sizes, showing a worked Stage III case that scores EFI 7/10. Upload them as-is. To regenerate after a UI change, run `./scripts/screenshots.sh` — it builds the app, drives a copy of the bundle through the worksheet, and captures each section on both device classes.

Suggested three to five shots, which double as a walkthrough of what the app does:

1. Step 1 — the rASRM implant/adhesion scoring tables
2. Step 2 — the Least Function score, both sides
3. Step 3 — historical factors (age, infertility duration, prior pregnancy)
4. Step 4 — the EFI summary scorecard with a score filled in and the matching pregnancy-rate row highlighted
5. A shot where the disclaimer is legible

Screenshots must show the real app. No device frames with marketing copy layered over them, no mocked-up screens.

Also needed once, and only once: the **1024 × 1024 App Store icon**, uploaded separately from the in-app icon (Step 0 supplies the same artwork).

---

## Step 9 — Submit

1. On the **Prepare for Submission** page, select the processed build from Step 4 under **Build**.
2. Confirm Age Rating, App Privacy, App Review Information, and screenshots are all filled.
3. **Add for Review** → **Submit to App Review**.
4. Review currently runs a day or two for a simple app like this. Watch the email and the Resolution Center.
5. After approval, release manually (if you chose that) from the app's version page.

For every subsequent release: edit `www/index.html`, `npx cap sync ios`, bump **Version** and reset **Build** to 1 in Xcode, archive, upload, add a "What's New" note, submit. Steps 1–3 never have to be repeated.
