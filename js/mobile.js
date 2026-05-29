(function () {
    if (window.innerWidth > 768) return;

    const rotatePrompt    = document.getElementById('rotate-prompt');
    const mobileLandscape = document.getElementById('mobile-landscape');
    const mobileLogoEl    = document.getElementById('mobile-logo');
    const navLinks        = document.querySelectorAll('.mobile-nav-link');
    const pages           = document.querySelectorAll('.mobile-page');

    // Inject ASCII logo from pages.js
    if (typeof ASCII_LOGO !== 'undefined') {
        mobileLogoEl.textContent = ASCII_LOGO;
    }

    function isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    function updateOrientation() {
        if (isLandscape()) {
            rotatePrompt.style.display    = 'none';
            mobileLandscape.style.display = 'flex';
        } else {
            rotatePrompt.style.display    = 'flex';
            mobileLandscape.style.display = 'none';
        }
    }

    function showPage(name) {
        pages.forEach(function (p) { p.classList.remove('active'); });
        navLinks.forEach(function (l) { l.classList.remove('active'); });

        var page = document.getElementById('page-' + name);
        if (page) page.classList.add('active');

        navLinks.forEach(function (l) {
            if (l.dataset.page === name) l.classList.add('active');
        });
    }

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    updateOrientation();
})();
