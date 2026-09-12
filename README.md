# v-kins.com

Two independently built Hugo sites, sharing one handmade theme and the V-Kins brand:

- `v-kins.com`: the family mark, Always one, the story line and a short introduction. No navigation, personal pages or RSS.
- `tim.v-kins.com`: field notes by Timothy Watkins, with Notes, About, Now and RSS. Prepared locally; hosting and DNS are not configured yet.

The family build reads only `content-family/`; the personal build reads `content/`. Hiding links is not the separation: the family output contains no personal pages. No other family subdomains are created or listed. A subdomain is a public address, not an access control.

Only notes that have passed the confidentiality gate in the private vault (`publishable: cleared`) are copied here. The vault is the source of truth; this repo holds what has been through the gate.

## Publish a note

1. In the vault, set the note to `publishable: cleared` and `status: draft`, reread it for a stranger reading cold.
2. From the vault, run `scripts/publish-note.ps1 observations/<file>.md`. It re-checks the gate, copies the file into `content/notes/` on a `note/<slug>` branch and opens a pull request here.
3. CI validates the note, builds both sites and checks links. Squash merge when green. The current `Deploy` workflow publishes only the family site; merging a note does not publish it to Tim's site yet.
4. Once personal hosting is configured and the note is verified live, flip the vault status to `published`. Until then, keep it as `draft`.

A copy, not a sync, on purpose. Branching, checks and the deploy flow are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Run locally

```powershell
hugo server -D
```

Then open http://localhost:1313. Hugo Extended is installed via winget (`Hugo.Hugo.Extended`).

Preview the personal site separately with `hugo server --config hugo.toml,hugo.tim.toml --port 1314 --baseURL http://localhost:1314/`.
Always include both config files, in that order. The overlay is not a standalone config.

The header offers Light, Dark and System on every page. System is the default;
explicit choices override the device preference and are saved in this browser as
`v-kins.theme`. If storage is unavailable, switching still works for the current
page. Without JavaScript the site follows the device theme. The theme behaviour
is shared by both sites, but each browser origin keeps its own preference.

Validate with `python scripts/check_notes.py`, `python scripts/check_dashes.py .`,
`hugo --gc --minify --cleanDestinationDir --printPathWarnings`,
`hugo --config hugo.toml,hugo.tim.toml --gc --minify --cleanDestinationDir --printPathWarnings`,
then `node --test scripts/site.test.mjs`
(Node 22 or later). Tests cover source and minified theme code, token consistency,
page metadata, attribution, output separation, hostnames and local links. Use clean destinations so old personal routes cannot remain in the family output after switching builds. Preview mobile widths and both themes
before publishing. Publishing still requires a reviewed PR; local preview is not deployment.

## Layout

```
hugo.toml            default family site config
hugo.tim.toml        personal site config overlay
content-family/     family homepage only
layouts/             the theme: baseof, index, single, list, taxonomy, 404, partials
assets/css/main.css  responsive styles using canonical token aliases
assets/css/brand-tokens.css  mirror of ../brand/tokens/tokens.css
assets/js/theme.js   persistent Light / Dark / System controller
content/notes/       cleared personal notes, one Markdown file each
content/about.md     the About page
static/brand/        logo SVGs, mirrored from ../brand/logos/svg/
static/favicon.svg   the V glyph
static/CNAME         custom domain for GitHub Pages
static-tim/CNAME     personal hostname override (does not configure hosting)
public/             generated family output, ignored by Git
public-tim/         generated personal output, ignored by Git
.github/workflows/   build and deploy
```

The token mirror keeps this repository independently buildable. Update the
canonical `brand/tokens/tokens.css` first, then copy it here unchanged. The head
embeds that sheet; the theme controller reads its two colour palettes instead
of maintaining another set of colours. Tests compare the mirror when the sibling
brand directory is available. No private house assets or links belong on this site.

## Domain

`static/CNAME` holds `v-kins.com`. DNS at the registrar needs four A records on the apex pointing at GitHub Pages and a `www` CNAME to `v-kins.github.io`. Enforce HTTPS in the repo's Pages settings once the certificate issues.

`hugo.tim.toml` sets personal canonical URLs and feeds to `https://tim.v-kins.com/`, and `static-tim/CNAME` overrides the family CNAME in that build. This does not create a DNS record or deployment. The existing Pages workflow still uploads only `public/`. GitHub Pages supports one site per repository, so personal hosting needs a separate Pages repository or another independently configured deployment target. Do not upload `public-tim/` under the family site's output.

Before personal publication, review any previously live `/notes/`, `/about/` and `/now/` URLs and plan redirects and feed migration. Redirects, domain verification, DNS and HTTPS are separate deployment work, not part of this local split.
