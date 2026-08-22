# Shipping EFI Calculator from CI

CI builds, signs, uploads and submits. After the one-time setup below, a release
is: Actions → **Ship iOS** → pick a lane → Run.

Nothing here needs Xcode on your machine, which matters because the repo lives on
Merit's Mac, not yours.

> **Plynth LLC is a different Apple team from the one that publishes bin.**
> App Store Connect API keys are per-team, so bin's secrets do not work here. This
> needs its own key, its own Team ID and its own certs repo.

---

## One-time setup — only you can do these

Each of these is an Account Holder action on the Plynth LLC Apple account. None of
them can be done from the repo.

### 1. Accept the agreements

App Store Connect → **Business** → **Agreements** → accept the **Free Apps**
agreement. Paid Apps is only needed if the app is ever sold, and it drags in
banking and tax forms — skip it while the app is free.

An unaccepted agreement does not error. It silently blocks the app from going
live at the very end, so do it first.

### 2. EU Digital Services Act trader information

App Store Connect → **Business** → **Agreements** tab → **Compliance** →
**Digital Services Act**. Account Holder or Admin only.

**Answer "This is a trader account."** Plynth LLC is a business distributing an app
on the EU App Store, which is what "trader" means here. Declaring non-trader would
be wrong and gets the app removed from EU storefronts. The declaration is required
even for developers who do not distribute in the EU at all.

| Field | Answer |
|---|---|
| Trader status | **This is a trader account** |
| Legal name | `Plynth LLC` |
| Address | **Nothing to type.** For organizations Apple auto-populates this from the D-U-N-S number, read-only |
| Phone number | See the warning below — **published publicly** |
| Email address | See the warning below — **published publicly** |
| Certification | Tick it: you offer only products complying with applicable EU law |

> **The phone number and email are displayed on the EU App Store product page, and
> the phone number cannot be hidden.** Articles 30–31 of the DSA require Apple to
> show verified trader contact details to EU users. Do not put a personal mobile
> here. Use a number and an address Plynth is content to publish.
>
> On the email: `plynth.com` runs Cloudflare Email Routing, which is
> **forward-only**. A published support address that cannot reply is a bad look, so
> add a sending path before publishing one, or publish an address that already has
> one.

