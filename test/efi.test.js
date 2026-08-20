/*
 * Scoring tests. Node's built-in runner, no dependencies: `npm test`.
 *
 * The regression block near the bottom pins the specific defect this suite was
 * written for — the worksheet used to sum the three structures within a side
 * and take the lower side, which is not the Least Function score.
 */
const test = require('node:test');
const assert = require('node:assert');
const EFI = require('../www/efi.js');

const side = (tube, fimbria, ovary) => ({ tube, fimbria, ovary });
const absent = { ovaryAbsent: true };
const lf = (left, right) => EFI.leastFunction({ left, right });

/* --- rASRM staging ----------------------------------------------------- */

test('rASRM stage boundaries', () => {
  assert.equal(EFI.rasrmStage(0), null, 'nothing scored yet is not Stage I');
  assert.equal(EFI.rasrmStage(1), 'I (Minimal)');
  assert.equal(EFI.rasrmStage(5), 'I (Minimal)');
  assert.equal(EFI.rasrmStage(6), 'II (Mild)');
  assert.equal(EFI.rasrmStage(15), 'II (Mild)');
  assert.equal(EFI.rasrmStage(16), 'III (Moderate)');
  assert.equal(EFI.rasrmStage(40), 'III (Moderate)');
  assert.equal(EFI.rasrmStage(41), 'IV (Severe)');
  assert.equal(EFI.rasrmStage(150), 'IV (Severe)');
});

/* --- Least Function ---------------------------------------------------- */

test('LF is the lowest structure per side, summed across sides', () => {
  // Everything normal: 4 + 4 = 8, the maximum.
  assert.equal(lf(side(4, 4, 4), side(4, 4, 4)).score, 8);
  // Everything nonfunctional: 0.
  assert.equal(lf(side(0, 0, 0), side(0, 0, 0)).score, 0);
  // One damaged structure drags its whole side down to that structure's score.
  assert.equal(lf(side(4, 0, 4), side(4, 4, 4)).score, 4);
  assert.equal(lf(side(3, 2, 4), side(4, 1, 2)).score, 3, 'min(3,2,4)=2 plus min(4,1,2)=1');
  assert.equal(lf(side(1, 1, 1), side(4, 4, 4)).score, 5);
});

test('LF never exceeds 8', () => {
  for (const a of [0, 1, 2, 3, 4]) {
    for (const b of [0, 1, 2, 3, 4]) {
      const score = lf(side(4, 4, a), side(4, 4, b)).score;
      assert.ok(score >= 0 && score <= 8, `LF ${score} out of the 0-8 range`);
    }
  }
});

test('LF reports which structure limited each side', () => {
  const r = lf(side(4, 2, 4), side(1, 4, 4));
  assert.equal(r.leftLeast, 2);
  assert.equal(r.rightLeast, 1);
  assert.equal(r.score, 3);
});

test('a side is incomplete until all three structures are rated', () => {
  assert.equal(lf(side(4, 4, undefined), side(4, 4, 4)).score, null);
  assert.equal(lf(side(4, 4, undefined), side(4, 4, 4)).complete, false);
  assert.equal(lf(undefined, side(4, 4, 4)).score, null);
  // An unrated structure must not be quietly treated as 0.
  assert.notEqual(lf(side(4, 4, undefined), side(4, 4, 4)).score, 4);
});

test('an absent ovary doubles the other side', () => {
  // Published rule: double the lowest score on the side that still has an ovary.
  assert.equal(lf(absent, side(4, 4, 4)).score, 8);
  assert.equal(lf(absent, side(4, 2, 3)).score, 4, 'min is 2, doubled');
  assert.equal(lf(side(3, 3, 3), absent).score, 6);
  assert.equal(lf(absent, side(4, 2, 3)).doubledSide, 'right');
  // The tube and fimbria on the ovary-less side no longer contribute.
  assert.equal(lf({ ovaryAbsent: true, tube: 4, fimbria: 4 }, side(1, 1, 1)).score, 2);
});

test('both ovaries absent scores 0', () => {
  const r = lf(absent, absent);
  assert.equal(r.score, 0);
  assert.equal(r.complete, true);
  assert.equal(EFI.lfPoints(r.score), 0);
});

test('LF to EFI point bands', () => {
  assert.equal(EFI.lfPoints(8), 3);
  assert.equal(EFI.lfPoints(7), 3);
  assert.equal(EFI.lfPoints(6), 2);
  assert.equal(EFI.lfPoints(4), 2);
  assert.equal(EFI.lfPoints(3), 1);
  assert.equal(EFI.lfPoints(1), 1);
  assert.equal(EFI.lfPoints(0), 0);
  assert.equal(EFI.lfPoints(null), null);
});

/* --- Surgical factors -------------------------------------------------- */

test('endometriosis lesion score point boundary at 16', () => {
  assert.equal(EFI.endometriosisPoints(0), 1);
  assert.equal(EFI.endometriosisPoints(15), 1);
  assert.equal(EFI.endometriosisPoints(16), 0);
  assert.equal(EFI.endometriosisPoints(60), 0);
});

test('AFS total score point boundary at 71', () => {
  assert.equal(EFI.totalScorePoints(0), 1);
  assert.equal(EFI.totalScorePoints(70), 1);
  assert.equal(EFI.totalScorePoints(71), 0);
  assert.equal(EFI.totalScorePoints(150), 0);
});

/* --- EFI total --------------------------------------------------------- */

const best = {
  leastFunction: { left: side(4, 4, 4), right: side(4, 4, 4) },
  afsEndoScore: 0,
  afsTotalScore: 0,
  historical: { age: 2, yearsInfertile: 2, priorPregnancy: 1 }
};

