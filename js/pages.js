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

<div class="home-welcome text-muted">Hail, and well met! I welcome you to explore more about who I am and what I've been up to. If there is anything I can do for you, contact me! I'd be excited to discuss.</div>
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


I'm Josh.

I build software, automate workflows, and spend probably too much of my days thinking, "There has to be a better way to do this."

Before I was writing code, I was serving in the United States Air Force as a Paralegal in the Judge Advocate General's Corps. My work focused on the administrative side of military justice and civil law matters, where I learned an important lesson that still shapes how I approach problems today: Do it right the first time, or you'll be doing it again... and again... and again.

After leaving the Air Force with an honorable discharge in 2016, I enrolled at Arizona State University and earned a Bachelor of Science in Graphic Information Technology. The program had a strong front-end focus, covering web development, user experience, design principles, and digital media. It gave me an appreciation for building things that not only work, but are intuitive and enjoyable to use.

After graduating in 2020, I joined W.W. Grainger as a Technical Support Specialist. Working in a technical operations environment exposed me to countless opportunities for automation, and I quickly found myself more interested in building solutions than working around limitations. What started as small scripts and process improvements evolved into a serious interest in back-end development, software engineering, APIs, and system integration.

Today, I spend much of my time building tools that eliminate manual work, connect systems, and help teams move faster. I'm particularly interested in automation, back-end services, AI-assisted development, and finding creative ways to solve practical business problems.

When I'm not building something, I'm usually learning a new technology, experimenting with AI tools, or working on personal projects that probably started with the words, "It would be cool if..."

<div class="skill-section">
  <div><span class="text-warning">Core Competencies</span> <span class="text-muted">— What I do well now</span></div>
  <div class="skill-badges badge-core">
    <span class="skill-badge"><i class="devicon-python-plain"></i> Python</span>
    <span class="skill-badge"><i class="devicon-git-plain"></i> Git</span>
    <span class="skill-badge"><i class="devicon-linux-plain"></i> Linux / Bash</span>
    <span class="skill-badge">⇌ REST APIs</span>
    <span class="skill-badge"><i class="devicon-postgresql-plain"></i> SQL</span>
    <span class="skill-badge"><i class="devicon-javascript-plain"></i> JavaScript</span>
    <span class="skill-badge"><i class="devicon-html5-plain"></i> HTML / CSS</span>
    <span class="skill-badge">✦ Generative AI</span>
  </div>
</div>
<div class="skill-section">
  <div><span class="text-warning">Skills in Development</span> <span class="text-muted">— What I am actively learning</span></div>
  <div class="skill-badges badge-developing">
    <span class="skill-badge"><i class="devicon-typescript-plain"></i> TypeScript</span>
    <span class="skill-badge"><i class="devicon-react-original"></i> React</span>
    <span class="skill-badge"><i class="devicon-docker-plain"></i> Docker</span>
    <span class="skill-badge">⚙ CI/CD</span>
  </div>
</div>
<div class="skill-section">
  <div><span class="text-warning">Targeted Skills</span> <span class="text-muted">— What's up next</span></div>
  <div class="skill-badges badge-targeted">
    <span class="skill-badge"><i class="devicon-go-plain"></i> Go</span>
    <span class="skill-badge"><i class="devicon-rust-plain"></i> Rust</span>
    <span class="skill-badge"><i class="devicon-kubernetes-plain"></i> Kubernetes</span>
  </div>
</div>

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
  <span class="project-internal" data-tooltip="Source code is not publicly available — built for internal company use">🔒 Internal (source private)</span>
</div>

<div class="project-item">
  <span class="project-title">Modem Management Tool</span>
  <div class="project-desc">Designed and implemented an internal tool that automated cellular modem regrading through direct integration with carrier APIs. Replaced a manual workflow requiring analysts to navigate vendor web portals and perform device updates by hand. By leveraging RESTful API calls to execute regrade operations programmatically, the solution reduced processing times from 10–15 minutes to seconds while improving consistency and scalability.</div>
  <span class="project-tech">[Python, REST APIs]</span>
  <span class="project-internal" data-tooltip="Source code is not publicly available — built for internal company use">🔒 Internal (source private)</span>
</div>

<div class="project-item">
  <span class="project-title">Baby's First AI Agent</span>
  <div class="project-desc">A Python-based AI coding agent built as a learning exercise to gain hands-on experience with LLM integration, function calling, and agentic workflows. This project implements an AI-powered coding assistant that can interact with a local filesystem through natural language commands. It uses Google's Gemini 2.0 Flash model with function calling capabilities to enable the AI to autonomously execute tasks like reading files, running Python scripts, and writing code.</div>
  <span class="project-tech">[Python, LLM APIs]</span>
  <a href="https://github.com/birdjw/bd_agent" target="_blank" class="project-github">⎇ github.com/birdjw/bd_agent</a>
</div>

<div class="project-item">
  <span class="project-title">Pygame Asteroids</span>
  <div class="project-desc">A recreation of the classic Atari Asteroids game built with Python and Pygame. Pilot a spaceship through an asteroid field, splitting and destroying rocks while surviving as long as possible. Built to practice multi-file project structure, OOP design patterns, vector math, collision detection, and game loop architecture using a real-world external library.</div>
  <span class="project-tech">[Python, Pygame]</span>
  <a href="https://github.com/birdjw/bd_asteroids" target="_blank" class="project-github">⎇ github.com/birdjw/bd_asteroids</a>
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
  <a href="mailto:joshuawaynebird@gmail.com" class="terminal-link">joshuawaynebird@gmail.com</a>
</div>

<div class="contact-item">
  <span class="contact-label">GitHub:</span>
  <a href="https://github.com/birdjw" target="_blank" class="terminal-link">github.com/birdjw</a>
</div>

<div class="contact-item">
  <span class="contact-label">LinkedIn:</span>
  <a href="https://linkedin.com/in/birdjw" target="_blank" class="terminal-link">linkedin.com/in/birdjw</a>
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
