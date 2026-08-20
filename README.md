# EFI Calculator

A simple, mobile-friendly **Endometriosis Fertility Index (EFI)** calculator built as a single HTML page. No server, no dependencies — just open it in a browser.

🔗 **Live tool:** [matusky.github.io/efi-calculator](https://matusky.github.io/efi-calculator)

---

## What is the EFI?

The **Endometriosis Fertility Index** is a clinical scoring system developed by Adamson & Pasta (2010) that predicts a patient's likelihood of achieving pregnancy without assisted reproductive technology (ART) after endometriosis surgery. It combines two categories of information:

- **Historical factors** — age, duration of infertility, and pregnancy history
- **Surgical factors** — how much endometriosis is present and how well the reproductive anatomy is functioning after surgery

The resulting score (0–10) maps to estimated pregnancy rates at 1 and 3 years, helping patients and clinicians make informed decisions about next steps — whether that's trying naturally, pursuing IUI, or moving to IVF.

## What This Tool Does

This calculator walks through the full EFI worksheet in four steps:

1. **rASRM Endometriosis Score** — Score implant locations (peritoneum, ovaries, cul-de-sac) by size and depth, plus adhesions on ovaries and tubes, to determine the total AFS score and rASRM stage (I–IV)
2. **Least Function (LF) Score** — Rate the functional status of each tube, fimbria, and ovary on both sides. The score is the *lowest* rating on the left plus the *lowest* rating on the right (0–8)
3. **Historical Factors** — Enter age at surgery, length of infertility, and prior pregnancy history
4. **EFI Summary** — View the complete scorecard with a breakdown of all points, the final EFI score, and the corresponding estimated pregnancy rates

Everything calculates in real time as you make selections. A reset button clears all fields.

## How to Use It

1. Open the calculator (either the [live site](https://matusky.github.io/efi-calculator) or the local file)
2. **Step 1** — Work through the rASRM scoring tables. For each anatomical site, select the implant size and adhesion extent observed during surgery. Check the "fimbriated end completely enclosed" box for either tube if applicable.
3. **Step 2** — Rate each structure (tube, fimbria, ovary) on both sides: 4 = normal, 3 = mild dysfunction, 2 = moderate, 1 = severe, 0 = absent/nonfunctional. The tool takes the lowest rating on each side and adds the two together. If an ovary is absent, tick the box for that side — the score then doubles the lowest rating on the remaining side, per the published rule.
4. **Step 3** — Select the patient's age bracket, duration of infertility, and whether there's been a prior pregnancy.
5. **Step 4** — Review the scorecard summary and estimated pregnancy rates. The calculator highlights the row matching your EFI score.

## Scoring System

| Component | Points | Details |
|---|---|---|
| **Age at surgery** | 0–2 | ≤35 yrs = 2, 36–39 = 1, ≥40 = 0 |
| **Infertility duration** | 0–2 | ≤3 yrs = 2, >3 yrs = 0 |
| **Prior pregnancy** | 0–1 | Yes = 1, No = 0 |
| **LF score** | 0–3 | LF total is 0–8: 7–8 = 3, 4–6 = 2, 1–3 = 1, 0 = 0 |
| **AFS endo score** | 0–1 | <16 = 1, ≥16 = 0 |
| **AFS total score** | 0–1 | <71 = 1, ≥71 = 0 |
| **EFI Total** | **0–10** | |

### Estimated Non-ART Pregnancy Rates

| EFI Score | 1 Year | 3 Years |
|---|---|---|
| 9–10 | 67% | 75% |
| 7–8 | 39% | 66% |
| 6 | 30% | 54% |
| 5 | 27% | 42% |
| 4 | 15% | 28% |
| 0–3 | 10% | 10% |

## Running Locally

The whole calculator is one HTML file — `www/index.html` — with no build step and no dependencies:

```bash
# Clone the repo
git clone https://github.com/matusky/efi-calculator.git

# Open it
open efi-calculator/www/index.html
# or just double-click www/index.html in Finder / your file manager
```

Works in any modern browser. Mobile-friendly. (`www/` is the web root because it doubles as the Capacitor app bundle's web directory — see [iOS App](#ios-app).)

## Scoring rules and tests

The scoring itself lives in `www/efi.js` — pure functions, no DOM, no dependencies.
The worksheet loads it as a plain `<script>` and the test suite requires it, so the
numbers a clinician sees on screen are the same ones under test.

```bash
npm test     # node --test, no install needed
```

`test/efi.test.js` covers the rASRM stage boundaries, the Least Function rule
(including the absent-ovary case), every EFI point band, and the 0–10 range across
the input space. It also pins two corrections made on 2026-08-20:

- **The LF score was computed inverted.** The worksheet summed the three structures
  within each side and then took the lower side. The published rule is the reverse —
  the *lowest* structure on each side, the two sides *added*. The two agree at the
  very top of the range and diverge in the middle, so the error was invisible on a
  healthy-patient spot-check but shifted real cases by a full EFI point. The
  give-away was the mapping table's `7–12` row: a correct LF score cannot exceed 8.
- **The mild-dysfunction rating (3) was missing.** Only 0, 1, 2 and 4 were offered,
  so a surgeon recording mild dysfunction had to round to 2 or 4 — one EFI point
  either way.

## Deployment

The site auto-deploys to **GitHub Pages** on every push to `main` via the workflow in `.github/workflows/pages.yml`. No build step — it publishes the `www/` directory as-is.

## iOS App

The same `www/index.html` also ships as a native iOS app, wrapped with [Capacitor](https://capacitorjs.com/). Capacitor is a thin native shell: an Xcode project whose only screen is a full-window `WKWebView` that loads the copied web assets from the app bundle. There is no rewrite and no second codebase — edit `www/index.html` and both the website and the app change.

**Offline works by construction.** Every asset the page needs is bundled — CSS and JavaScript are inline in `index.html`, and there are no external scripts, stylesheets, fonts, or remote requests of any kind. Once `cap sync` copies `www/` into the app bundle the calculator runs entirely from local files, so no connectivity is needed after install. (The service worker in `www/sw.js` is for the *web* build only; it registers just over `http(s)`, so it is skipped under the app's `capacitor://` scheme, where the assets are already local.)

Configuration lives in `capacitor.config.ts` — app id `com.plynth.efi`, app name "EFI Calculator", web directory `www`. The native project is in `ios/`, targets iOS 15+, builds for iPhone and iPad, and uses Swift Package Manager (no CocoaPods, so `cap open ios` opens `ios/App/App.xcodeproj` directly — there is no `.xcworkspace`).

```bash
npm install          # once — installs the Capacitor CLI and iOS runtime
npx cap sync ios     # copy www/ into the app bundle + refresh native deps
npx cap open ios     # open the project in Xcode, then Run
```

`npm run sync` and `npm run open:ios` are aliases for the last two. Re-run `npx cap sync ios` after any edit to `www/`; `ios/App/App/public/` is generated output and is deliberately untracked, so a fresh clone must sync before its first build.

The app is published by **Plynth LLC**. Shipping it to the App Store needs the Apple account holder — enrollment, the app record, signing, TestFlight, privacy answers, and review notes. That checklist is in [APPSTORE.md](APPSTORE.md).

## Citation

Based on:

> Adamson GD & Pasta DJ. *Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system.* Fertil Steril 2010;94(5):1609–15

and the revised AFS/rASRM Classification System.

## ⚠️ Disclaimer

This is a personal informational tool, not a medical device. It does not provide medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for clinical decision-making. The pregnancy rate estimates are population-level statistics from published research and may not reflect individual outcomes.
