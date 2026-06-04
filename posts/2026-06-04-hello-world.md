---
title: Hello, World
date: 2026-06-04
tags: [meta, site]
summary: A placeholder first post to validate the blog pipeline end-to-end.
---

This is the first post on my new blog. It exists primarily to validate that the
build script, manifest, RSS feed, renderer, and deep-link routing all work
end-to-end. Real content is on the way.

## Why a blog here

I've been writing more lately — about automation, AI tooling, and the back-end
work I've been doing at Grainger and on personal projects. Rather than dropping
those thoughts straight into LinkedIn, I want them to live somewhere I own
first, and **then** cross-post.

## What to expect

Posts will land here roughly weekly. They'll lean prose-heavy, but I'm not going
to shy away from the things that actually make a technical post useful:

- Code blocks with syntax highlighting
- Diagrams and screenshots when they pull weight
- The occasional embed when nothing else fits

Here's what a fenced code block looks like, just to confirm the highlight theme
behaves:

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


print(fibonacci(10))  # 55
```

And inline code like `git rebase --interactive HEAD~5` should render in the
accent color.

> Quotes look like this — useful for citing other people's writing without
> losing the visual cue that the words aren't mine.

That's it for now. See you in the next one.
