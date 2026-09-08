# v-kins.com

The public site for V-Kins, notes from the field by Timothy Watkins. Hugo, a handmade theme, GitHub Pages, custom domain.

Only notes that have passed the confidentiality gate in the private vault (`publishable: cleared`) are copied here. The vault is the source of truth; this repo holds what has been through the gate.

## Publish a note

1. In the vault, set the note to `publishable: cleared` and `status: draft`, reread it for a stranger reading cold.
2. From the vault, run `scripts/publish-note.ps1 observations/<file>.md`. It re-checks the gate, copies the file into `content/notes/` on a `note/<slug>` branch and opens a pull request here.
3. CI validates the note, builds the site and checks links. Squash merge when green. `Deploy` puts it live and verifies the build number.
4. Back in the vault, flip `status: published`.

A copy, not a sync, on purpose. Branching, checks and the deploy flow are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Run locally

```powershell
hugo server -D
```

Then open http://localhost:1313. Hugo Extended is installed via winget (`Hugo.Hugo.Extended`).

## Layout

```
hugo.toml            site config
layouts/             the theme: baseof, index, single, list, taxonomy, 404, partials
assets/css/main.css  all styles; tokens match brand/README.md in the vault
content/notes/       published notes, one Markdown file each
content/about.md     the About page
static/brand/        logo SVGs, copied from the vault's brand folder
static/favicon.svg   the V glyph
static/CNAME         custom domain for GitHub Pages
.github/workflows/   build and deploy
```

## Domain

`static/CNAME` holds `v-kins.com`. DNS at the registrar needs four A records on the apex pointing at GitHub Pages and a `www` CNAME to `v-kins.github.io`. Enforce HTTPS in the repo's Pages settings once the certificate issues.
