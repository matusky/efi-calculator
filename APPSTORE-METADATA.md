# App Store Connect — every field, ready to paste

Companion to [APPSTORE.md](APPSTORE.md), which is the *procedure*. This file is the
*content*: the exact strings to paste into each App Store Connect field, with the
character counts already checked against Apple's limits. Written 2026-08-20.

Publisher is **Plynth LLC**. Bundle ID is **`com.plynth.efi`** and is permanent.

---

## New App form

| Field | Value |
|---|---|
| Platform | iOS |
| Name | `EFI Calculator` (14/30) |
| Primary language | English (U.S.) |
| Bundle ID | `com.plynth.efi` |
| SKU | `efi-calculator-ios` |
| User access | Full Access |

If `EFI Calculator` is taken, fall back to `EFI Calculator — rASRM` (22/30). The
store name does not have to match `CFBundleDisplayName`.

---

## Version information

**Subtitle** (29/30)

```
Endometriosis Fertility Index
```

**Promotional text** (134/170) — editable without shipping a build

```
Score the Endometriosis Fertility Index and rASRM stage at the operating table. Works entirely offline. No account, no data collected.
```

**Description** (2,429/4,000)

```
EFI Calculator scores the Endometriosis Fertility Index from the findings a surgeon records during laparoscopy, alongside the revised AFS/rASRM stage the same findings produce.

It is a worksheet, not a diagnostic. You enter what was observed; it does the arithmetic and shows every intermediate number, so the result can be checked line by line rather than taken on trust.

THE FOUR STEPS

1. rASRM Endometriosis Score — implant size and depth at the peritoneum, both ovaries and the posterior cul-de-sac, plus filmy and dense adhesions on the ovaries and tubes. Produces the AFS endometriosis lesion score, the AFS total score, and the rASRM stage (I–IV).

2. Least Function Score — rate the fallopian tube, fimbria and ovary on each side from 4 (normal) through 3 (mild), 2 (moderate) and 1 (severe dysfunction) to 0 (absent or nonfunctional). The LF score is the lowest rating on the left plus the lowest on the right. If an ovary is absent, the score doubles the lowest rating on the remaining side, as the published method specifies.

3. Historical Factors — age at surgery, length of infertility, and prior pregnancy.

4. EFI Summary — a full scorecard showing how each of the ten points was earned, the total, and the matching row of published non-ART pregnancy rates at one and three years.

BUILT FOR THE OPERATING ROOM

• Works completely offline. Every asset is in the app; it makes no network requests at all.
• Collects nothing. No account, no sign-in, no analytics, no tracking, no storage — entries live only for the session and are gone when the app closes.
• Recalculates as you go, so a changed finding updates the stage and the score immediately.
• Reads on iPhone and iPad, with the worksheet in two columns where there is room for it.

METHOD

Adamson GD & Pasta DJ. Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system. Fertil Steril 2010;94(5):1609–15. Staging follows the revised AFS/rASRM Classification System.

IMPORTANT

This is an informational tool, not a medical device. It does not provide medical advice, diagnosis, or treatment. It is intended for use by qualified healthcare professionals who can independently review the basis for its output. Always consult a qualified healthcare provider for clinical decision-making. The pregnancy rate estimates are population-level statistics from published research and may not reflect an individual outcome.
```

**Keywords** (94/100 — comma-separated, no spaces)

```
endometriosis,fertility,rASRM,AFS,infertility,laparoscopy,gynecology,OBGYN,IVF,adnexal,surgery
```

**URLs**

| Field | Value |
|---|---|
| Support URL | `https://github.com/matusky/efi-calculator` |
| Marketing URL | `https://eficalculator.com` |
| Privacy policy URL | `https://eficalculator.com/privacy.html` |

All three return 200 as of 2026-08-20.

**Other**

| Field | Value |
|---|---|
| Category — primary | Medical |
| Category — secondary | Reference |
| Copyright | `2026 Plynth LLC` |
| Version | `1.0` |
| Release | Manually release this version |

---

## App Privacy

One answer ends the whole questionnaire:

> **Do you or your third-party partners collect data from this app?** → **No, we do not
> collect data from this app.**

