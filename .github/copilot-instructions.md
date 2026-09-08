# Copilot instructions - v-kins.com

`AGENTS.md` at the repo root is the full source of truth. This file restates the rules Copilot needs on every turn.

## Writing Style - No Em Dashes

- **Never use the em dash (U+2014) or the en dash (U+2013)** in anything produced for this repo: notes, page copy, layouts, styles, config, scripts, comments, commit messages, PR titles and bodies. Escaped forms (HTML entities and backslash-u escapes for 2013 and 2014) count too.
- Use a normal hyphen (`-`) instead: spaced between clauses ("patterns yes - people never"), unspaced in ranges ("1-2").
- `python scripts/check_dashes.py .` fails on any hit; `python scripts/check_dashes.py . --fix` rewrites them. Run it before every PR. CI runs it too.

## The gate

- Only notes with `publishable: cleared` and `status: draft` or `published` belong in `content/notes/`. `scripts/check_notes.py` enforces it.
- Patterns yes; people and deals never. No identifiable customers, colleagues or company internals.
- Notes are fixed in the vault and copied again, never edited here alone.

## Git Branching and PR Policy

1. `git checkout main && git pull && git checkout -b note/<slug>` (or `site/<change>`)
2. Commit with a `Publish:` or `Site:` prefix. No dashes in messages.
3. Push the branch and open a PR against `main`. The PR template is the checklist.
4. CI must pass: `build` (notes gate, dashes, Hugo build, internal links) and `secret scan`.
5. Squash merge via the GitHub PR only. Never merge locally into `main`. The branch is deleted on merge.

`main` is production. It is protected by a ruleset with no bypass. `Deploy` runs on `main` only.

## Do not

- Do not use em dashes or en dashes anywhere - plain hyphen only.
- Do not add analytics, comments, newsletters, forms or third-party scripts. The plan rules them out at launch.
- Do not add a `dev` or `uat` branch. The pull request is the staging environment.
- Do not commit secrets. gitleaks runs on every push.
