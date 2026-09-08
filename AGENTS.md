# AGENTS.md - v-kins.com

Shared instructions for every AI assistant and every person working in this repo. `CLAUDE.md` and `.github/copilot-instructions.md` import or restate this file; edit here first.

## What this repo is

The public site for V-Kins, notes from the field by Timothy Watkins. Hugo, a handmade theme, GitHub Pages at v-kins.com. Notes are written and gated in the private vault repo and copied here; this repo only ever holds what has passed the gate. Branching, checks and deploys are in `CONTRIBUTING.md`.

## Writing Style (mandatory)

- **Never use the em dash (U+2014) or the en dash (U+2013)** anywhere in this repo: notes, page copy, layouts, styles, config, scripts, comments, commit messages, PR titles and bodies, release notes. The escaped forms (`&` `mdash;`, `&` `ndash;`, `&#` `8212;`, `&#` `8211;`, and the backslash-u escapes for 2013 and 2014) are banned the same way.
- Use a normal hyphen (`-`) instead: spaced when it joins clauses ("patterns yes - people never"), unspaced in ranges ("1-2").
- `python scripts/check_dashes.py .` scans every text file and fails on any hit. `python scripts/check_dashes.py . --fix` rewrites the hits to hyphens. CI runs the check on every PR and every deploy; a hit is a build-breaking defect.
- Any subagent or assistant prompt that produces text must carry this rule.
- Australian conventions: metric units, dates as day month year (site) or DD/MM/YYYY (docs), en-AU spelling.

## The gate (mandatory)

- A note may only exist under `content/notes/` if its front matter says `publishable: cleared` and `status` is `draft` or `published`. `scripts/check_notes.py` enforces this in CI.
- Patterns yes. People, customers, deals and confidential conversations never. No identifiable colleagues or company internals. The denylist of internal names lives in the vault, not here, because this repo is public.
- The employer's name may appear on About and Now, the pages about the author. It may not appear in a note.
- `content/now.md` is copied from the vault's `_now.md` through the same PR flow as a note.
- Never edit a note only in this repo. Fix it in the vault and copy it again.

## Source control policy

- `main` is production and is protected by a ruleset: pull request required, `build` and `secret scan` checks required, all review threads resolved, no force pushes, no deletion, linear history. Nobody bypasses, including the owner.
- Branch from `main` as `note/<slug>` for a note or `site/<change>` for anything else. Commit messages start with `Publish:` or `Site:`.
- Squash merge only, via the GitHub PR. The PR title becomes the commit message. Branches are deleted on merge.
- `Deploy` runs on `main` only, into the `production` environment, stamps `run_number.sha` into every page and verifies the live site serves that build.

## Security

- No secrets in this repo, ever. gitleaks runs on every PR and push. The site has no backend, no forms, no analytics and no third-party scripts beyond Google Fonts.
- Dependabot keeps the GitHub Actions current. Merge its PRs through the normal flow.
