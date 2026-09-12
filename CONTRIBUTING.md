# How changes reach v-kins.com

A family landing page and personal field notes, with shared checks and separate build outputs. The rules are few, and they are enforced by the repo rather than by memory.

## Branches

| Branch | Role |
|---|---|
| `main` | Production. Whatever is on `main` is what v-kins.com serves. Protected: no direct pushes, no force pushes, no deletion. |
| `note/<slug>` | One published note. Created by `scripts/publish-note.ps1` in the vault, or by hand. |
| `site/<change>` | A change to the theme, config or workflows. |

No `dev` or `uat` branch. The pull request is the staging environment: CI builds both sites and runs every check before anything can merge. GitHub Pages deploys only the family output from `main`. The personal site at `tim.v-kins.com` is prepared locally, with hosting still pending. See `README.md` for both build commands. If a staging URL ever becomes necessary, it is a separate hosting target, not a second branch.

## Flow

1. Branch from `main`.
2. Commit. Messages start with `Publish:` for notes or `Site:` for everything else.
3. Open a pull request. The template is the gate checklist.
4. CI must pass: notes validated, dashes checked, both Hugo builds, site and theme tests, internal links, secret scan.
5. Squash merge. The PR title becomes the commit message. The branch is deleted automatically.
6. `Deploy` runs on `main`, builds the family site with the run number stamped into the page, deploys `public/` to the `production` environment, then checks the live build. Live verification is currently non-fatal while DNS setup is pending. It never uploads `public-tim/`; personal notes are not live until their separate hosting is configured and verified.

## Checks, and what each one stops

| Check | Stops |
|---|---|
| `scripts/check_notes.py` | A note that is not `publishable: cleared`, has a bad type, a date that does not match its filename, or uppercase tags. This is the confidentiality gate, enforced. |
| `scripts/check_dashes.py` | Any en or em dash in content, layouts, styles or docs. |
| `hugo --printPathWarnings` | A theme or config error. |
| `node --test scripts/site.test.mjs` after both builds | Theme regressions, wrong hostnames, or personal pages leaking into the family output. |
| lychee, offline | A broken internal link. |
| gitleaks | A token or key committed by accident. |

Run the first two locally with `python scripts/check_notes.py` and `python scripts/check_dashes.py content layouts assets README.md`.

## Versioning

No release tags. The deploy stamps `run_number.sha` into a `<meta name="build">` tag on every page, so any live page can be traced to the exact commit and workflow run. Git history is the changelog.

## The vault is upstream

Notes are written in the private vault, gated there, and copied here. Never edit a note only in this repo; fix it in the vault and copy again. See the vault's `scripts/publish-note.ps1`.
