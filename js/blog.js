/* ========================================
   Blog Renderer + Router
   Lazy-loads marked + DOMPurify + highlight.js from CDN on first use.
   Exposes window.blog = { list, read, search, setTag, ... }.
   ======================================== */

(function () {
    'use strict';

    const MANIFEST_URL = 'posts/index.json';

    const DEPS = {
        marked:    'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
        dompurify: 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js',
        hljs:      'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.10.0/build/highlight.min.js'
    };

    const state = {
        manifest: null,
        manifestPromise: null,
        depsPromise: null,
        renderedPostCache: new Map(),  // slug -> sanitized HTML
        currentSlug: null,
        activeTags: new Set(),
        searchTerm: '',
        injectedOg: []
    };

    // ----------------------------------------
    // CDN loader
    // ----------------------------------------
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-blog-dep="${src}"]`);
            if (existing) {
                if (existing.dataset.loaded === '1') return resolve();
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', reject);
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.dataset.blogDep = src;
            s.addEventListener('load', () => {
                s.dataset.loaded = '1';
                resolve();
            });
            s.addEventListener('error', () => reject(new Error('Failed to load ' + src)));
            document.head.appendChild(s);
        });
    }

    function loadDeps() {
        if (state.depsPromise) return state.depsPromise;
        state.depsPromise = Promise.all([
            loadScript(DEPS.marked),
            loadScript(DEPS.dompurify),
            loadScript(DEPS.hljs)
        ]).then(() => {
            if (window.marked && typeof window.marked.setOptions === 'function') {
                window.marked.setOptions({
                    gfm: true,
                    breaks: false,
                    headerIds: true,
                    mangle: false
                });
            }
        }).catch(err => {
            // Don't cache a failed load; allow a retry on the next attempt.
            state.depsPromise = null;
            throw err;
        });
        return state.depsPromise;
    }

    // ----------------------------------------
    // Manifest
    // ----------------------------------------
    function loadManifest() {
        if (state.manifestPromise) return state.manifestPromise;
        state.manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
            .then(r => {
                if (!r.ok) throw new Error('Failed to load post index');
                return r.json();
            })
            .then(data => {
                state.manifest = (data && data.posts) || [];
                return state.manifest;
            })
            .catch(err => {
                // Don't cache a failed fetch; allow a retry on the next attempt.
                state.manifestPromise = null;
                throw err;
            });
        return state.manifestPromise;
    }

    // ----------------------------------------
    // Helpers
    // ----------------------------------------
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(iso) {
        const parts = iso.split('-');
        if (parts.length !== 3) return iso;
        const d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    }

    function getMount() {
        // Desktop: terminal page region. Mobile: active mobile-page.
        const desktop = document.querySelector('.desktop-only .terminal-page');
        if (desktop && desktop.offsetParent !== null) return desktop;
        const mobileActive = document.querySelector('.mobile-only .mobile-page.active');
        if (mobileActive) return mobileActive;
        return desktop || mobileActive;
    }

    function emitRendered(name) {
        document.dispatchEvent(new CustomEvent('terminal:page-rendered', {
            detail: { page: name }
        }));
    }

    // ----------------------------------------
    // URL state
    // ----------------------------------------
    function updateUrl(params) {
        const url = new URL(window.location.href);
        ['post', 'tag', 'q'].forEach(k => url.searchParams.delete(k));
        Object.keys(params).forEach(k => {
            if (params[k]) url.searchParams.set(k, params[k]);
        });
        const target = url.pathname + (url.search ? url.search : '') + url.hash;
        if (target !== window.location.pathname + window.location.search + window.location.hash) {
            history.pushState({}, '', target);
        }
    }

    function clearInjectedOg() {
        state.injectedOg.forEach(el => el.remove());
        state.injectedOg = [];
    }

    function setOg(post) {
        clearInjectedOg();
        const meta = (property, content) => {
            const el = document.createElement('meta');
            el.setAttribute('property', property);
            el.setAttribute('content', content);
            el.dataset.blogOg = '1';
            document.head.appendChild(el);
            state.injectedOg.push(el);
        };
        const url = window.location.origin + window.location.pathname + '?post=' + post.slug;
        meta('og:type', 'article');
        meta('og:title', post.title);
        meta('og:description', post.summary || '');
        meta('og:url', url);
    }

    // ----------------------------------------
    // List view
    // ----------------------------------------
    function applyFilters(posts) {
        const term = state.searchTerm.trim().toLowerCase();
        const tags = state.activeTags;
        return posts.filter(p => {
            if (tags.size) {
                const hit = p.tags && p.tags.some(t => tags.has(t));
                if (!hit) return false;
            }
            if (term) {
                const hay = [
                    p.title,
                    p.summary || '',
                    (p.tags || []).join(' ')
                ].join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }

    function renderList() {
        const mount = getMount();
        if (!mount) return;
        clearInjectedOg();
        state.currentSlug = null;

        const posts = state.manifest || [];
        const allTags = Array.from(
            new Set(posts.flatMap(p => p.tags || []))
        ).sort();

        const filtered = applyFilters(posts);

        const tagChips = allTags.map(tag => {
            const active = state.activeTags.has(tag) ? ' is-active' : '';
            return `<button type="button" class="blog-tag${active}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
        }).join('');

        const rowsHtml = filtered.length
            ? filtered.map(p => `
<a href="?post=${encodeURIComponent(p.slug)}" class="post-item" data-slug="${escapeHtml(p.slug)}">
  <div class="post-item-head">
    <span class="post-date">${escapeHtml(formatDate(p.date))}</span>
    <span class="post-meta">${p.readingMinutes} min read · ${p.wordCount.toLocaleString()} words</span>
  </div>
  <div class="post-title">${escapeHtml(p.title)}</div>
  ${p.summary ? `<div class="post-summary">${escapeHtml(p.summary)}</div>` : ''}
  ${p.tags && p.tags.length ? `<div class="post-tags">${p.tags.map(t => `<span class="blog-tag is-mini">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
</a>
            `).join('')
            : `<div class="blog-empty text-muted">No posts match the current filter.</div>`;

        mount.innerHTML = `
<span class="section-header">Blog</span>
<div class="blog-controls">
  <input type="search" class="blog-search" placeholder="search title, summary, or tag…" value="${escapeHtml(state.searchTerm)}" aria-label="Search posts">
  ${allTags.length ? `<div class="blog-tags" role="group" aria-label="Filter by tag">${tagChips}</div>` : ''}
</div>
<div class="blog-list">${rowsHtml}</div>
<div class="blog-footer text-muted">
  <a href="posts/feed.xml" class="terminal-link" target="_blank" rel="noopener">RSS feed</a>
</div>
        `;

        bindListInteractions(mount);
        emitRendered('blog');
    }

    function bindListInteractions(mount) {
        const search = mount.querySelector('.blog-search');
        if (search) {
            search.addEventListener('input', (e) => {
                state.searchTerm = e.target.value;
                updateUrl({
                    tag: Array.from(state.activeTags).join(',') || '',
                    q: state.searchTerm || ''
                });
                renderList();
                // restore focus + caret position after re-render
                const fresh = document.querySelector('.blog-search');
                if (fresh) {
                    fresh.focus();
                    const v = fresh.value;
                    fresh.setSelectionRange(v.length, v.length);
                }
            });
        }

        mount.querySelectorAll('.blog-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = btn.dataset.tag;
                if (!tag) return;
                if (state.activeTags.has(tag)) {
                    state.activeTags.delete(tag);
                } else {
                    state.activeTags.add(tag);
                }
                updateUrl({
                    tag: Array.from(state.activeTags).join(',') || '',
                    q: state.searchTerm || ''
                });
                renderList();
            });
        });

        mount.querySelectorAll('.post-item').forEach(link => {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                const slug = link.dataset.slug;
                if (slug) read(slug);
            });
        });
    }

    // ----------------------------------------
    // Single post view
    // ----------------------------------------
    function findPost(slug) {
        return (state.manifest || []).find(p => p.slug === slug);
    }

    function renderPostHtml(post, bodyHtml) {
        const tagsRow = post.tags && post.tags.length
            ? `<div class="post-tags">${post.tags.map(t => `<span class="blog-tag is-mini" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';

        return `
<a href="#" class="post-back" data-action="back">[ ← back to blog ]</a>
<article class="post-article">
  <header class="post-header">
    <h1 class="post-headline">${escapeHtml(post.title)}</h1>
    <div class="post-byline text-muted">
      <span>${escapeHtml(formatDate(post.date))}</span>
      <span aria-hidden="true">·</span>
      <span>${post.readingMinutes} min read</span>
      <span aria-hidden="true">·</span>
      <span>${post.wordCount.toLocaleString()} words</span>
    </div>
    ${tagsRow}
  </header>
  <div class="post-body">${bodyHtml}</div>
</article>
<a href="#" class="post-back" data-action="back">[ ← back to blog ]</a>
        `;
    }

    function decorateCodeBlocks(mount) {
        if (!window.hljs) return;
        mount.querySelectorAll('pre > code').forEach(codeEl => {
            try { window.hljs.highlightElement(codeEl); } catch (_) {}
            const pre = codeEl.parentElement;
            if (pre.querySelector('.code-copy')) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-copy';
            btn.textContent = '[copy]';
            btn.addEventListener('click', async () => {
                const text = codeEl.textContent;
                const ok = await copyText(text);
                btn.textContent = ok ? '[copied]' : '[failed]';
                setTimeout(() => { btn.textContent = '[copy]'; }, 1400);
            });
            pre.appendChild(btn);
        });
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (_) {}
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }

    function stripFrontmatter(text) {
        if (!text.startsWith('---')) return text;
        const end = text.indexOf('\n---', 3);
        if (end === -1) return text;
        return text.slice(end + 4).replace(/^\n+/, '');
    }

    function sanitize(rawHtml) {
        if (!window.DOMPurify) return rawHtml;
        return window.DOMPurify.sanitize(rawHtml, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: [
                'allow', 'allowfullscreen', 'frameborder',
                'scrolling', 'loading', 'referrerpolicy'
            ],
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        });
    }

    async function fetchPostBody(post) {
        if (state.renderedPostCache.has(post.slug)) {
            return state.renderedPostCache.get(post.slug);
        }
        const path = post.file || ('posts/' + post.slug + '.md');
        const res = await fetch(path, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load post: ' + post.slug);
        const raw = stripFrontmatter(await res.text());
        const html = sanitize(window.marked.parse(raw));
        state.renderedPostCache.set(post.slug, html);
        return html;
    }

    async function read(slug) {
        try {
            await Promise.all([loadDeps(), loadManifest()]);
        } catch (err) {
            renderError('Failed to load blog dependencies.');
            return;
        }

        const post = findPost(slug);
        if (!post) {
            renderError('Post not found: ' + slug);
            return;
        }

        const mount = getMount();
        if (!mount) return;
        mount.innerHTML = '<div class="blog-loading text-muted">loading post…</div>';

        try {
            const html = await fetchPostBody(post);
            mount.innerHTML = renderPostHtml(post, html);
            decorateCodeBlocks(mount);
            bindPostInteractions(mount);
            state.currentSlug = slug;
            updateUrl({ post: slug });
            setOg(post);
            window.scrollTo({ top: 0 });
            const body = mount.querySelector('.terminal-body, .mobile-content');
            if (body) body.scrollTop = 0;
            emitRendered('blog');
        } catch (err) {
            renderError('Failed to render post.');
            console.error(err);
        }
    }

    function bindPostInteractions(mount) {
        mount.querySelectorAll('[data-action="back"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                list();
            });
        });
        mount.querySelectorAll('.post-tags .blog-tag[data-tag]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                state.activeTags = new Set([btn.dataset.tag]);
                state.searchTerm = '';
                list();
            });
        });
    }

    function renderError(message) {
        const mount = getMount();
        if (!mount) return;
        mount.innerHTML = `<div class="blog-error text-error">${escapeHtml(message)}</div>`;
    }

    // ----------------------------------------
    // Public entry points
    // ----------------------------------------
    async function list(opts) {
        opts = opts || {};
        try {
            await loadManifest();
        } catch (err) {
            console.error('blog: failed to load post index', err);
            renderError('Failed to load post index.');
            return;
        }
        if (Array.isArray(opts.tags)) state.activeTags = new Set(opts.tags);
        if (typeof opts.q === 'string') state.searchTerm = opts.q;
        renderList();
        updateUrl({
            tag: Array.from(state.activeTags).join(',') || '',
            q: state.searchTerm || ''
        });
    }

    async function readByIndex(n) {
        try {
            await loadManifest();
        } catch (err) {
            console.error('blog: failed to load post index', err);
            renderError('Failed to load post index.');
            return;
        }
        const idx = Math.max(1, Math.floor(n)) - 1;
        const post = (state.manifest || [])[idx];
        if (!post) {
            renderError('No post at index ' + n);
            return;
        }
        read(post.slug);
    }

    function handleQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const post = params.get('post');
        if (post) {
            read(post);
            return true;
        }
        const tag = params.get('tag');
        const q = params.get('q');
        if (tag || q) {
            list({
                tags: tag ? tag.split(',').filter(Boolean) : [],
                q: q || ''
            });
            return true;
        }
        return false;
    }

    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        const post = params.get('post');
        if (post) {
            read(post);
        } else if (params.has('tag') || params.has('q')) {
            list({
                tags: (params.get('tag') || '').split(',').filter(Boolean),
                q: params.get('q') || ''
            });
        }
    });

    window.blog = {
        list,
        read,
        readByIndex,
        handleQueryParams,
        getManifest: () => state.manifest
    };
})();
