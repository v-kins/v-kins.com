# How changes reach v-kins.com

A one-person publication with production discipline. The rules are few, and they are enforced by the repo rather than by memory.

## Branches

| Branch | Role |
|---|---|
| `main` | Production. Whatever is on `main` is what v-kins.com serves. Protected: no direct pushes, no force pushes, no deletion. |
| `note/<slug>` | One published note. Created by `scripts/publish-note.ps1` in the vault, or by hand. |
| `site/<change>` | A change to the theme, config or workflows. |

No `dev` or `uat` branch. The pull request is the staging environment: CI builds the site and runs every check before anything can merge, and GitHub Pages deploys only from `main`. If a staging URL ever becomes necessary, it is a second Pages repo, not a second branch.

## Flow

1. Branch from `main`.
2. Commit. Messages start with `Publish:` for notes or `Site:` for everything else.
3. Open a pull request. The template is the gate checklist.
4. CI must pass: notes validated, dashes checked, Hugo build, internal links, secret scan.
5. Squash merge. The PR title becomes the commit message. The branch is deleted automatically.
6. `Deploy` runs on `main`, builds with the run number stamped into the page, deploys to the `production` environment, then fetches the live site and confirms it serves that build.

## Checks, and what each one stops

| Check | Stops |
|---|---|
| `scripts/check_notes.py` | A note that is not `publishable: cleared`, has a bad type, a date that does not match its filename, or uppercase tags. This is the confidentiality gate, enforced. |
| `scripts/check_dashes.py` | Any en or em dash in content, layouts, styles or docs. |
| `hugo --printPathWarnings` | A theme or config error. |
| lychee, offline | A broken internal link. |
| gitleaks | A token or key committed by accident. |

Run the first two locally with `python scripts/check_notes.py` and `python scripts/check_dashes.py content layouts assets README.md`.

## Versioning

No release tags. The deploy stamps `run_number.sha` into a `<meta name="build">` tag on every page, so any live page can be traced to the exact commit and workflow run. Git history is the changelog.

## The vault is upstream

Notes are written in the private vault, gated there, and copied here. Never edit a note only in this repo; fix it in the vault and copy again. See the vault's `scripts/publish-note.ps1`.
