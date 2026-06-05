/* ========================================
   Mobile App — Landscape intro + command-pad nav
   ======================================== */

(function () {
    if (window.innerWidth > 768) return;

    const rotatePrompt    = document.getElementById('rotate-prompt');
    const mobileLandscape = document.getElementById('mobile-landscape');
    const pad             = document.getElementById('command-pad');
    const padMirror       = document.getElementById('pad-mirror');
    const padCursor       = document.getElementById('pad-cursor');
    const padKeys         = pad ? Array.from(pad.querySelectorAll('.pad-key')) : [];
    const pages           = Array.from(document.querySelectorAll('.mobile-page'));
    const homeKey         = padKeys.find(k => k.dataset.page === 'home');

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let introCleanup = null;
    let landscapeActivated = false;
    let currentPage = null;
    let padBusy = false;

    function isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    function updateOrientation() {
        if (isLandscape()) {
            rotatePrompt.style.display    = 'none';
            mobileLandscape.style.display = 'flex';
            if (!landscapeActivated) {
                landscapeActivated = true;
                const params = new URLSearchParams(window.location.search);
                const deepPost = params.get('post');
                const deepTag  = params.get('tag');
                const deepQ    = params.get('q');
                if (deepPost) {
                    renderPage('blog');
                    if (window.blog) window.blog.read(deepPost);
                } else if (deepTag || deepQ) {
                    renderPage('blog');
                    if (window.blog) {
                        window.blog.list({
                            tags: deepTag ? deepTag.split(',').filter(Boolean) : [],
                            q: deepQ || ''
                        });
                    }
                } else {
                    renderPage('home');
                }
            }
        } else {
            rotatePrompt.style.display    = 'flex';
            mobileLandscape.style.display = 'none';
        }
    }

    function animateSkillBadges(root) {
        const badges = root.querySelectorAll('.skill-badge');
        badges.forEach((badge, i) => {
            setTimeout(() => badge.classList.add('visible'), i * 55);
        });
    }

    function renderPage(name) {
        if (typeof PAGES === 'undefined' || !PAGES[name]) return;
        const pageEl = document.getElementById('page-' + name);
        if (!pageEl) return;

        // Always re-render home + blog so they refresh; cache the rest.
        if (name === 'home' || name === 'blog' || !pageEl.dataset.rendered) {
            pageEl.innerHTML = PAGES[name].content;
            pageEl.dataset.rendered = '1';
        }

        pages.forEach(p => p.classList.remove('active'));
        padKeys.forEach(k => k.classList.remove('active'));
        pageEl.classList.add('active');

        // Once the user leaves home, the blog button takes over the home slot.
        if (name !== 'home' && homeKey && homeKey.dataset.page === 'home') {
            homeKey.dataset.page = 'blog';
            homeKey.textContent = 'blog';
        }

        const key = padKeys.find(k => k.dataset.page === name);
        if (key) key.classList.add('active');

        // Cancel any running intro before switching pages.
        if (introCleanup) {
            introCleanup();
            introCleanup = null;
        }

        if (name === 'home' && typeof window.startIntro === 'function') {
            introCleanup = window.startIntro({ root: pageEl });
        } else if (name === 'about') {
            animateSkillBadges(pageEl);
        }

        currentPage = name;

        document.dispatchEvent(new CustomEvent('terminal:page-rendered', {
            detail: { page: name }
        }));
    }

    function setPadBusy(busy) {
        padBusy = busy;
        padKeys.forEach(k => {
            if (busy) {
                k.setAttribute('aria-disabled', 'true');
            } else {
                k.removeAttribute('aria-disabled');
            }
        });
    }

    function typeCommand(name, done) {
        if (reduceMotion) {
            padMirror.textContent = name;
            setTimeout(() => {
                padMirror.textContent = '';
                done();
            }, 80);
            return;
        }

        let i = 0;
        padMirror.textContent = '';
        function step() {
            i++;
            padMirror.textContent = name.slice(0, i);
            if (i < name.length) {
                setTimeout(step, 35 + Math.random() * 20);
            } else {
                padCursor.style.opacity = '1';
                setTimeout(() => {
                    padCursor.style.opacity = '';
                    padMirror.textContent = '';
                    done();
                }, 180);
            }
        }
        step();
    }

    padKeys.forEach(key => {
        key.addEventListener('click', () => {
            if (padBusy) return;
            const name = key.dataset.page;
            if (!name) return;
            setPadBusy(true);
            typeCommand(name, () => {
                renderPage(name);
                setPadBusy(false);
            });
        });
    });

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    updateOrientation();
})();


