import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname, join } from 'node:path'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = path => readFileSync(join(root, path), 'utf8')
const tokens = read('assets/css/brand-tokens.css')
const home = read('public/index.html')
const personalHome = read('public-tim/index.html')
const sites = [
  { output: 'public', origin: 'https://v-kins.com', home },
  { output: 'public-tim', origin: 'https://tim.v-kins.com', home: personalHome },
]

function controller(script, css, { saved = null, dark = false, blocked = false } = {}) {
  const values = new Map()
  const events = {}
  const select = { value: 'system', addEventListener: (name, fn) => { events[name] = fn } }
  const control = { hidden: true }
  const sources = [{ media: '' }, { media: '' }]
  const element = { dataset: {}, style: { setProperty: (k, v) => values.set(k, v), removeProperty: k => values.delete(k) } }
  const media = { matches: dark, addEventListener: (_, fn) => { events.media = fn } }
  const storage = new Map(saved === null ? [] : [['v-kins.theme', saved]])
  const window = {
    matchMedia: () => media,
    addEventListener: (name, fn) => { events[name] = fn },
    get localStorage() {
      if (blocked) throw new Error('Storage blocked')
      return { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) }
    },
  }
  const document = {
    documentElement: element,
    getElementById: id => ({ 'brand-tokens': { textContent: css }, 'theme-select': select, 'theme-control': control })[id],
    querySelectorAll: () => sources,
    addEventListener: (name, fn) => { events[name] = fn },
  }
  runInNewContext(script, { window, document })
  return { element, values, select, control, sources, storage, events,
    bind() { events.DOMContentLoaded() },
    choose(value) { select.value = value; events.change() },
    system(dark) { media.matches = dark; events.media() },
  }
}