**Verification.** Apple validates the email and phone with 2FA codes, then asks for
a document proving the business name and address. The **filed Articles of
Organization** (entity `B20260372673`, downloadable free from bizfileOnline's "My
Work Queue") is exactly the accepted document type.

Verification is not instant. **Start it before submitting the build, not after.**

If the auto-populated address is wrong, the fix is at D&B or via Apple Developer
Support — it is not editable in this form.

### 3. App Store Connect API key

App Store Connect → **Users and Access** → **Integrations** → **App Store Connect
API** → generate a key with the **App Manager** role.

Download the `.p8` — Apple lets you download it exactly once. Note the **Key ID**
and the **Issuer ID** shown on that page.

### 4. Certs repo and a token for it

- ~~Create an empty **private** repo~~ — **done**: `Plynth-Labs/efi-certs` already exists.
  fastlane `match` stores the distribution certificate and provisioning profile there,
  encrypted. It holds no source code.
- Create a **fine-grained Personal Access Token** with **Contents: Read and write**,
  scoped to `Plynth-Labs/efi-certs` only. Resource owner must be **Plynth-Labs**, not a
  personal account.

  **Expiration: 366 days**, the maximum — not "No expiration".

  The token writes to exactly one repo, and that repo holds only an *encrypted*
  certificate and profile; the passphrase that opens them is `MATCH_PASSWORD`, kept
  separately. A leaked PAT on its own is an unreadable blob, so a short lifetime buys
  little. It costs plenty, though: releases here are infrequent, so a 30- or 90-day
  token would be dead nearly every time you actually need to ship — and you would meet
  that while pushing a fix.

  An unbounded token is the other extreme: a write credential you forget you ever
  issued. A year is the balance, and GitHub emails you before it lapses.

  **When it does expire, it looks like a permissions bug, not an expiry.** The workflow
  checks the certs repo before building and names the real cause — expired token,
  pending org approval, or a personal resource owner — instead of letting `match` fail
  on a bare 404. Note the renewal date somewhere you will see it.

Why not automatic signing: it mints a fresh Apple Distribution certificate per
machine, and Apple caps a team at a small number of them. On ephemeral CI runners
that works for the first few builds and then hard-fails. `match` keeps one cert and
reuses it.

### 5. Repo secrets

`Plynth-Labs/efi-calculator` → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `ASC_KEY_ID` | Key ID from step 3 |
| `ASC_ISSUER_ID` | Issuer ID from step 3 |
| `ASC_KEY_P8` | the **full contents** of the `.p8`, including both `-----BEGIN/END-----` lines |
| `APPLE_TEAM_ID` | Plynth's 10-character Team ID (Membership page) |
| `MATCH_PASSWORD` | a passphrase you choose — it encrypts the certs repo |
| `MATCH_GIT_PAT` | the token from step 4 |

> **`ASC_KEY_P8`: just paste the whole file.** Open `AuthKey_XXXXXXXXXX.p8` in a text
> editor, select all, paste. Keep the line breaks and both marker lines — a `.p8` is
> PEM, the newlines are part of the format, and GitHub Actions stores multi-line
> secrets natively.
>
> If you get it wrong it is very likely still fine. CI normalizes the key before
> using it and accepts every shape this tends to arrive in: raw PEM, base64 of the
> whole file (what many CI guides tell you to do), the bare base64 body with the
> markers stripped, or PEM flattened onto one line. Each is converted back to the
> same key, and the step prints which shape it found. Only something that is not a
> private key at all is rejected, with a message saying so.
>
> `scripts/normalize-asc-key.sh` does the work and can be run locally.

---

## Running it

Actions → **Ship iOS** → **Run workflow**, then pick a lane:

| Lane | Does |
|---|---|
| `bootstrap` | Creates the App Store Connect app record. Idempotent; a no-op once it exists. |
| `beta` | Builds, signs, uploads to TestFlight. |
| `metadata_only` | Pushes metadata and screenshots. No build, no submission. |
| `release` | Builds, uploads, attaches metadata and screenshots, submits for review. |

Pushing a tag matching `ios-v*` runs `beta`. Plain pushes to `main` do not trigger
anything, so merges never burn a build number.

**First run should be `bootstrap`, then `beta`.** Getting a build into TestFlight and
onto your phone before submitting to review is worth the extra five minutes.

The `release` lane sets export compliance (no non-exempt encryption), IDFA (none)
and third-party content (none) automatically, and leaves the release **manual** so
you choose the go-live moment after approval.

---

## Metadata lives in files, not in a browser

`ios/fastlane/metadata/` holds every App Store field — name, subtitle, description,
keywords, URLs, category, copyright, and the App Review notes.
`ios/fastlane/screenshots/en-US/` holds both mandatory screenshot sets.

So a copy change is a reviewed diff and a `metadata_only` run, rather than someone
retyping fields into a form. The prose also exists in
[APPSTORE-METADATA.md](../APPSTORE-METADATA.md) with the character counts shown;
**the files here are what actually ships** — edit these, and keep that doc in step.

Regenerate screenshots after a UI change with `./scripts/screenshots.sh`, then copy
them into `ios/fastlane/screenshots/en-US/`.

---

## Versions

The marketing version is single-sourced from the root `package.json` `version`
field. The lane reads it, takes the first three components (the App Store allows at
most three integers), and injects it into the build — so it never drifts from the
repo. The build number is always `github.run_number`, so every run is unique.

To ship 1.0.1: bump `package.json`, update
`ios/fastlane/metadata/en-US/release_notes.txt`, merge, then run the `release` lane.
Do not hand-edit `MARKETING_VERSION` in the Xcode project; it is only a fallback for
local dev builds.