test('best possible case scores 10', () => {
  const r = EFI.efi(best);
  assert.equal(r.leastFunction.score, 8);
  assert.equal(r.lfPoints, 3);
  assert.equal(r.surgical, 5);
  assert.equal(r.historical, 5);
  assert.equal(r.total, 10);
  assert.equal(r.complete, true);
});

test('worst possible case scores 0', () => {
  const r = EFI.efi({
    leastFunction: { left: side(0, 0, 0), right: side(0, 0, 0) },
    afsEndoScore: 40,
    afsTotalScore: 120,
    historical: { age: 0, yearsInfertile: 0, priorPregnancy: 0 }
  });
  assert.equal(r.total, 0);
});

test('EFI stays within 0-10 across the input space', () => {
  for (const l of [0, 1, 2, 3, 4]) {
    for (const rr of [0, 1, 2, 3, 4]) {
      for (const endo of [0, 20]) {
        for (const tot of [0, 80]) {
          const r = EFI.efi({
            leastFunction: { left: side(l, l, l), right: side(rr, rr, rr) },
            afsEndoScore: endo,
            afsTotalScore: tot,
            historical: { age: 2, yearsInfertile: 1, priorPregnancy: 1 }
          });
          assert.ok(r.total >= 0 && r.total <= 10, `EFI ${r.total} out of range`);
        }
      }
    }
  }
});

test('EFI total is null until every input is supplied', () => {
  const partial = Object.assign({}, best, { historical: { age: 2, yearsInfertile: 2 } });
  const r = EFI.efi(partial);
  assert.equal(r.total, null);
  assert.equal(r.complete, false);
  assert.equal(r.surgical, 5, 'the surgical half still reports on its own');
});

test('a worked mid-range case', () => {
  // Age 36-39 (1) + infertile >3y (1) + prior pregnancy (1) = 3 historical.
  // LF: min(4,3,2)=2 left, min(4,4,1)=1 right → 3 → 1 point.
  // Endo lesion score 18 (>=16) → 0. AFS total 52 (<71) → 1.
  const r = EFI.efi({
    leastFunction: { left: side(4, 3, 2), right: side(4, 4, 1) },
    afsEndoScore: 18,
    afsTotalScore: 52,
    historical: { age: 1, yearsInfertile: 1, priorPregnancy: 1 }
  });
  assert.equal(r.leastFunction.score, 3);
  assert.equal(r.lfPoints, 1);
  assert.equal(r.surgical, 2);
  assert.equal(r.historical, 3);
  assert.equal(r.total, 5);
  assert.equal(EFI.pregnancyBand(r.total), '5');
});

/* --- Pregnancy-rate bands ---------------------------------------------- */

test('pregnancy rate bands', () => {
  assert.equal(EFI.pregnancyBand(10), '9-10');
  assert.equal(EFI.pregnancyBand(9), '9-10');
  assert.equal(EFI.pregnancyBand(8), '7-8');
  assert.equal(EFI.pregnancyBand(7), '7-8');
  assert.equal(EFI.pregnancyBand(6), '6');
  assert.equal(EFI.pregnancyBand(5), '5');
  assert.equal(EFI.pregnancyBand(4), '4');
  assert.equal(EFI.pregnancyBand(3), '0-3');
  assert.equal(EFI.pregnancyBand(0), '0-3');
  assert.equal(EFI.pregnancyBand(null), null);
});

/* --- Regression: the sum/min inversion --------------------------------- */

test('regression: LF is not min-of-side-sums', () => {
  // The cases below are exactly where the old formula diverged. Each asserts
  // the published answer; the comment records what the broken version returned.

  // One absent fimbria on an otherwise normal patient.
  // Old: min(4+0+4, 4+4+4) = 8 → 3 points. Published: 0 + 4 = 4 → 2 points.
  const a = EFI.leastFunction({ left: side(4, 0, 4), right: side(4, 4, 4) });
  assert.equal(a.score, 4);
  assert.equal(EFI.lfPoints(a.score), 2);

  // Uniformly severe left side.
  // Old: min(1+1+1, 4+4+4) = 3 → 1 point. Published: 1 + 4 = 5 → 2 points.
  const b = EFI.leastFunction({ left: side(1, 1, 1), right: side(4, 4, 4) });
  assert.equal(b.score, 5);
  assert.equal(EFI.lfPoints(b.score), 2);

  // Moderate bilateral involvement.
  // Old: min(2+2+2, 2+2+2) = 6 → 2 points. Published: 2 + 2 = 4 → 2 points.
  const c = EFI.leastFunction({ left: side(2, 2, 2), right: side(2, 2, 2) });
  assert.equal(c.score, 4);

  // A score of 9 or more was reachable before and is not a valid LF score.
  const d = EFI.leastFunction({ left: side(3, 3, 3), right: side(4, 4, 4) });
  assert.equal(d.score, 7);
  assert.ok(d.score <= 8);
});

test('regression: the mild-dysfunction rating is accepted', () => {
  // 3 was missing from the worksheet entirely, so a surgeon could not record
  // mild dysfunction and had to round to 2 or 4 — a whole EFI point either way.
  const r = EFI.leastFunction({ left: side(3, 3, 3), right: side(3, 3, 3) });
  assert.equal(r.score, 6);
  assert.equal(EFI.lfPoints(r.score), 2);
  assert.ok(EFI.FUNCTION_SCALE.some(s => s.value === 3 && /mild/i.test(s.label)));
});
