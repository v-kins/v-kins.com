@AGENTS.md
@.github/copilot-instructions.md

# Claude Code notes for this repo

The two imports above are the source of truth. `AGENTS.md` carries the writing style, the gate and the source control policy. Do not duplicate their content here; edit them instead.

## Where Claude Code differs

- Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Pushing to the v-kins org needs the personal GitHub account. Run `gh auth switch --user TimothyWatkins` before the push and `gh auth switch --user Timothy-Watkins_wiise` straight after, in the same command, so the work account is always restored.
- `main` is protected. Never push to it; branch, push the branch, open a PR with `gh pr create`, and merge with `gh pr merge --squash` once checks are green. Do not try to bypass the ruleset.
- Shell: PowerShell is primary; the Bash tool also works. WSL is not available. Always pass Windows paths (`C:\...`) to file tools.
- Hugo is installed via winget. In PowerShell `hugo` is on PATH. In the Bash tool locate it with `find "$(cygpath "$LOCALAPPDATA")/Microsoft/WinGet/Packages" -name hugo.exe`.
- Writing style: the **Writing Style (mandatory)** section of `AGENTS.md` (no em dashes or en dashes, plain hyphen only) applies to everything Claude writes here, chat replies included, and must be copied into any subagent prompt that writes text. `python scripts/check_dashes.py .` is the gate before a PR.
