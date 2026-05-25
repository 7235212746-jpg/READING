from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".github", "_site"}
INLINE_DOUBLE_DOLLAR = re.compile(r"\$\$([^$\n]+?)\$\$")
SINGLE_DOLLAR = re.compile(r"(?<!\$)\$(?!\$)")


def normalize_document(text: str) -> str:
    lines = text.splitlines(keepends=True)
    normalized: list[str] = []
    in_fence = False
    in_display = False
    for line in lines:
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
        if in_fence:
            # Documentation examples must teach the current safe syntax too.
            normalized.append(INLINE_DOUBLE_DOLLAR.sub(r"\\(\1\\)", line))
            continue
        if line.strip() == "$$":
            normalized.append(("\\]" if in_display else "\\[") + ("\n" if line.endswith("\n") else ""))
            in_display = not in_display
            continue
        normalized.append(INLINE_DOUBLE_DOLLAR.sub(r"\\(\1\\)", line))
    return "".join(normalized)


def markdown_files() -> list[Path]:
    return sorted(
        path for path in ROOT.rglob("*.md")
        if not any(part in SKIP_DIRS for part in path.parts)
    )


def main() -> int:
    check_only = "--check" in sys.argv
    changed: list[Path] = []
    errors: list[str] = []
    for path in markdown_files():
        original = path.read_text(encoding="utf-8")
        updated = normalize_document(original)
        if updated != original:
            changed.append(path)
            if not check_only:
                path.write_text(updated, encoding="utf-8")
        if SINGLE_DOLLAR.search(updated):
            errors.append(f"Single-dollar math marker remains: {path.relative_to(ROOT)}")
    if check_only and changed:
        errors.extend(f"Legacy $$ marker remains: {path.relative_to(ROOT)}" for path in changed)
    if errors:
        print("\n".join(errors))
        return 1
    if changed:
        print("Normalized math delimiters in:")
        for path in changed:
            print(f"- {path.relative_to(ROOT)}")
    else:
        print("Math delimiters already follow the publishing standard.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
