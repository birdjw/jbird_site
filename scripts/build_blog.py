#!/usr/bin/env python3
"""
Blog manifest + RSS generator.

Walks posts/*.md (skipping posts/drafts/), parses simple YAML-ish frontmatter,
and emits:
  - posts/index.json  — sorted newest-first; consumed by js/blog.js
  - posts/feed.xml    — RSS 2.0; linked from index.html <head>

Usage:
    python3 scripts/build_blog.py

No third-party dependencies.
"""

import json
import math
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

REPO_ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = REPO_ROOT / "posts"
INDEX_PATH = POSTS_DIR / "index.json"
FEED_PATH = POSTS_DIR / "feed.xml"

SITE_TITLE = "jbird's blog"
SITE_URL = "https://jbird.dev"  # update if the canonical host changes
SITE_DESCRIPTION = "Notes on automation, back-end engineering, and AI-assisted development."
WORDS_PER_MINUTE = 220


def parse_frontmatter(text: str):
    """Return (meta dict, body str). Frontmatter is the first --- ... --- block."""
    if not text.startswith("---"):
        return {}, text

    end = text.find("\n---", 3)
    if end == -1:
        return {}, text

    raw = text[3:end].strip()
    body = text[end + 4:].lstrip("\n")

    meta = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()

        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            if inner:
                items = [item.strip().strip("'\"") for item in inner.split(",")]
                meta[key] = [item for item in items if item]
            else:
                meta[key] = []
        else:
            if (value.startswith('"') and value.endswith('"')) or (
                value.startswith("'") and value.endswith("'")
            ):
                value = value[1:-1]
            meta[key] = value

    return meta, body


def derive_slug(path: Path, meta: dict) -> str:
    if "slug" in meta and meta["slug"]:
        return meta["slug"]
    stem = path.stem
    # Strip leading YYYY-MM-DD- if present
    match = re.match(r"^\d{4}-\d{2}-\d{2}-(.+)$", stem)
    if match:
        return match.group(1)
    return stem


def parse_date(meta: dict, path: Path) -> str:
    """Return ISO date (YYYY-MM-DD). Fall back to the filename prefix."""
    raw = meta.get("date")
    if raw:
        try:
            return datetime.strptime(raw, "%Y-%m-%d").strftime("%Y-%m-%d")
        except ValueError:
            pass
    match = re.match(r"^(\d{4}-\d{2}-\d{2})", path.stem)
    if match:
        return match.group(1)
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def count_words(body: str) -> int:
    # Strip fenced code blocks, inline code, html tags, then count.
    stripped = re.sub(r"```.*?```", " ", body, flags=re.DOTALL)
    stripped = re.sub(r"`[^`]*`", " ", stripped)
    stripped = re.sub(r"<[^>]+>", " ", stripped)
    stripped = re.sub(r"[^\w\s'-]+", " ", stripped, flags=re.UNICODE)
    tokens = [t for t in stripped.split() if any(ch.isalnum() for ch in t)]
    return len(tokens)


def to_rfc822(date_iso: str) -> str:
    dt = datetime.strptime(date_iso, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")


def build_index():
    if not POSTS_DIR.exists():
        print(f"posts/ directory not found at {POSTS_DIR}", file=sys.stderr)
        sys.exit(1)

    entries = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        if path.name.startswith("_"):
            continue
        text = path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)

        title = meta.get("title") or path.stem
        slug = derive_slug(path, meta)
        date_iso = parse_date(meta, path)
        tags = meta.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        summary = meta.get("summary") or ""

        word_count = count_words(body)
        reading_minutes = max(1, math.ceil(word_count / WORDS_PER_MINUTE))

        entries.append({
            "slug": slug,
            "title": title,
            "date": date_iso,
            "summary": summary,
            "tags": tags,
            "wordCount": word_count,
            "readingMinutes": reading_minutes,
            "file": f"posts/{path.name}",
        })

    entries.sort(key=lambda e: (e["date"], e["slug"]), reverse=True)
    return entries


def write_index(entries):
    INDEX_PATH.write_text(
        json.dumps({"posts": entries}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  wrote {INDEX_PATH.relative_to(REPO_ROOT)} ({len(entries)} post{'s' if len(entries) != 1 else ''})")


def write_feed(entries):
    now_rfc = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    items = []
    for e in entries:
        link = f"{SITE_URL}/?post={e['slug']}"
        item_xml = [
            "    <item>",
            f"      <title>{xml_escape(e['title'])}</title>",
            f"      <link>{xml_escape(link)}</link>",
            f"      <guid isPermaLink=\"true\">{xml_escape(link)}</guid>",
            f"      <pubDate>{to_rfc822(e['date'])}</pubDate>",
        ]
        if e.get("summary"):
            item_xml.append(f"      <description>{xml_escape(e['summary'])}</description>")
        for tag in e.get("tags", []):
            item_xml.append(f"      <category>{xml_escape(tag)}</category>")
        item_xml.append("    </item>")
        items.append("\n".join(item_xml))

    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{xml_escape(SITE_TITLE)}</title>
    <link>{xml_escape(SITE_URL)}</link>
    <description>{xml_escape(SITE_DESCRIPTION)}</description>
    <lastBuildDate>{now_rfc}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
    FEED_PATH.write_text(feed, encoding="utf-8")
    print(f"  wrote {FEED_PATH.relative_to(REPO_ROOT)}")


def main():
    entries = build_index()
    write_index(entries)
    write_feed(entries)


if __name__ == "__main__":
    main()
