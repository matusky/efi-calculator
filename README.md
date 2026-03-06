# EFI Calculator

A simple, mobile-friendly **Endometriosis Fertility Index (EFI)** calculator built as a single HTML page. No server, no dependencies — just open it in a browser.

🔗 **Live tool:** [merit-blake.github.io/efi-calculator](https://merit-blake.github.io/efi-calculator)

---

## What is the EFI?

The **Endometriosis Fertility Index** is a clinical scoring system developed by Adamson & Pasta (2010) that predicts a patient's likelihood of achieving pregnancy without assisted reproductive technology (ART) after endometriosis surgery. It combines two categories of information:

- **Historical factors** — age, duration of infertility, and pregnancy history
- **Surgical factors** — how much endometriosis is present and how well the reproductive anatomy is functioning after surgery

The resulting score (0–10) maps to estimated pregnancy rates at 1 and 3 years, helping patients and clinicians make informed decisions about next steps — whether that's trying naturally, pursuing IUI, or moving to IVF.

## What This Tool Does

This calculator walks through the full EFI worksheet in four steps:

1. **rASRM Endometriosis Score** — Score implant locations (peritoneum, ovaries, cul-de-sac) by size and depth, plus adhesions on ovaries and tubes, to determine the total AFS score and rASRM stage (I–IV)
2. **Least Function (LF) Score** — Rate the functional status of each tube, fimbria, and ovary (both sides) to find the least functional side
3. **Historical Factors** — Enter age at surgery, length of infertility, and prior pregnancy history
4. **EFI Summary** — View the complete scorecard with a breakdown of all points, the final EFI score, and the corresponding estimated pregnancy rates

Everything calculates in real time as you make selections. A reset button clears all fields.

## How to Use It

1. Open the calculator (either the [live site](https://merit-blake.github.io/efi-calculator) or the local file)
2. **Step 1** — Work through the rASRM scoring tables. For each anatomical site, select the implant size and adhesion extent observed during surgery. Check the "fimbriated end completely enclosed" box for either tube if applicable.
3. **Step 2** — Rate each structure (tube, fimbria, ovary) on both sides from 0 (absent/nonfunctional) to 4 (normal). The tool automatically picks the least functional side.
4. **Step 3** — Select the patient's age bracket, duration of infertility, and whether there's been a prior pregnancy.
5. **Step 4** — Review the scorecard summary and estimated pregnancy rates. The calculator highlights the row matching your EFI score.

## Scoring System

| Component | Points | Details |
|---|---|---|
| **Age at surgery** | 0–2 | ≤35 yrs = 2, 36–39 = 1, ≥40 = 0 |
| **Infertility duration** | 0–2 | ≤3 yrs = 2, >3 yrs = 0 |
| **Prior pregnancy** | 0–1 | Yes = 1, No = 0 |
| **LF score** | 0–3 | 7–12 = 3, 4–6 = 2, 1–3 = 1, 0 = 0 |
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

It's a single HTML file with no dependencies:

```bash
# Clone the repo
git clone https://github.com/merit-blake/efi-calculator.git

# Open it
open efi-calculator/index.html
# or just double-click index.html in Finder / your file manager
```

Works in any modern browser. Mobile-friendly.

## Deployment

The site auto-deploys to **GitHub Pages** on every push to `main` via the workflow in `.github/workflows/pages.yml`. No build step — it serves the HTML file directly.

## Citation

Based on:

> Adamson GD & Pasta DJ. *Endometriosis Fertility Index: Clinical applicability and validity of a simplified scoring system.* Fertil Steril 2010;94(5):1609–15

and the revised AFS/rASRM Classification System.

## ⚠️ Disclaimer

This is a personal informational tool, not a medical device. It does not provide medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for clinical decision-making. The pregnancy rate estimates are population-level statistics from published research and may not reflect individual outcomes.
