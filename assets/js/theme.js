/* Same preference behaviour as the house, using this site's mirrored brand tokens. */
(() => {
  const key = 'v-kins.theme'
  const root = document.documentElement
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const normalise = value => value === 'light' || value === 'dark' ? value : 'system'
  const css = document.getElementById('brand-tokens').textContent.replace(/\/\*[\s\S]*?\*\//g, '')
  const lightRoot = css.match(/^\s*:root\s*\{([^{}]*)\}/)?.[1]
  const darkRoot = css.match(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{\s*:root\s*\{([^{}]*)\}\s*\}/)?.[1]
  if (lightRoot === undefined || darkRoot === undefined) return
  const colours = body => Object.fromEntries(
    [...body.matchAll(/(--vk-[\w-]+)\s*:\s*([^;]+)(?:;|$)/g)]
      .map(match => [match[1], match[2].trim()])
      .filter(([, value]) => /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)),
  )
  const light = colours(lightRoot)
  const palettes = { light, dark: { ...light, ...colours(darkRoot) } }
  let preference = 'system'
  let select
  let sources = []
  try { preference = normalise(window.localStorage.getItem(key)) } catch {
    // Storage may be blocked. The selector still works for the current page.
  }

  function render() {
    const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
    for (const [name, value] of Object.entries(palettes[resolved])) {
      if (preference === 'system') root.style.removeProperty(name)
      else root.style.setProperty(name, value)
    }
    root.dataset.theme = resolved
    if (select) select.value = preference
    for (const source of sources) source.media = resolved === 'dark' ? 'all' : 'not all'
  }

  render() // Apply the stored choice in the head, before the page is painted.
  media.addEventListener('change', () => { if (preference === 'system') render() })
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = normalise(event.newValue)
      render()
    }
  })
  document.addEventListener('DOMContentLoaded', () => {
    select = document.getElementById('theme-select')
    sources = document.querySelectorAll('[data-theme-logo]')
    render()
    if (!select) return
    document.getElementById('theme-control').hidden = false
    select.addEventListener('change', () => {
      preference = normalise(select.value)
      render()
      try {
        if (preference === 'system') window.localStorage.removeItem(key)
        else window.localStorage.setItem(key, preference)
      } catch {
        // Do not disable switching when persistence is unavailable.
      }
    })
  })
})()