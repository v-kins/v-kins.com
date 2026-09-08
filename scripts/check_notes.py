#!/usr/bin/env python3
"""Validate every published note in content/notes before the site builds.

Fails the build when a note:
- has a filename that is not YYYY-MM-DD-short-slug.md
- is missing title, date, type or tags in its front matter
- has a date that does not match the filename
- has a type outside the five allowed
- is not marked publishable: cleared (the confidentiality gate)
- has a status other than draft or published
- has tags that are not lowercase single words

Free-form tags outside the controlled list are allowed but reported.
No dependencies beyond the standard library.
"""
import re
import sys
from pathlib import Path

NOTES = Path("content/notes")
TYPES = {"observation", "lesson", "surprise", "changed-mind", "field-note"}
CONTROLLED_TAGS = {"erp", "teams", "customers", "ai", "telemetry", "product", "craft"}
STATUSES = {"draft", "published"}
FILENAME = re.compile(r"^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
TAG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def front_matter(text: str):
    """Tiny parser for the flat YAML this project uses: key: value, key: [a, b]."""
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    block, body = text[3:end], text[end + 4:]
    data = {}
    for raw in block.splitlines():
        line = raw.split("#", 1)[0].rstrip() if not raw.strip().startswith('"') else raw.rstrip()
        if not line.strip() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            items = [v.strip().strip('"').strip("'") for v in value[1:-1].split(",")]
            data[key.strip()] = [v for v in items if v]
        else:
            data[key.strip()] = value.strip('"').strip("'")
    return data, body


def main() -> int:
    if not NOTES.exists():
        print("no content/notes directory; nothing to check")
        return 0
    files = sorted(p for p in NOTES.glob("*.md") if p.name != "_index.md")
    errors, notes = [], []
    for path in files:
        fm, body = front_matter(path.read_text(encoding="utf-8"))
        where = path.as_posix()
        m = FILENAME.match(path.name)
        if not m:
            errors.append(f"{where}: filename must be YYYY-MM-DD-short-slug.md")
        if fm is None:
            errors.append(f"{where}: missing front matter")
            continue
        for key in ("title", "date", "type", "tags"):
            if key not in fm or not fm[key]:
                errors.append(f"{where}: missing {key}")
        if m and fm.get("date") and str(fm["date"]) != m.group(1):
            errors.append(f"{where}: date {fm['date']} does not match filename date {m.group(1)}")
        if fm.get("type") not in TYPES:
            errors.append(f"{where}: type must be one of {sorted(TYPES)}, got {fm.get('type')!r}")
        if fm.get("publishable") != "cleared":
            errors.append(f"{where}: publishable must be 'cleared' to be on the site, got {fm.get('publishable')!r}")
        if fm.get("status") not in STATUSES:
            errors.append(f"{where}: status must be draft or published, got {fm.get('status')!r}")
        tags = fm.get("tags") or []
        if isinstance(tags, str):
            tags = [tags]
        for t in tags:
            if not TAG.match(t):
                errors.append(f"{where}: tag {t!r} must be lowercase, single word or hyphenated")
            elif t not in CONTROLLED_TAGS:
                notes.append(f"{where}: free-form tag {t!r} (controlled list: {sorted(CONTROLLED_TAGS)})")
        if len(body.strip()) < 80:
            errors.append(f"{where}: body is too short to be a note")
    for n in notes:
        print("note:", n)
    for e in errors:
        print("error:", e)
    print(f"checked {len(files)} note(s), {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
