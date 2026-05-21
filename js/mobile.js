/* ========================================
   Mobile Navigation & Page Switching
   ======================================== */

(function() {
    'use strict';

    // Only run on mobile
    if (window.innerWidth > 768) return;

    const elements = {
        hamburger: document.getElementById('hamburger'),
        nav: document.getElementById('mobile-nav'),
        overlay: document.getElementById('nav-overlay'),
        navLinks: document.querySelectorAll('.nav-link'),
        pageLinks: document.querySelectorAll('[data-page]'),
        pages: document.querySelectorAll('.page')
    };

    // Toggle navigation drawer
    function toggleNav() {
        elements.hamburger.classList.toggle('active');
        elements.nav.classList.toggle('open');
        elements.overlay.classList.toggle('open');
        document.body.style.overflow = elements.nav.classList.contains('open') ? 'hidden' : '';
    }

    // Close navigation drawer
    function closeNav() {
        elements.hamburger.classList.remove('active');
        elements.nav.classList.remove('open');
        elements.overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Switch to a page
    function showPage(pageName) {
        // Update pages
        elements.pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `page-${pageName}`) {
                page.classList.add('active');
            }
        });

        // Update nav links
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        // Close nav and scroll to top
        closeNav();
        window.scrollTo(0, 0);
    }

    // Event Listeners
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', toggleNav);
    }

    if (elements.overlay) {
        elements.overlay.addEventListener('click', closeNav);
    }

    // Handle all page navigation links
    elements.pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.dataset.page;
            if (pageName) {
                showPage(pageName);
            }
        });
    });

    // Handle hash on load
    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(`page-${hash}`)) {
            showPage(hash);
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);
    
    // Check hash on load
    handleHash();

    // Re-check on resize (in case user rotates device)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                closeNav();
            }
        }, 250);
    });

    // Typing animation on home page
    const typingEl = document.getElementById('typing-text');
    const prefixEl = document.getElementById('typing-prefix');
    if (typingEl && prefixEl) {
        const items = [
            { prefix: 'skill acquired → ', value: 'JavaScript' },
            { prefix: 'skill acquired → ', value: 'Python' },
            { prefix: 'skill acquired → ', value: 'TypeScript' },
            { prefix: 'project shipped → ', value: 'Project One' },
            { prefix: 'skill acquired → ', value: 'React' },
            { prefix: 'skill acquired → ', value: 'Node.js' },
            { prefix: 'project shipped → ', value: 'Project Two' },
            { prefix: 'skill acquired → ', value: 'Git' },
            { prefix: 'skill acquired → ', value: 'Docker' },
            { prefix: 'project shipped → ', value: 'Project Three' },
            { prefix: 'skill acquired → ', value: 'PostgreSQL' },
        ];
        let idx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function typeLoop() {
            const current = items[idx];
            prefixEl.textContent = current.prefix;
            charIdx += isDeleting ? -1 : 1;
            typingEl.textContent = current.value.slice(0, charIdx);

            let delay = isDeleting ? 50 : 90;

            if (!isDeleting && charIdx === current.value.length) {
                delay = 1800;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                idx = (idx + 1) % items.length;
                delay = 300;
            }

            setTimeout(typeLoop, delay);
        }

        typeLoop();
    }

    // Character sheet: tab switching + skill bar animation
    const charSheet = document.querySelector('.char-sheet');
    if (charSheet) {
        function animateBars(panel) {
            panel.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = '0';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        bar.style.width = bar.dataset.level + '%';
                    });
                });
            });
        }

        charSheet.querySelectorAll('.char-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = 'char-' + tab.dataset.tab;
                charSheet.querySelectorAll('.char-tab').forEach(t => t.classList.remove('active'));
                charSheet.querySelectorAll('.char-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const panel = document.getElementById(targetId);
                if (panel) {
                    panel.classList.add('active');
                    if (tab.dataset.tab === 'skills') animateBars(panel);
                }
            });
        });

        // Animate bars on initial load
        const defaultPanel = charSheet.querySelector('.char-panel.active');
        if (defaultPanel) setTimeout(() => animateBars(defaultPanel), 400);
    }

})();
