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

})();
