/* ========================================
   Terminal Emulation Engine
   Desktop Only
   ======================================== */

(function() {
    'use strict';

    // Skip on mobile - mobile has its own UI
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    if (isMobile()) return;

    // ========================================
    // Configuration
    // ========================================
    
    const CONFIG = {
        promptText: 'guest@jbird:~$ ',
        welcomeDelay: 100,
        typingDelay: 0,
        maxHistorySize: 50
    };

    // ========================================
    // State
    // ========================================
    
    const state = {
        commandHistory: [],
        historyIndex: -1,
        currentPage: 'home'
    };

    // ========================================
    // DOM Elements
    // ========================================
    
    const elements = {
        output: document.getElementById('output'),
        input: document.getElementById('terminal-input'),
        cursor: document.getElementById('cursor'),
        mirror: document.getElementById('input-mirror'),
        page: null,
        log: null
    };

    // ========================================
    // Core Functions
    // ========================================

    /**
     * Sync the visible mirror text with the hidden input
     */
    function syncMirror() {
        if (elements.mirror) {
            elements.mirror.textContent = elements.input.value;
        }
    }

    /**
     * Print content to the terminal output
     */
    function print(content, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`.trim();
        line.innerHTML = content;
                elements.log.appendChild(line);
        scrollToBottom();
    }

        function createOutputSections() {
                elements.output.innerHTML = '';

                const page = document.createElement('div');
                page.className = 'terminal-page';

                const log = document.createElement('div');
                log.className = 'terminal-log';

                elements.output.appendChild(page);
                elements.output.appendChild(log);

                elements.page = page;
                elements.log = log;
        }

        function getCommandFooter() {
                return `
<div class="terminal-command-footer">
    <span class="section-header">Commands</span>
    <div class="terminal-command-list">
        <span class="text-accent">home</span>
        <span class="text-accent">about</span>
        <span class="text-accent">work</span>
        <span class="text-accent">contact</span>
        <span class="text-accent">help</span>
        <span class="text-accent">clear</span>
    </div>
</div>`;
        }

    /**
     * Print a command with prompt
     */
    function printCommand(cmd) {
        print(`<span class="output-prompt">${CONFIG.promptText}</span><span class="output-command">${escapeHtml(cmd)}</span>`);
    }

    /**
     * Clear the terminal output
     */
    function clearTerminal() {
        if (elements.page) {
            elements.page.innerHTML = '';
        }

        if (elements.log) {
            elements.log.innerHTML = '';
        }
    }

    /**
     * Scroll terminal to bottom
     */
    function scrollToBottom() {
        const terminalBody = document.querySelector('.terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Sleep for ms milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Focus the input field
     */
    function focusInput() {
        elements.input.focus();
    }

    // ========================================
    // Command Processing
    // ========================================

    /**
     * Available commands and their handlers
     */
    const commands = {
        home: () => showPage('home'),
        about: () => showPage('about'),
        work: () => showPage('work'),
        contact: () => showPage('contact'),
        help: () => showPage('help'),
        
        clear: () => {
            clearTerminal();
            showPage(state.currentPage);
            return false; // Don't print anything after
        },
        
        cls: () => commands.clear(),
        
        history: () => {
            if (state.commandHistory.length === 0) {
                print('<span class="text-muted">No commands in history.</span>');
            } else {
                let historyText = '<span class="section-header">Command History</span>\n';
                state.commandHistory.forEach((cmd, index) => {
                    historyText += `  <span class="text-muted">${index + 1}.</span> ${escapeHtml(cmd)}\n`;
                });
                print(historyText);
            }
        },
        
        whoami: () => {
            print('guest');
        },
        
        date: () => {
            const now = new Date();
            print(now.toString());
        },
        
        echo: (args) => {
            print(escapeHtml(args.join(' ')));
        },
        
        // Easter eggs
        sudo: () => {
            print('<span class="text-error">Permission denied. Nice try though! 😉</span>');
        },
        
        rm: (args) => {
            if (args.includes('-rf') && args.includes('/')) {
                print('<span class="text-error">Nice try! This terminal is read-only.</span>');
            } else {
                print('<span class="text-muted">Command not available in this terminal.</span>');
            }
        },
        
        ls: () => {
            print(`<span class="text-accent">about.txt</span>  <span class="text-accent">contact.txt</span>  <span class="text-accent">work/</span>  <span class="text-muted">README.md</span>`);
        },
        
        cat: (args) => {
            const file = args[0];
            if (file === 'README.md') {
                print(`<span class="text-muted"># Welcome to my terminal portfolio
# Use 'help' to see available commands</span>`);
            } else {
                print(`<span class="text-error">cat: ${escapeHtml(file || 'missing file')}: No such file</span>`);
            }
        },
        
        pwd: () => {
            print('/home/guest');
        },
        
        cd: () => {
            print('<span class="text-muted">Use page commands instead: home, about, work, contact</span>');
        },

        status: () => {
            const days  = Math.floor(Math.random() * 365) + 100;
            const hours = Math.floor(Math.random() * 24);
            const mins  = Math.floor(Math.random() * 60);
            const mem   = (Math.random() * 4 + 2).toFixed(1);
            const cpu   = (Math.random() * 8 + 0.5).toFixed(1);
            const load  = () => (Math.random() * 0.9).toFixed(2);
            print(`<span class="section-header">System Status</span>
  <span class="text-warning">hostname:</span>  jbird.dev
  <span class="text-warning">uptime:</span>    ${days}d ${hours}h ${mins}m
  <span class="text-warning">memory:</span>    ${mem}GB / 16GB
  <span class="text-warning">cpu:</span>       ${cpu}% — 8 cores
  <span class="text-warning">load avg:</span>  ${load()} ${load()} ${load()}
  <span class="text-warning">disk:</span>      42GB / 512GB (8% used)
  <span class="text-success">● all systems operational</span>`);
        },

        ping: async (args) => {
            const host = escapeHtml(args[0] || 'jbird.dev');
            print(`PING ${host}: 56 data bytes`);
            for (let i = 1; i <= 4; i++) {
                await sleep(280 + Math.random() * 140);
                const ms = (Math.random() * 15 + 8).toFixed(3);
                print(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=<span class="text-success">${ms} ms</span>`);
            }
            await sleep(200);
            print(`<span class="text-muted">--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</span>`);
        },

        ps: () => {
            print(`  <span class="text-muted">PID    NAME                     STATUS</span>
  <span class="text-accent">1001</span>   curiosity.service        <span class="text-success">running</span>
  <span class="text-accent">1002</span>   coffee.service           <span class="text-success">running</span>
  <span class="text-accent">1003</span>   problem-solving.d        <span class="text-success">running</span>
  <span class="text-accent">1004</span>   music-player.service     <span class="text-success">running</span>
  <span class="text-accent">1005</span>   side-project.service     <span class="text-warning">sleeping</span>
  <span class="text-accent">1006</span>   meetings.service         <span class="text-error">stopped</span>
  <span class="text-accent">1007</span>   readme-writer.d          <span class="text-error">stopped</span>`);
        }
    };

    // ========================================
    // Skill Badge Animator
    // ========================================

    function animateSkillBadges() {
        const badges = document.querySelectorAll('.skill-badge');
        if (!badges.length) return;
        badges.forEach((badge, i) => {
            setTimeout(() => badge.classList.add('visible'), i * 55);
        });
    }

    // ========================================
    // Title Typewriter
    // ========================================

    const CHRONICLE_TEXT = 'A Chronicle of The Deeds and Craft of';

    const TITLES = [
        'First of His Name,',
        'Automator of Repetitive Tasks,',
        'Keeper of the Sacred Keys,',
        'Warden of the Workflows'
    ];

    const NEON_TITLE_INDEX = 2;
    const NEON_TITLE_FULL  = 'Keeper of the Sacred (API) Keys,';

    let titleTyperCleanup = null;

    function startTitleTyper() {
        const chronicleEl = document.querySelector('.chronicle-typer');
        const logoBodyEl  = document.querySelector('.logo-body');
        const titleEl     = document.querySelector('.title-typer');
        if (!chronicleEl || !logoBodyEl || !titleEl) return null;

        let titleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timer = null;
        let destroyed = false;

        // Phase 3: cycle titles
        function titleTick() {
            if (destroyed) return;
            const current = TITLES[titleIndex];

            if (!isDeleting) {
                charIndex++;
                titleEl.textContent = current.slice(0, charIndex);

                if (charIndex === current.length) {
                    if (titleIndex === NEON_TITLE_INDEX) {
                        timer = setTimeout(runNeonEffect, 400);
                    } else {
                        titleEl.classList.add('title-glitch');
                        setTimeout(() => { if (!destroyed) titleEl.classList.remove('title-glitch'); }, 550);
                        isDeleting = true;
                        timer = setTimeout(titleTick, 2800);
                    }
                } else {
                    timer = setTimeout(titleTick, 42 + Math.random() * 28);
                }
            } else {
                const deleteText = (titleIndex === NEON_TITLE_INDEX) ? NEON_TITLE_FULL : current;
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
                setTimeout(() => { if (!destroyed) titleEl.classList.remove('title-glitch'); }, 550);
                isDeleting = true;
                charIndex = NEON_TITLE_FULL.length;
                timer = setTimeout(titleTick, 2200);
            }, 2800);
        }

        // Phase 2: scroll unroll reveal of the logo, then start titles
        function showLogo() {
            if (destroyed) return;
            logoBodyEl.style.display = 'inline';

            const linesEl     = logoBodyEl.querySelector('.logo-lines');
            const titleLineEl = logoBodyEl.querySelector('.title-line');
            const asciiLines  = ASCII_LOGO.split('\n');

            // Scroll structural pieces — widths satisfy:
            //   L_BAR(6) + w + R_BAR(5) = L_CAP(8) + (w-4) + R_CAP(7)  ✓
            const FULL   = 59;  // paper width when fully unrolled
            const PAD    = 1;   // leading spaces before ASCII art on paper
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

            const steps = [4, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 57, FULL];
            let stepIdx = 0;

            function nextStep() {
                if (destroyed) return;
                linesEl.textContent = buildScrollFrame(steps[stepIdx]);
                stepIdx++;
                if (stepIdx < steps.length) {
                    timer = setTimeout(nextStep, 95);
                } else {
                    titleLineEl.style.display = 'inline';
                    charIndex = 0;
                    timer = setTimeout(titleTick, 500);
                }
            }

            nextStep();
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
        return function destroy() { destroyed = true; clearTimeout(timer); };
    }

    /**
     * Show a page's content
     */
    function showPage(pageName) {
        if (titleTyperCleanup) { titleTyperCleanup(); titleTyperCleanup = null; }
        if (PAGES[pageName]) {
            state.currentPage = pageName;
            elements.page.innerHTML = `${PAGES[pageName].content}${getCommandFooter()}`;
            document.querySelector('.terminal-body').scrollTop = 0;
            if (pageName === 'home')  titleTyperCleanup = startTitleTyper();
            if (pageName === 'about') animateSkillBadges();
        } else {
            print(`<span class="text-error">Page not found: ${escapeHtml(pageName)}</span>`);
        }
    }

    /**
     * Process a command string
     */
    function processCommand(input) {
        const trimmedInput = input.trim();
        
        if (!trimmedInput) {
            return;
        }
        
        // Add to history
        if (state.commandHistory[state.commandHistory.length - 1] !== trimmedInput) {
            state.commandHistory.push(trimmedInput);
            if (state.commandHistory.length > CONFIG.maxHistorySize) {
                state.commandHistory.shift();
            }
        }
        state.historyIndex = state.commandHistory.length;
        
        // Print the command
        printCommand(trimmedInput);
        
        // Parse command and arguments
        const parts = trimmedInput.split(/\s+/);
        let cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Check for aliases
        if (COMMAND_ALIASES[cmd]) {
            cmd = COMMAND_ALIASES[cmd];
        }
        
        // Execute command
        if (commands[cmd]) {
            const result = commands[cmd](args);
            // If handler returns false, don't do anything else
            if (result === false) {
                return;
            }
        } else {
            print(`<span class="text-error">Command not found: ${escapeHtml(cmd)}</span>
<span class="text-muted">Type 'help' for available commands.</span>`);
        }
    }

    // ========================================
    // Autocomplete
    // ========================================
    
    const availableCommands = [
        'home', 'about', 'work', 'contact', 'help', 'clear',
        'history', 'whoami', 'date', 'echo', 'ls', 'pwd', 'cat'
    ];

    function autocomplete(partial) {
        const matches = availableCommands.filter(cmd => 
            cmd.startsWith(partial.toLowerCase())
        );
        
        if (matches.length === 1) {
            return matches[0];
        } else if (matches.length > 1) {
            // Find common prefix
            let prefix = matches[0];
            for (const match of matches) {
                while (!match.startsWith(prefix)) {
                    prefix = prefix.slice(0, -1);
                }
            }
            return prefix;
        }
        return partial;
    }

    // ========================================
    // Event Handlers
    // ========================================

    function handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                const input = elements.input.value;
                elements.input.value = '';
                syncMirror();
                processCommand(input);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (state.historyIndex > 0) {
                    state.historyIndex--;
                    elements.input.value = state.commandHistory[state.historyIndex];
                    syncMirror();
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (state.historyIndex < state.commandHistory.length - 1) {
                    state.historyIndex++;
                    elements.input.value = state.commandHistory[state.historyIndex];
                    syncMirror();
                } else {
                    state.historyIndex = state.commandHistory.length;
                    elements.input.value = '';
                    syncMirror();
                }
                break;
                
            case 'Tab':
                e.preventDefault();
                const currentValue = elements.input.value;
                if (currentValue) {
                    elements.input.value = autocomplete(currentValue);
                    syncMirror();
                }
                break;
                
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    clearTerminal();
                    showPage(state.currentPage);
                }
                break;
                
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    printCommand(elements.input.value + '^C');
                    elements.input.value = '';
                    syncMirror();
                }
                break;
        }
    }

    // ========================================
    // Initialization
    // ========================================

    function init() {
        createOutputSections();

        // Set up event listeners
        elements.input.addEventListener('keydown', handleKeyDown);
        
        // Sync mirror on every input change
        elements.input.addEventListener('input', syncMirror);
        
        // Nav bar links
        document.querySelectorAll('.terminal-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const command = link.dataset.command;
                if (command) {
                    processCommand(command);
                    elements.input.focus({ preventScroll: true });
                }
            });
        });
        
        // Click anywhere to focus input
        document.querySelector('.terminal').addEventListener('click', (e) => {
            // Don't focus if clicking a link or button
            if (!e.target.closest('a') && !e.target.closest('button')) {
                focusInput();
            }
        });
        
        // Boot sequence then show home page
        bootSequence();
        
        // Handle visibility change (refocus on tab return)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                focusInput();
            }
        });
    }

    // ========================================
    // Boot Sequence
    // ========================================

    async function bootSequence() {
        await sleep(50);
        print('<span class="text-muted">initializing...</span>');
        await sleep(300);
        print('<span class="text-muted">loading profile...</span>');
        await sleep(200);
        print('<span class="text-muted">mounting filesystem...</span>');
        await sleep(300);
        showPage('home');
        focusInput();
    }

    // Start the terminal when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
