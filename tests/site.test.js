const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');

const attr = (name) => [...html.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const tags = (name) => html.match(new RegExp(`<${name}\b[^>]*>`, 'g')) || [];

test('page has title, description and Open Graph metadata', () => {
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{50,}"/);
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:url']) {
    assert.ok(html.includes(`property="${prop}"`), `missing ${prop}`);
  }
});

test('every in-page anchor points to an existing id', () => {
  const ids = new Set(attr('id'));
  const anchors = attr('href').filter((h) => h.startsWith('#'));
  assert.ok(anchors.length > 0);
  for (const a of anchors) assert.ok(ids.has(a.slice(1)), `broken anchor ${a}`);
});

test('ids are unique', () => {
  const ids = attr('id');
  assert.equal(new Set(ids).size, ids.length);
});

test('all main sections are present', () => {
  for (const id of ['about', 'experience', 'projects', 'skills', 'contact']) {
    assert.match(html, new RegExp(`<section id="${id}"`), `missing section ${id}`);
  }
});

test('local files referenced by the page exist', () => {
  const local = [...attr('href'), ...attr('src')].filter(
    (u) => u && !/^(https?:|mailto:|data:|#)/.test(u)
  );
  assert.ok(local.includes('cv_eg.pdf'));
  for (const f of local) assert.ok(fs.existsSync(path.join(root, f)), `missing file ${f}`);
});

test('external links opened in a new tab use rel="noopener"', () => {
  for (const a of tags('a').filter((t) => t.includes('target="_blank"'))) {
    assert.match(a, /rel="[^"]*noopener[^"]*"/, a);
  }
});

test('images have alt text and icon-only links have aria-labels', () => {
  for (const img of tags('img')) assert.match(img, /alt="[^"]+"/, img);
  const iconLinks = [...html.matchAll(/<a\b[^>]*>\s*<svg/g)].map((m) => m[0]);
  for (const a of iconLinks) assert.match(a, /aria-label="[^"]+"/, a);
});

test('GitHub project links point to MehdiBedja repositories', () => {
  const gh = attr('href').filter((h) => h.startsWith('https://github.com/'));
  assert.ok(gh.length >= 5);
  for (const h of gh) assert.match(h, /^https:\/\/github\.com\/MehdiBedja(\/|\?|$)/);
});

test('inline script is valid JavaScript', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length > 0);
  for (const s of scripts) assert.doesNotThrow(() => new vm.Script(s));
});

test('404 page redirects home', () => {
  const notFound = read('404.html');
  assert.match(notFound, /http-equiv="refresh" content="\d+;url=\/"/);
  assert.match(notFound, /href="\/"/);
});
