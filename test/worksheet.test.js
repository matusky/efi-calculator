/*
 * The point values a clinician can actually select live in the markup, not in
 * efi.js — so efi.js can be perfectly correct while the worksheet offers the
 * wrong choices. These tests read www/index.html and pin the selectable values
 * against the published scoring form.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');

// Every value= offered for a given radio group, as numbers, in document order.
function valuesFor(name) {
  const re = new RegExp('name="' + name + '"[^>]*value="(-?\\d+)"|value="(-?\\d+)"[^>]*name="' + name + '"', 'g');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(Number(m[1] !== undefined ? m[1] : m[2]));
  return out;
}

const sorted = a => [...a].sort((x, y) => x - y);

/* --- Historical factors ------------------------------------------------ */

test('age offers 2 / 1 / 0', () => {
  assert.deepEqual(sorted(valuesFor('hist_age')), [0, 1, 2]);
});

test('years infertile offers 2 and 0, not 2 and 1', () => {
  // >3 years scores 0. If it scored 1, an EFI of 0 would be unreachable, and
  // the published pregnancy-rate bands start at 0.
  assert.deepEqual(sorted(valuesFor('hist_inf')), [0, 2]);
});

test('prior pregnancy offers 1 and 0', () => {
  assert.deepEqual(sorted(valuesFor('hist_preg')), [0, 1]);
});

test('historical factors cannot exceed 5 points', () => {
  const max = a => Math.max(...a);
  const total = max(valuesFor('hist_age')) + max(valuesFor('hist_inf')) + max(valuesFor('hist_preg'));
  assert.equal(total, 5);
});

test('historical factors can reach 0', () => {
  const min = a => Math.min(...a);
  const total = min(valuesFor('hist_age')) + min(valuesFor('hist_inf')) + min(valuesFor('hist_preg'));
  assert.equal(total, 0, 'an EFI of 0 must be reachable');
});

/* --- Least Function inputs --------------------------------------------- */

const LF_INPUTS = ['lf_l_tube', 'lf_l_fim', 'lf_l_ov', 'lf_r_tube', 'lf_r_fim', 'lf_r_ov'];

test('every LF structure offers the full 0-4 scale', () => {
  for (const name of LF_INPUTS) {
    assert.deepEqual(sorted(valuesFor(name)), [0, 1, 2, 3, 4], name + ' is missing a rating');
  }
});

test('the absent-ovary control exists for both sides', () => {
  assert.ok(/id="lf_l_absent"/.test(html));
  assert.ok(/id="lf_r_absent"/.test(html));
});

test('the LF mapping table tops out at 8, not 12', () => {
  const row = html.match(/id="lf-row-3"[^>]*>(.*?)<\/tr>/s);
  assert.ok(row, 'lf-row-3 not found');
  assert.ok(/7[–-]8/.test(row[1]), 'top LF band should be 7-8; a valid LF score cannot exceed 8');
  assert.ok(!/12/.test(row[1]), 'the 7-12 band was the symptom of the old inverted formula');
});

/* --- rASRM implant and adhesion values --------------------------------- */

test('rASRM ovary deep implant values are 0/4/16/20', () => {
  assert.deepEqual(sorted(valuesFor('rov_deep')), [0, 4, 16, 20]);
  assert.deepEqual(sorted(valuesFor('lov_deep')), [0, 4, 16, 20]);
});

test('rASRM peritoneum values follow the revised AFS form', () => {
  assert.deepEqual(sorted(valuesFor('peri_sup')), [0, 1, 2, 4]);
  assert.deepEqual(sorted(valuesFor('peri_deep')), [0, 2, 4, 6]);
});

test('dense adhesion values are 0/4/8/16', () => {
  for (const name of ['adh_rov_dense', 'adh_lov_dense', 'adh_rt_dense', 'adh_lt_dense']) {
    assert.deepEqual(sorted(valuesFor(name)), [0, 4, 8, 16], name);
  }
});

test('cul-de-sac obliteration offers 0 / 4 / 40', () => {
  assert.deepEqual(sorted(valuesFor('cds')), [0, 4, 40]);
});

/* --- App Review surface ------------------------------------------------- */

test('the disclaimer is in the markup above the fold', () => {
  const headIdx = html.indexOf('header-disclaimer');
  assert.ok(headIdx > -1, 'header disclaimer missing — App Review guideline 1.4.1');
  assert.ok(/not medical advice/i.test(html));
});

test('the scoring module is loaded before the worksheet script', () => {
  assert.ok(html.indexOf('src="efi.js"') < html.indexOf('function calculate()'));
});

test('the page makes no external requests', () => {
  // Offline-by-construction is the whole basis of the App Privacy answers.
  const remote = html.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
  assert.deepEqual(remote, [], 'found remote asset references: ' + remote.join(', '));
});
