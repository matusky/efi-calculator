/*
 * Endometriosis Fertility Index — scoring rules.
 *
 * Pure functions, no DOM. The worksheet loads this as a plain <script> and the
 * test suite requires it, so the numbers a clinician sees are the numbers under
 * test. Keep it dependency-free and keep it that way.
 *
 * Source: Adamson GD & Pasta DJ. "Endometriosis Fertility Index: Clinical
 * applicability and validity of a simplified scoring system."
 * Fertil Steril 2010;94(5):1609-15. Staging follows the revised AFS/rASRM
 * Classification System.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EFI = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // The 0-4 functional rating applied to each of tube, fimbria and ovary.
  var FUNCTION_SCALE = [
    { value: 4, label: 'Normal' },
    { value: 3, label: 'Mild dysfunction' },
    { value: 2, label: 'Moderate dysfunction' },
    { value: 1, label: 'Severe dysfunction' },
    { value: 0, label: 'Absent / nonfunctional' }
  ];

  function isScore(v) {
    return typeof v === 'number' && v >= 0 && v <= 4 && Number.isInteger(v);
  }

  /* --- rASRM ------------------------------------------------------------ */

  // Stage from the AFS total. Null below 1 point: nothing scored yet, and
  // "Stage I" for an untouched worksheet would be a claim the surgeon
  // did not make.
  function rasrmStage(afsTotal) {
    if (!(afsTotal > 0)) return null;
    if (afsTotal <= 5) return 'I (Minimal)';
    if (afsTotal <= 15) return 'II (Mild)';
    if (afsTotal <= 40) return 'III (Moderate)';
    return 'IV (Severe)';
  }

  /* --- Least Function --------------------------------------------------- */

  /*
   * LF = lowest of (tube, fimbria, ovary) on the left
   *    + lowest of (tube, fimbria, ovary) on the right      → 0-8
   *
   * The least-function structure on each side is what limits that side, and
   * the two sides contribute independently. Summing within a side and then
   * taking the lower side is a different quantity entirely, and lands on a
   * different EFI point band for the same patient.
   *
   * When one ovary is absent, that side cannot contribute, and the published
   * rule is to double the lowest score on the side that still has an ovary.
   */
  function leastFunction(input) {
    var left = input && input.left;
    var right = input && input.right;
    var leftGone = !!(left && left.ovaryAbsent);
    var rightGone = !!(right && right.ovaryAbsent);

    var leftLeast = leftGone ? null : sideLeast(left);
    var rightLeast = rightGone ? null : sideLeast(right);

    // Both ovaries absent: no adnexal function to score.
    if (leftGone && rightGone) {
      return { score: 0, leftLeast: null, rightLeast: null, doubledSide: null, complete: true };
    }

    if (leftGone) {
      if (rightLeast === null) return incomplete(null, null);
      return { score: rightLeast * 2, leftLeast: null, rightLeast: rightLeast, doubledSide: 'right', complete: true };
    }
    if (rightGone) {
      if (leftLeast === null) return incomplete(null, null);
      return { score: leftLeast * 2, leftLeast: leftLeast, rightLeast: null, doubledSide: 'left', complete: true };
    }

    if (leftLeast === null || rightLeast === null) return incomplete(leftLeast, rightLeast);
    return { score: leftLeast + rightLeast, leftLeast: leftLeast, rightLeast: rightLeast, doubledSide: null, complete: true };
  }

  function incomplete(leftLeast, rightLeast) {
    return { score: null, leftLeast: leftLeast, rightLeast: rightLeast, doubledSide: null, complete: false };
  }

  // A side scores only once all three structures are rated — a missing
  // rating is unknown, not zero, and guessing it low would understate the EFI.
  function sideLeast(side) {
    if (!side) return null;
    var parts = [side.tube, side.fimbria, side.ovary];
    for (var i = 0; i < parts.length; i++) {
      if (!isScore(parts[i])) return null;
    }
    return Math.min(parts[0], parts[1], parts[2]);
  }

  // LF score → EFI points. Published bands over the 0-8 range.
  function lfPoints(lf) {
    if (lf === null || lf === undefined) return null;
    if (lf >= 7) return 3;
    if (lf >= 4) return 2;
    if (lf >= 1) return 1;
    return 0;
  }

  /* --- Surgical and historical factors ---------------------------------- */

  function endometriosisPoints(afsEndoScore) {
    return afsEndoScore < 16 ? 1 : 0;
  }

  function totalScorePoints(afsTotalScore) {
    return afsTotalScore < 71 ? 1 : 0;
  }

  /* --- EFI total -------------------------------------------------------- */

  /*
   * EFI = historical factors (age + years infertile + prior pregnancy, 0-5)
   *     + surgical factors (LF points + endometriosis points + total points, 0-5)
   */
  function efi(input) {
    var lf = leastFunction(input.leastFunction);
    var pts = lfPoints(lf.score);

    var surgicalComplete = lf.complete;
    var surgical = surgicalComplete
      ? pts + endometriosisPoints(input.afsEndoScore) + totalScorePoints(input.afsTotalScore)
      : null;

    var h = input.historical || {};
    var historicalComplete = isScore(h.age) && isScore(h.yearsInfertile) && isScore(h.priorPregnancy);
    var historical = historicalComplete ? h.age + h.yearsInfertile + h.priorPregnancy : null;

    return {
      leastFunction: lf,
      lfPoints: pts,
      endometriosisPoints: endometriosisPoints(input.afsEndoScore),
      totalScorePoints: totalScorePoints(input.afsTotalScore),
      surgical: surgical,
      historical: historical,
      total: (surgical !== null && historical !== null) ? surgical + historical : null,
      complete: surgicalComplete && historicalComplete
    };
  }

  // Which published pregnancy-rate band an EFI total falls in.
  function pregnancyBand(total) {
    if (total === null || total === undefined) return null;
    if (total >= 9) return '9-10';
    if (total >= 7) return '7-8';
    if (total === 6) return '6';
    if (total === 5) return '5';
    if (total === 4) return '4';
    return '0-3';
  }

  return {
    FUNCTION_SCALE: FUNCTION_SCALE,
    rasrmStage: rasrmStage,
    leastFunction: leastFunction,
    lfPoints: lfPoints,
    endometriosisPoints: endometriosisPoints,
    totalScorePoints: totalScorePoints,
    efi: efi,
    pregnancyBand: pregnancyBand
  };
});
