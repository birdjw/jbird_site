/* ========================================
   Page Content Module
   Define content for each "page" of the terminal site
   ======================================== */

// ASCII art stored separately to avoid template literal escaping issues
const ASCII_LOGO = [
    '   ___           _                  ______ _         _ ',
    '  |_  |         | |                 | ___ (_)       | |',
    '    | | ___  ___| |__  _   _  __ _  | |_/ /_ _ __ __| |',
    '    | |/ _ \\/ __| \'_ \\| | | |/ _` | | ___ \\ | \'__/ _` |',
    '/\\__/ / (_) \\__ \\ | | | |_| | (_| | | |_/ / | | | (_| |',
    '\\____/ \\___/|___/_| |_|\\__,_|\\__,_| \\____/|_|_|  \\__,_|',
].join('\n');

const PAGES = {
    home: {
        content: `
<pre class="ascii-art">         <span class="chronicle-typer"></span><span class="logo-body" style="display:none"><span class="logo-lines"></span><span class="title-line" style="display:none">
                              // <span class="title-typer"></span></span></span></pre>

<span class="text-muted">Hail, and well met! I welcome you to explore more about who I am and what I've been up to. If there is anything I can do for you, contact me! I'd be excited to discuss.</span>
`
    },
    
    about: {
        content: `
<span class="section-header">About Me</span>

<div class="info-row">
  <span class="info-label">Name:</span>
  <span class="info-value">Joshua Bird</span>
</div>
<div class="info-row">
  <span class="info-label">Role:</span>
  <span class="info-value">Automation and Integration Specialist</span>
</div>
<div class="info-row">
  <span class="info-label">Location:</span>
  <span class="info-value">Grand Rapids, MI</span>
</div>

<span class="section-header">Bio</span>

I’m a developer focused on simplifying workflows and removing friction from everyday tasks. From automation scripts to backend services, I enjoy designing software that replaces repetitive effort with reliable logic.

This site is a running log of experiments, projects, and the ongoing process of getting better at building things that work.

<span class="section-header">Skills</span>
  <span class="text-warning">Core Competencies</span>
  <span class="skill-bar" data-label="JavaScript" data-value="22" data-max="24"></span>
  <span class="skill-bar" data-label="Python    " data-value="20" data-max="24"></span>
  <span class="skill-bar" data-label="Node.js   " data-value="19" data-max="24"></span>
  <span class="skill-bar" data-label="Git       " data-value="21" data-max="24"></span>
  <span class="skill-bar" data-label="PostgreSQL" data-value="18" data-max="24"></span>
  <span class="skill-bar" data-label="HTML/CSS  " data-value="17" data-max="24"></span>

  <span class="text-warning">In Development</span>
  <span class="skill-bar" data-label="TypeScript" data-value="14" data-max="24"></span>
  <span class="skill-bar" data-label="React     " data-value="13" data-max="24"></span>
  <span class="skill-bar" data-label="Express   " data-value="15" data-max="24"></span>
  <span class="skill-bar" data-label="Docker    " data-value="11" data-max="24"></span>

  <span class="text-warning">Targeting</span>
  <span class="text-muted">  ○ Rust  ○ Go  ○ Kubernetes</span>

<span class="text-muted">Type 'work' to see my work or 'contact' to get in touch.</span>
`
    },
    
    work: {
        content: `
<span class="section-header">Work</span>

<div class="project-item">
  <span class="project-title">Account Verification Automation</span>
  <div class="project-desc">Automated a manual account verification workflow, reducing processing time from 5–10 minutes to ~10 seconds per request. Navigates a web-based partner management portal, authenticates users, validates required account settings, and generates consistent results without manual intervention. Originally a CLI utility, later expanded into a GUI application for team-wide adoption using Tkinter. Browser automation was used because the workflow was only accessible through the web interface with no direct API available.</div>
  <span class="project-tech">[Python, Playwright, Tkinter]</span>
  <div><a href="https://github.com/yourusername/project1" target="_blank" class="terminal-link">→ View on GitHub</a></div>
</div>

<div class="project-item">
  <span class="project-title">Modem Management Tool</span>
  <div class="project-desc">Designed and implemented an internal tool that automated cellular modem regrading through direct integration with carrier APIs. Replaced a manual workflow requiring analysts to navigate vendor web portals and perform device updates by hand. By leveraging RESTful API calls to execute regrade operations programmatically, the solution reduced processing times from 10–15 minutes to seconds while improving consistency and scalability.</div>
  <span class="project-tech">[Python, REST APIs]</span>
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