That produces a "Data Not Collected" label, and it is true: no network requests, no
`localStorage` / `sessionStorage` / `indexedDB` / cookies, no third-party SDKs. The only
npm dependencies are `@capacitor/core` and `@capacitor/ios`, which are the WebView shell.
`test/worksheet.test.js` asserts the page references no remote assets, so this stays true
by test rather than by memory.

A privacy policy URL is still required even with an empty label — use the one above.

---

## Age rating

Answer honestly. The item that applies is **Medical/Treatment Information** — the app
presents clinical scoring and published pregnancy statistics. That lifts the rating above
4+, which is correct for this category. Understating it invites a metadata rejection.

---

## App Review Information

**Notes** — paste as-is:

```
EFI Calculator is an offline reference calculator for the Endometriosis Fertility Index, a published clinical scoring system (Adamson GD & Pasta DJ, "Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system," Fertil Steril 2010;94(5):1609-15), used together with the revised AFS/rASRM classification.

INTENDED USER: qualified healthcare professionals — the gynecologic surgeon performing or reviewing a laparoscopy. The app is a scoring worksheet, not a diagnostic tool and not a medical device.

WHAT IT DOES: the user enters findings already observed during surgery — implant sizes and depths, adhesion extent, and the functional status of the tubes, fimbriae and ovaries — plus patient age, duration of infertility, and prior pregnancy history. The app performs arithmetic on those inputs to produce the rASRM stage, the Least Function score, and the 0-10 EFI total, and displays the published population-level pregnancy-rate table from the source paper. Every intermediate value is shown on the scorecard so the user can independently review the basis for the result. It makes no diagnosis and gives no treatment recommendation.

DISCLAIMER: displayed in the app header, visible immediately on launch without scrolling ("Informational tool - not medical advice. Consult a qualified healthcare provider."), and again in full at the foot of the worksheet.

NO ACCOUNT REQUIRED: there is no sign-in, so no demo credentials are needed.

PRIVACY: the app runs entirely offline. All assets are bundled and it makes no network requests of any kind. It stores no data - entries exist only for the duration of the session and are discarded when the app closes.

HOW TO EXERCISE IT: tap any score box in Step 1 to build an rASRM score; rate the six structures in Step 2; choose the three answers in Step 3. The Step 4 scorecard fills in as you go and highlights the matching pregnancy-rate row.
```

**Contact** — Apple needs a person it can actually reach. Jono, as the Account Holder,
with a phone number that will be answered.

**Demo account** — leave blank; sign-in is not required.

---

## Screenshots

Captured 2026-08-20 from the real app on simulators, at the exact sizes Apple accepts.
They show a worked Stage III case scoring EFI 7/10.

| Set | Size | Files |
|---|---|---|
| iPhone 6.9" | 1320 × 2868 | `assets/screenshots/iphone-6.9/` — `01-rasrm.png`, `02-lf.png`, `03-scorecard.png` |
| iPad 13" | 2064 × 2752 | `assets/screenshots/ipad-13/` — `01-overview.png`, `02-scorecard.png` |

Both sets are mandatory because the project targets iPhone and iPad
(`TARGETED_DEVICE_FAMILY = "1,2"`). App Store Connect scales these down for smaller
devices, so these two sets cover the catalogue.

To regenerate after a UI change, see `scripts/screenshots.sh`.

The 1024 × 1024 App Store icon is uploaded separately from the in-app icon; the artwork is
`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.

---

## What is left, and who has to do it

Everything below needs the **Account Holder** Apple ID for Plynth LLC. None of it can be
done from this repo, and two of them silently block release rather than erroring.

1. **Accept the agreements.** Business → Agreements → Free Apps. (Paid Apps only if the
   app is ever sold; it pulls in banking and tax forms.)
2. **EU Digital Services Act trader information.** Business → Trader Information. Plynth
   LLC's registered address, phone, email, then submit for verification. **Apple removes
   apps from sale in the EU without verified trader status**, and verification is not
   instant — start it before submitting the build.
3. **Register the bundle ID** `com.plynth.efi` at
   developer.apple.com/account/resources/identifiers, or let Xcode do it during signing.
4. **Create the app record** with the New App form above.
5. **Sign and archive** — Xcode → Settings → Accounts, add the Plynth Apple ID, select the
   team on the App target, then Product → Archive → Distribute → App Store Connect.
6. **Fill in** the version information, privacy answers, age rating, review notes and
   screenshots from this file.
7. **Submit.**
