/* ========================================
   Page Content Module
   Define content for each "page" of the terminal site
   ======================================== */

// ASCII art stored separately to avoid template literal escaping issues
const ASCII_LOGO = [
    '       _           _                   ____  _         _ ',
    '      | |         | |                 |  _ \\(_)       | |',
    '      | | ___  ___| |__  _   _  __ _  | |_) |_ _ __ __| |',
    '  _   | |/ _ \\/ __| \'_ \\| | | |/ _` | |  _ <| | \'__/ _` |',
    ' | |__| | (_) \\__ \\ | | | |_| | (_| | | |_) | | | | (_| |',
    '  \\____/ \\___/|___/_| |_|\\__,_|\\__,_| |____/|_|_|  \\__,_|'
].join('\n');

const PAGES = {
    home: {
        content: `
<pre class="ascii-art">${ASCII_LOGO}</pre>

<span class="text-muted">Hail, and well met! I welcome you to explore what I've been up to.
If there is anything I can do for you, please contact me and I'd be
excited to discuss.</span>

<span class="section-header">Available Commands</span>
  <span class="text-accent">home</span>      - Return to this page
  <span class="text-accent">about</span>     - Learn about me
  <span class="text-accent">work</span>      - View my work
  <span class="text-accent">contact</span>   - Get in touch
  <span class="text-accent">help</span>      - Show all commands
  <span class="text-accent">clear</span>     - Clear the terminal
`
    },
    
    about: {
        content: `
<span class="section-header">About Me</span>

<div class="info-row">
  <span class="info-label">Name:</span>
  <span class="info-value">Your Name</span>
</div>
<div class="info-row">
  <span class="info-label">Role:</span>
  <span class="info-value">Software Developer</span>
</div>
<div class="info-row">
  <span class="info-label">Location:</span>
  <span class="info-value">Your City, Country</span>
</div>

<span class="section-header">Bio</span>
Hello! I'm a passionate developer who loves building things for the web.
I enjoy creating clean, efficient, and user-friendly applications.

<span class="section-header">Skills</span>
  <span class="text-warning">Languages:</span>    JavaScript, Python, TypeScript, HTML/CSS
  <span class="text-warning">Frameworks:</span>   React, Node.js, Express, Vue
  <span class="text-warning">Tools:</span>        Git, Docker, Linux, VS Code
  <span class="text-warning">Databases:</span>    PostgreSQL, MongoDB, Redis

<span class="text-muted">Type 'work' to see my work or 'contact' to get in touch.</span>
`
    },
    
    work: {
        content: `
<span class="section-header">Work</span>

<div class="project-item">
  <span class="project-title">Project One</span>
  <div class="project-desc">A brief description of your first project. Explain what it does and what problem it solves.</div>
  <span class="project-tech">[JavaScript, React, Node.js]</span>
  <div><a href="https://github.com/yourusername/project1" target="_blank" class="terminal-link">→ View on GitHub</a></div>
</div>

<div class="project-item">
  <span class="project-title">Project Two</span>
  <div class="project-desc">Another amazing project you've built. Highlight the key features and technologies used.</div>
  <span class="project-tech">[Python, Flask, PostgreSQL]</span>
  <div><a href="https://github.com/yourusername/project2" target="_blank" class="terminal-link">→ View on GitHub</a></div>
</div>

<div class="project-item">
  <span class="project-title">Project Three</span>
  <div class="project-desc">A third project showcasing your diverse skill set. Include any notable achievements.</div>
  <span class="project-tech">[TypeScript, Vue, MongoDB]</span>
  <div><a href="https://github.com/yourusername/project3" target="_blank" class="terminal-link">→ View on GitHub</a></div>
</div>

<span class="text-muted">Type 'about' to learn more about me or 'contact' to connect.</span>
`
    },
    
    contact: {
        content: `
<span class="section-header">Contact</span>

<span class="text-muted">Feel free to reach out through any of the following:</span>

<div class="contact-item">
  <span class="contact-label">Email:</span>
  <a href="mailto:your.email@example.com" class="terminal-link">your.email@example.com</a>
</div>

<div class="contact-item">
  <span class="contact-label">GitHub:</span>
  <a href="https://github.com/yourusername" target="_blank" class="terminal-link">github.com/yourusername</a>
</div>

<div class="contact-item">
  <span class="contact-label">LinkedIn:</span>
  <a href="https://linkedin.com/in/yourusername" target="_blank" class="terminal-link">linkedin.com/in/yourusername</a>
</div>

<div class="contact-item">
  <span class="contact-label">Twitter:</span>
  <a href="https://twitter.com/yourusername" target="_blank" class="terminal-link">@yourusername</a>
</div>

<span class="text-success mt-2">
I'm always open to discussing new projects, creative ideas,
or opportunities to be part of your vision!</span>
`
    },
    
    help: {
        content: `
<span class="section-header">Available Commands</span>

<span class="text-accent">Navigation</span>
  home        Return to the home page
  about       Learn about me
  work        View my portfolio
  contact     Get my contact info

<span class="text-accent">Utility</span>
  help        Show this help message
  clear       Clear the terminal screen
  history     Show command history

<span class="text-accent">Fun</span>
  whoami      Display current user
  date        Show current date/time
  echo [msg]  Print a message

<span class="text-muted">Tip: Use Tab for autocomplete, Up/Down arrows for history.</span>
`
    }
};

// Command aliases
const COMMAND_ALIASES = {
    'h': 'home',
    'a': 'about',
    'w': 'work',
    'c': 'contact',
    '?': 'help',
    'cls': 'clear'
};

// Export for use in terminal.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PAGES, COMMAND_ALIASES };
}
