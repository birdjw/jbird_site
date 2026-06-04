/* ========================================
   Intro Animation Engine
   Reusable chronicle → scroll unroll → title cycling intro.
   Scoped to a `root` element so it can run inside the desktop
   terminal page region OR a mobile intro container.
   ======================================== */

(function () {
    'use strict';

    const CHRONICLE_TEXT = 'A Chronicle of The Deeds and Craft of';

    const TITLES = [
        'First of His Name,',
        'Automator of Repetitive Tasks,',
        'Keeper of the Sacred Keys,',
        'Warden of the Workflows'
    ];

    const NEON_TITLE_INDEX = 2;
    const NEON_TITLE_FULL  = 'Keeper of the Sacred (API) Keys,';

    /**
     * Start the intro animation.
     *
     * @param {Object} opts
     * @param {HTMLElement} opts.root - container holding .chronicle-typer,
     *        .logo-body (.logo-lines + .title-line > .title-typer), and
     *        optionally .home-welcome.
     * @param {Function} [opts.onComplete] - called once the first title
     *        finishes typing and the welcome line (if present) has finished
     *        typing. Use this to reveal nav / command footer.
     * @returns {Function} destroy — cancels all pending timers.
     */
    function startIntro(opts) {
        const root = opts && opts.root;
        const onComplete = opts && opts.onComplete;
        if (!root) return function () {};

        const chronicleEl = root.querySelector('.chronicle-typer');
        const logoBodyEl  = root.querySelector('.logo-body');
        const titleEl     = root.querySelector('.title-typer');
        if (!chronicleEl || !logoBodyEl || !titleEl) return function () {};

        let titleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timer = null;
        let destroyed = false;
        let completeFired = false;

        function fireComplete() {
            if (completeFired || destroyed) return;
            completeFired = true;
            if (onComplete) onComplete();
        }

        // Phase 3: cycle titles
        function titleTick() {
            if (destroyed) return;
            const current = TITLES[titleIndex];

            if (!isDeleting) {
                charIndex++;
                titleEl.textContent = current.slice(0, charIndex);

                if (charIndex === current.length) {
                    if (titleIndex === 0) {
                        const welcome = root.querySelector('.home-welcome');
                        if (welcome) {
                            const fullText = welcome.textContent;
                            welcome.textContent = '';
                            welcome.style.opacity = '1';
                            let wIdx = 0;
                            function typeWelcome() {
                                if (destroyed) return;
                                wIdx++;
                                welcome.textContent = fullText.slice(0, wIdx);
                                if (wIdx < fullText.length) {
                                    timer = setTimeout(typeWelcome, 20 + Math.random() * 15);
                                } else {
                                    timer = setTimeout(fireComplete, 120);
                                }
                            }
                            typeWelcome();
                        } else {
                            fireComplete();
                        }
                    }
                    if (titleIndex === NEON_TITLE_INDEX) {
                        timer = setTimeout(runNeonEffect, 400);
                    } else {
                        titleEl.classList.add('title-glitch');
                        setTimeout(() => {
                            if (!destroyed) titleEl.classList.remove('title-glitch');
                        }, 550);
                        isDeleting = true;
                        timer = setTimeout(titleTick, 2800);
                    }
                } else {
                    timer = setTimeout(titleTick, 42 + Math.random() * 28);
                }
            } else {
                const deleteText = (titleIndex === NEON_TITLE_INDEX)
                    ? NEON_TITLE_FULL
                    : current;
                charIndex--;
                titleEl.textContent = deleteText.slice(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    titleIndex = (titleIndex + 1) % TITLES.length;
                    timer = setTimeout(titleTick, 320);
                } else {
                    timer = setTimeout(titleTick, 20 + Math.random() * 12);
                }
            }
        }

        function runNeonEffect() {
            if (destroyed) return;
            titleEl.innerHTML = 'Keeper of the Sacred <span class="neon-api">(API) </span>Keys,';
            timer = setTimeout(() => {
                if (destroyed) return;
                titleEl.classList.add('title-glitch');
                setTimeout(() => {
                    if (!destroyed) titleEl.classList.remove('title-glitch');
                }, 550);
                isDeleting = true;
                charIndex = NEON_TITLE_FULL.length;
                timer = setTimeout(titleTick, 2200);
            }, 2800);
        }

        // Phase 2: scroll unroll reveal of the logo, then start titles
        function showLogo() {
            if (destroyed) return;
            if (typeof ASCII_LOGO !== 'string') return;
            logoBodyEl.style.display = 'inline';

            const linesEl     = logoBodyEl.querySelector('.logo-lines');
            const titleLineEl = logoBodyEl.querySelector('.title-line');
            const asciiLines  = ASCII_LOGO.split('\n');

            // Scroll structural pieces — widths satisfy:
            //   L_BAR(6) + w + R_BAR(5) = L_CAP(8) + (w-4) + R_CAP(7)  ✓
            const FULL   = 59;
            const PAD    = 1;
            const L_CAP  = ' (‾‾‾)';
            const R_CAP  = '    (‾‾‾)';
            const L_BTM  = ' (___)';
            const R_BTM  = '    (___)';
            const L_BAR  = ' |   |';
            const R_BAR  = '|   |';
            const L_BBAR = ' |---|';
            const R_BBAR = '|---|';

            function buildScrollFrame(w) {
                w = Math.min(w, FULL);
                const spaces   = Math.max(0, w - 4);
                const topRow   = L_CAP + ' '.repeat(spaces) + (w >= 4 ? R_CAP : '');
                const botRow   = L_BTM + ' '.repeat(spaces) + (w >= 4 ? R_BTM : '');
                const topSep   = L_BBAR + '~'.repeat(w) + R_BBAR;
                const botSep   = L_BBAR + '~'.repeat(w) + R_BBAR;
                const contents = asciiLines.map(line => {
                    const vis  = Math.max(0, Math.min(line.length, w - PAD));
                    const fill = ' '.repeat(Math.max(0, w - PAD - vis));
                    return L_BAR + ' '.repeat(PAD) + line.slice(0, vis) + fill + R_BAR;
                });
                return '\n' + [topRow, topSep, ...contents, botSep, botRow].join('\n');
            }

            const DURATION = 1100;
            const C1 = 1.20;
            const C3 = C1 + 1;
            function easeOutBack(t) {
                return 1 + C3 * Math.pow(t - 1, 3) + C1 * Math.pow(t - 1, 2);
            }

            function finishScroll() {
                if (destroyed) return;
                linesEl.textContent = buildScrollFrame(FULL);
                titleLineEl.style.display = 'inline';
                charIndex = 0;
                timer = setTimeout(titleTick, 500);
            }

            const reduceMotion = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reduceMotion) {
                finishScroll();
                return;
            }

            let startTs = null;
            let lastW = -1;

            function frame(ts) {
                if (destroyed) return;
                if (startTs == null) startTs = ts;
                const t = Math.min(1, (ts - startTs) / DURATION);
                const eased = easeOutBack(t);
                const w = Math.min(FULL, Math.max(0, Math.round(eased * FULL)));
                if (w !== lastW) {
                    linesEl.textContent = buildScrollFrame(w);
                    lastW = w;
                }
                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    finishScroll();
                }
            }

            requestAnimationFrame(frame);
        }

        // Phase 1: type out the chronicle line
        let chronicleIndex = 0;
        function typeChronicle() {
            if (destroyed) return;
            chronicleIndex++;
            chronicleEl.textContent = CHRONICLE_TEXT.slice(0, chronicleIndex);

            if (chronicleIndex === CHRONICLE_TEXT.length) {
                timer = setTimeout(showLogo, 500);
            } else {
                timer = setTimeout(typeChronicle, 42 + Math.random() * 28);
            }
        }

        timer = setTimeout(typeChronicle, 400);

        return function destroy() {
            destroyed = true;
            clearTimeout(timer);
        };
    }

    window.startIntro = startIntro;
})();