for (const [label, script, css] of [
  ['source', read('assets/js/theme.js'), tokens],
  ...sites.map(site => {
    const css = site.home.match(/<style id=["']?brand-tokens["']?>([\s\S]*?)<\/style>/)[1]
    const script = site.home.match(/<script src=["']?([^\s"'>]+)["']?[^>]*><\/script>/)[1]
    return [site.output, read(`${site.output}${script}`), css]
  }),
]) {
  test(`${label}: first visit follows system and updates live`, () => {
    const c = controller(script, css)
    assert.equal(c.element.dataset.theme, 'light')
    c.bind()
    assert.equal(c.control.hidden, false)
    assert.equal(c.select.value, 'system')
    c.system(true)
    assert.equal(c.element.dataset.theme, 'dark')
    assert.equal(c.values.size, 0)
    assert.ok(c.sources.every(s => s.media === 'all'))
  })
  for (const choice of ['light', 'dark']) {
    test(`${label}: saved ${choice} overrides device before markup and survives device changes`, () => {
      const c = controller(script, css, { saved: choice, dark: choice === 'light' })
      assert.equal(c.element.dataset.theme, choice)
      assert.equal(c.values.get('--vk-paper'), choice === 'light' ? '#FFFFFF' : '#0C1220')
      c.bind()
      assert.equal(c.select.value, choice)
      c.system(false)
      c.system(true)
      assert.equal(c.element.dataset.theme, choice)
      assert.ok(c.sources.every(s => s.media === (choice === 'dark' ? 'all' : 'not all')))
    })
  }
  test(`${label}: choices persist and System clears all overrides`, () => {
    const c = controller(script, css)
    c.bind()
    c.choose('dark')
    assert.equal(c.storage.get('v-kins.theme'), 'dark')
    assert.equal(c.element.dataset.theme, 'dark')
    c.choose('light')
    assert.equal(c.storage.get('v-kins.theme'), 'light')
    c.choose('system')
    assert.equal(c.storage.has('v-kins.theme'), false)
    assert.equal(c.values.size, 0)
    assert.equal(c.element.dataset.theme, 'light')
  })
  test(`${label}: invalid saved values fall back to System`, () => {
    const c = controller(script, css, { saved: 'invalid', dark: true })
    c.bind()
    assert.equal(c.select.value, 'system')
    assert.equal(c.element.dataset.theme, 'dark')
  })
  test(`${label}: blocked storage does not prevent switching`, () => {
    const c = controller(script, css, { blocked: true })
    c.bind()
    c.choose('dark')
    assert.equal(c.element.dataset.theme, 'dark')
    c.choose('light')
    assert.equal(c.element.dataset.theme, 'light')
  })
  test(`${label}: preferences synchronise across tabs`, () => {
    const c = controller(script, css)
    c.bind()
    c.events.storage({ key: 'v-kins.theme', newValue: 'dark' })
    assert.equal(c.select.value, 'dark')
    c.events.storage({ key: null, newValue: null })
    assert.equal(c.select.value, 'system')
  })
}

test('token mirror matches canonical source when available', t => {
  const canonical = resolve(root, '../brand/tokens/tokens.css')
  if (!existsSync(canonical)) return t.skip('Standalone checkout; compare upstream when updating brand assets')
  assert.equal(tokens.replaceAll('\r\n', '\n'), readFileSync(canonical, 'utf8').replaceAll('\r\n', '\n'))
})

test('family home contains only the identity and theme control', () => {
  assert.match(home, /Always one/)
  assert.match(home, /Four flags, five kin, one crew\./)
  assert.match(home, /A family, with a few things to share\./)
  const body = home.slice(home.indexOf('<body'))
  assert.doesNotMatch(body, /Timothy|author's own|Holder|De Graaff|house\.v-kins|vault|<nav\b|<footer\b|\/notes\/|tim\.v-kins/i)
  assert.equal((body.match(/<h1\b/g) ?? []).length, 1)
  assert.doesNotMatch(home, /name=["']?author|application\/rss\+xml/)
})

test('family output excludes personal routes, feeds and sitemap entries', () => {
  for (const path of ['notes', 'about', 'now', 'tags', 'index.xml']) {
    assert.equal(existsSync(join(root, 'public', path)), false, path)
  }
  assert.doesNotMatch(read('public/sitemap.xml'), /\/notes\/|\/about\/|\/now\/|\/tags\/|tim\.v-kins/)
  assert.equal(read('public/CNAME').trim(), 'v-kins.com')
  assert.equal(read('public-tim/CNAME').trim(), 'tim.v-kins.com')
})

test('personal home has author, notes and its own canonical hostname', () => {
  assert.match(personalHome, /Notes from the field, by Timothy Watkins\./)
  assert.match(personalHome, /Observations are the author's own and not those of any employer or client\./)
  assert.match(personalHome, /No notes yet\.|<ul class=["']?notes/)
  assert.match(personalHome, /aria-current=["']?page["']?>Home/)
  assert.doesNotMatch(personalHome, /Four flags, five kin|A family, with a few things/)
})

test('notes section keeps author, disclaimer and honest empty state', () => {
  const notes = read('public-tim/notes/index.html')
  assert.match(notes, /Notes from the field, by Timothy Watkins\./)
  assert.match(notes, /Observations are the author's own and not those of any employer or client\./)
  assert.match(notes, /No notes yet\.|<ul class=["']?notes/)
  assert.match(notes, /href=["']?\/notes\/["']? class=["']?on["']? aria-current=["']?page/)
})

const htmlFiles = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name)
  return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : []
})

test('RSS stays out of navigation but remains in the notes footer and feed', () => {
  for (const file of htmlFiles(join(root, 'public-tim'))) {
    const html = readFileSync(file, 'utf8')
    const navigation = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/)?.[0]
    assert.ok(navigation, file)
    assert.doesNotMatch(navigation, /RSS|index\.xml/, file)
  }
  const footer = read('public-tim/notes/index.html').match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0]
  assert.ok(footer)
  assert.match(footer, /href=["']?\/index\.xml["']?>RSS<\/a>/)
  assert.match(personalHome, /type=["']?application\/rss\+xml/)
  assert.match(read('public-tim/index.xml'), /<rss\b/)
  assert.match(read('public-tim/index.xml'), /https:\/\/tim\.v-kins\.com\//)
})

for (const site of sites) test(`${site.output}: metadata, themes and links stay within the correct site`, () => {
  for (const file of htmlFiles(join(root, site.output))) {
    const html = readFileSync(file, 'utf8')
    const canonical = html.match(/<link rel=["']?canonical["']? href=["']?([^\s"'>]+)/)?.[1]
    assert.ok(canonical, file)
    assert.equal(new URL(canonical).origin, site.origin, file)
    assert.match(html, /name=["']?viewport/, file)
    assert.match(html, /<title>.+?<\/title>/, file)
    assert.match(html, /<label for=["']?theme-select["']?>Theme<\/label>/, file)
    for (const choice of ['light', 'dark', 'system']) assert.match(html, new RegExp(`option value=["']?${choice}`), file)
    for (const match of html.matchAll(/(?:href|src|srcset)=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g)) {
      const url = new URL(match[1] ?? match[2] ?? match[3], `${site.origin}/`)
      if (url.origin !== site.origin) continue
      const local = join(root, site.output, decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '')
      assert.ok(existsSync(local), `${file}: missing ${url.pathname}`)
    }
  }
})