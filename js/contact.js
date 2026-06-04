/* ========================================
   Contact Cards — Interactive Behavior
   - Email assembly from data-u / data-d (kept out of static HTML)
   - Click-to-copy with Clipboard API + execCommand fallback
   - rAF-driven text scramble on hover/focus
   - prefers-reduced-motion respected
   ======================================== */

(function () {
    'use strict';

    const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
    const TOAST_MS = 1400;
    const NAV_DELAY_MS = 450;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const initialized = new WeakSet();

    function assembleEmail(card) {
        const user = card.dataset.u;
        const domain = card.dataset.d;
        if (!user || !domain) return null;
        return user + '@' + domain;
    }

    function prepareEmailCard(card) {
        const email = assembleEmail(card);
        if (!email) return;
        card.href = 'mailto:' + email;
        card.dataset.copy = email;
        // Replace the placeholder text once and remember the resolved value
        // so the scrambler picks it up.
        const target = card.querySelector('[data-target]');
        if (target && !card.dataset.revealed) {
            target.textContent = email;
            card.dataset.revealed = '1';
        }
    }

    class Scrambler {
        constructor(el) {
            this.el = el;
            this.frameRequest = null;
        }

        start() {
            if (reduceMotion.matches) return;
            cancelAnimationFrame(this.frameRequest);
            this.original = this.el.textContent;
            this.frame = 0;
            this.queue = [];
            for (let i = 0; i < this.original.length; i++) {
                const start = Math.floor(Math.random() * 8);
                const end = start + Math.floor(Math.random() * 12) + 6;
                this.queue.push({ to: this.original[i], start, end, char: '' });
            }
            this.update();
        }

        stop() {
            cancelAnimationFrame(this.frameRequest);
            if (this.original != null) this.el.textContent = this.original;
        }

        update() {
            let output = '';
            let complete = 0;
            for (let i = 0; i < this.queue.length; i++) {
                const item = this.queue[i];
                if (this.frame >= item.end) {
                    complete++;
                    output += item.to;
                } else if (this.frame >= item.start) {
                    if (!item.char || Math.random() < 0.28) {
                        item.char = SCRAMBLE_CHARS[
                            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                        ];
                    }
                    output += item.char;
                } else {
                    output += item.to;
                }
            }
            this.el.textContent = output;
            if (complete === this.queue.length) return;
            this.frameRequest = requestAnimationFrame(() => this.update());
            this.frame++;
        }
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (_) { /* fall through */ }
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

    function initRoot(root) {
        if (!root || initialized.has(root)) return;
        initialized.add(root);

        const toast = root.querySelector('.copy-toast');
        const announcer =
            root.parentElement &&
            root.parentElement.querySelector('[data-copy-announcer]');
        let toastTimer = null;

        function showToast(card, message) {
            if (!toast) return;
            const rootRect = root.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            toast.style.top =
                (cardRect.top - rootRect.top + cardRect.height / 2) + 'px';
            toast.textContent = message;
            toast.classList.add('is-visible');
            if (announcer) announcer.textContent = message;
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('is-visible');
            }, TOAST_MS);
        }

        // Per-card setup
        root.querySelectorAll('.contact-card').forEach((card) => {
            // Email cards reveal on first interaction
            const isEmail = card.dataset.channel === 'email';
            const target = card.querySelector('[data-target]');
            const scrambler = target ? new Scrambler(target) : null;

            const onEnter = () => {
                if (isEmail) prepareEmailCard(card);
                if (scrambler) scrambler.start();
            };
            const onLeave = () => {
                if (scrambler) scrambler.stop();
            };

            card.addEventListener('pointerenter', onEnter);
            card.addEventListener('pointerleave', onLeave);
            card.addEventListener('focus', onEnter);
            card.addEventListener('blur', onLeave);
        });

        // Event-delegated click-to-copy
        root.addEventListener('click', async (e) => {
            const card = e.target.closest('.contact-card');
            if (!card) return;

            // Modifier / middle clicks pass through to the browser
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
                if (card.dataset.channel === 'email') prepareEmailCard(card);
                return;
            }

            if (card.dataset.channel === 'email') prepareEmailCard(card);
            const payload = card.dataset.copy;
            if (!payload) return;

            e.preventDefault();
            const ok = await copyText(payload);
            showToast(card, ok ? 'copied \u2713' : 'copy failed');

            setTimeout(() => {
                if (card.target === '_blank') {
                    window.open(card.href, '_blank', 'noopener');
                } else {
                    window.location.href = card.href;
                }
            }, NAV_DELAY_MS);
        });
    }

    function initAll() {
        document.querySelectorAll('.contact-cards').forEach(initRoot);
    }

    // Desktop terminal regenerates the page on navigation
    document.addEventListener('terminal:page-rendered', (e) => {
        if (!e.detail || e.detail.page === 'contact') initAll();
    });

    // Mobile + initial load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
