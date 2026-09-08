#!/usr/bin/env python3
"""Fail if any en dash (U+2013) or em dash (U+2014) appears in the given paths.

House style uses a plain hyphen everywhere. Usage:
    python3 scripts/check_dashes.py content layouts assets README.md
Directories are searched recursively for text files.
"""
import sys
from pathlib import Path

DASHES = {"–": "en dash", "—": "em dash"}
TEXT_SUFFIXES = {".md", ".html", ".css", ".toml", ".yml", ".yaml", ".txt", ".xml", ".svg", ".py", ".ps1", ".json"}


def files(paths):
    for p in paths:
        path = Path(p)
        if path.is_dir():
            yield from (f for f in path.rglob("*") if f.is_file() and f.suffix in TEXT_SUFFIXES)
        elif path.is_file():
            yield path


def main(argv) -> int:
    hits = 0
    for f in files(argv or ["."]):
        try:
            lines = f.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError:
            continue
        for i, line in enumerate(lines, 1):
            for ch, name in DASHES.items():
                if ch in line:
                    hits += 1
                    print(f"{f.as_posix()}:{i}: {name}: {line.strip()[:100]}")
    print(f"{hits} dash(es) found")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
