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
        mirror: document.getElementById('input-mirror')
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
        elements.output.appendChild(line);
        scrollToBottom();
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
        elements.output.innerHTML = '';
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
        }
    };

    /**
     * Show a page's content
     */
    function showPage(pageName) {
        if (PAGES[pageName]) {
            state.currentPage = pageName;
            print(PAGES[pageName].content);
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
        // Set up event listeners
        elements.input.addEventListener('keydown', handleKeyDown);
        
        // Sync mirror on every input change
        elements.input.addEventListener('input', syncMirror);
        
        // Click anywhere to focus input
        document.querySelector('.terminal').addEventListener('click', (e) => {
            // Don't focus if clicking a link or button
            if (!e.target.closest('a') && !e.target.closest('button')) {
                focusInput();
            }
        });
        
        // Show welcome/home page
        setTimeout(() => {
            showPage('home');
            focusInput();
        }, CONFIG.welcomeDelay);
        
        // Handle visibility change (refocus on tab return)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                focusInput();
            }
        });
    }

    // Start the terminal when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
