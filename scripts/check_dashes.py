#!/usr/bin/env python3
"""Fail if an en dash (U+2013) or em dash (U+2014) appears anywhere in the given paths.

House style: a plain hyphen, always. Spaced when it joins clauses ("patterns yes - people never"),
unspaced in ranges ("1-2"). Escaped forms (HTML entities and \\u escapes) are banned too.

Usage:
    python scripts/check_dashes.py .            # scan the whole repo
    python scripts/check_dashes.py . --fix      # rewrite every hit to a hyphen, then re-scan
Directories are searched recursively; .git, public, node_modules and resources/_gen are skipped.
"""
import re
import sys
from pathlib import Path

EN, EM = chr(0x2013), chr(0x2014)
NAMES = {EN: "en dash", EM: "em dash"}
# Built by concatenation so this file never contains the banned sequences itself.
ESCAPED = ["&" + "mdash;", "&" + "ndash;", "&#" + "8212;", "&#" + "8211;", "\\" + "u2014", "\\" + "u2013"]
SKIP_DIRS = {".git", "public", "node_modules", "resources", ".obsidian", ".trash"}
TEXT_SUFFIXES = {".md", ".html", ".css", ".toml", ".yml", ".yaml", ".txt", ".xml", ".svg", ".py", ".ps1", ".json", ".js", ".mjs", ".ts"}


def files(paths):
    for p in paths:
        path = Path(p)
        if path.is_dir():
            for f in path.rglob("*"):
                if f.is_file() and f.suffix in TEXT_SUFFIXES and not (set(f.parts) & SKIP_DIRS):
                    yield f
        elif path.is_file():
            yield path


def fix_text(text: str) -> str:
    text = re.sub(r"\s*" + EM + r"\s*", " - ", text)
    text = re.sub(r"\s+" + EN + r"\s+", " - ", text)
    text = text.replace(EN, "-")
    return text


def scan(paths, fix=False) -> int:
    hits = 0
    for f in files(paths):
        try:
            text = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if fix and (EN in text or EM in text):
            new = fix_text(text)
            f.write_text(new, encoding="utf-8", newline="")
            print(f"fixed: {f.as_posix()}")
            text = new
        for i, line in enumerate(text.splitlines(), 1):
            for ch, name in NAMES.items():
                if ch in line:
                    hits += 1
                    print(f"{f.as_posix()}:{i}: {name}: {line.strip()[:100]}")
            for esc in ESCAPED:
                if esc in line:
                    hits += 1
                    print(f"{f.as_posix()}:{i}: escaped dash {esc}: {line.strip()[:100]}")
    print(f"{hits} dash(es) found")
    return hits


def main(argv) -> int:
    # Windows consoles default to cp1252 and cannot print the very characters we report.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    fix = "--fix" in argv
    paths = [a for a in argv if a != "--fix"] or ["."]
    return 1 if scan(paths, fix=fix) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
