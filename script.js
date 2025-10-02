// Render GitHub contribution graph as an image (no token needed)
function renderContributionGraph(username) {
    const container = document.getElementById('contribution-graph');
    if (!container) return;

    // pick current theme color
    const cssPrimary = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();
    const hex = cssPrimary.startsWith('#') ? cssPrimary.slice(1) : '00ffff';

    const img = new Image();
    img.alt = `${username} GitHub Contributions`;
    img.loading = 'lazy';
    img.className = 'gh-chart';
    img.src = `https://ghchart.rshah.org/${hex}/${username}`;

    // Fallback text if the service is blocked
    img.onerror = () => {
        container.innerHTML = '<div style="color: var(--text-secondary); text-align:center;">Unable to load contribution graph.</div>';
    };

    container.innerHTML = '';
    container.appendChild(img);
}


// share-modal.js (safe)
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('share-open');
    const closeBtn = document.getElementById('share-close');
    const modal = document.getElementById('share-modal');
    if (!openBtn || !closeBtn || !modal) return;
    openBtn.addEventListener('click', () => modal.classList.add('open'));
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    // after your other init calls
    renderContributionGraph('danielikesh');
});

(() => {
    'use strict';

    // Helpers
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // ============== LOADING SCREEN ==============
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loading = $('#loading-screen');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 500);
            }
        }, 1200); // shorter for dev; change to 3000 if you like
    });

    // ============== SOUND SYSTEM (uses inline data URIs, no files) ==============
    let soundEnabled = true;
    const sounds = {
        typing: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZijgJGGm98OScTgwOUazi'),
        click: new Audio('data:audio/wav;base64,UklGRhYBAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YQoBAADYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH2MfYx9jH'),
        hover: new Audio('data:audio/wav;base64,UklGRiQBAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YQABAABubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5u'),
        success: new Audio('data:audio/wav;base64,UklGRkwFAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YQgFAACBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB')
    };

    function playSound(name) {
        if (!soundEnabled) return;
        const a = sounds[name];
        if (!a) return;
        try {
            a.currentTime = 0;
            a.play();
        } catch (_) {}
    }

    function initSoundUI() {
        const toggle = $('#sound-toggle');
        if (toggle) {
            on(toggle, 'click', () => {
                soundEnabled = !soundEnabled;
                toggle.classList.toggle('muted', !soundEnabled);
                toggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
                playSound('click');
            });
        }
        const soundTargets = $$('button, .btn, .nav-link, .skill-card, .project-card');
        soundTargets.forEach(el => {
            on(el, 'mouseenter', () => playSound('hover'));
            on(el, 'click', () => playSound('click'));
        });
    }

    // ============== THEME ==============
    let currentTheme = localStorage.getItem('theme') || 'dark';

    function setTheme(theme) {
        document.body.className = theme === 'dark' ? '' : (theme + '-theme');
        localStorage.setItem('theme', theme);
        currentTheme = theme;
        playSound('click');
    }

    function initTheme() {
        setTheme(currentTheme);
        $$('.theme-btn').forEach(btn => on(btn, 'click', () => setTheme(btn.dataset.theme)));
    }

    // ============== COMMAND PALETTE ==============
    function initCommandPalette() {
        const palette = $('#command-palette');
        const input = $('#command-input');
        if (!palette) return;

        function toggle() {
            palette.classList.toggle('active');
            if (palette.classList.contains('active') && input) {
                input.value = '';
                input.focus();
            }
        }

        on(document, 'keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && palette.classList.contains('active')) toggle();
        });

        $$('.command-item').forEach(item => {
            on(item, 'click', () => {
                executeCommand(item.dataset.action);
                toggle();
            });
        });

        if (input) {
            on(input, 'input', (e) => {
                const q = e.target.value.toLowerCase();
                $$('.command-item').forEach(item => { item.style.display = item.textContent.toLowerCase().includes(q) ? 'flex' : 'none'; });
            });
        }
    }

    function executeCommand(action) {
        switch (action) {
            case 'navigate-home':
                window.location.hash = '#home';
                break;
            case 'navigate-projects':
                window.location.hash = '#projects';
                break;
            case 'download-resume':
                downloadResume();
                break;
            case 'theme-dark':
                setTheme('dark');
                break;
            case 'theme-synthwave':
                setTheme('synthwave');
                break;
            case 'theme-matrix':
                setTheme('matrix');
                break;
            case 'contact-email':
                window.location.href = 'mailto:likeshbarve08@gmail.com';
                break;
            case 'github-stats':
                { const el = $('#github-stats'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
                break;
            case 'play-sound':
                soundEnabled = !soundEnabled;
                break;
            case 'show-achievements':
                { const el = $('#achievements'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
                break;
        }
        playSound('success');
    }

    // ============== TERMINAL ==============
    function initTerminal() {
        const input = $('#terminal-input');
        const output = $('#terminal-output');
        if (!input || !output) return;

        const commands = {
            help: () => `Available commands:
- help, about, skills, projects, contact, clear, whoami
- sudo hire me, date, location, resume, linkedin, github
- open 1..4`,
            about: () => `Name: Likesh Barve
Role: AWS & DevOps Engineer
Experience: Fresher with 6 AWS Certifications
Passion: Cloud Infrastructure & Automation
Status: Available for opportunities`,
            skills: () => `Technical Skills:
- Cloud: AWS (EC2, S3, Lambda, RDS, VPC, IAM)
- DevOps: Docker, CI/CD, Git, Jenkins
- Languages: Python, Shell
- OS: Linux
- Tools: Terraform, Ansible, CloudWatch`,
            projects: () => `Recent Projects:
1. DevTest
2. Face Recognition Attendance System
3. Personal Expense Tracker
4. DevOps Web Hosting
Type 'open [project-number]' to view`,
            contact: () => `Contact:
Email: likeshbarve08@gmail.com
Phone: 9763879173
LinkedIn: linkedin.com/in/likesh-barve-8b8723269
GitHub: github.com/danielikesh
Location: Pune, India`,
            clear: () => { output.innerHTML = ''; return ''; },
            whoami: () => `root@aws-devops:~$ Likesh Barve - AWS & DevOps Engineer`,
            'sudo hire me': () => { createConfetti(); return `🎉 SUDO ACCESS GRANTED! 🎉
[████████████████████████] 100% Complete
Status: Ready to join your team!
Contact: likeshbarve08@gmail.com`; },
            date: () => new Date().toString(),
            location: () => `Pune, Maharashtra, India 📍`,
            resume: () => { downloadResume(); return 'Downloading resume...'; },
            linkedin: () => { window.open('https://www.linkedin.com/in/likesh-barve-8b8723269/', '_blank'); return 'Opening LinkedIn...'; },
            github: () => { window.open('https://github.com/danielikesh', '_blank'); return 'Opening GitHub...'; },
            'open 1': () => { window.open('https://github.com/danielikesh/DevTest', '_blank'); return 'Opening DevTest...'; },
            'open 2': () => { window.open('https://github.com/danielikesh/Face-Recognition-Attendance-System', '_blank'); return 'Opening Face Recognition...'; },
            'open 3': () => { window.open('https://github.com/danielikesh/Personal-expense-Tracker', '_blank'); return 'Opening Expense Tracker...'; },
            'open 4': () => { window.open('https://github.com/danielikesh/danielikesh-My_first_devops_Web_hosting', '_blank'); return 'Opening DevOps Hosting...'; }
        };

        on(input, 'keypress', (e) => {
            if (e.key !== 'Enter') return;
            const cmd = e.target.value.trim().toLowerCase();
            e.target.value = '';

            const line = document.createElement('div');
            line.innerHTML = `<span class="prompt">$</span> ${cmd}`;
            output.appendChild(line);

            const res = commands[cmd] ? commands[cmd]() : `Command not found: ${cmd}. Type 'help'.`;
            if (res) {
                const out = document.createElement('div');
                out.style.color = '#00ff00';
                out.style.marginBottom = '10px';
                out.innerHTML = res.replace(/\n/g, '<br>');
                output.appendChild(out);
            }
            output.scrollTop = output.scrollHeight;
            playSound('typing');
        });
    }

    // ============== EASTER EGGS ==============
    function initKonami() {
        const keys = [];
        const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        on(document, 'keydown', (e) => {
            keys.push(e.key);
            keys.splice(-pattern.length - 1, keys.length - pattern.length);
            if (keys.join(',') === pattern.join(',')) {
                playSound('success');
                alert('🎮 Konami Code Activated! Launching DevOps Defender...');
                const gm = $('#game-modal');
                if (gm) gm.classList.add('active');
                initGame();
            }
        });
    }

    function initLogoEasterEgg() {
        let clicks = 0;
        const logo = $('#logo-easter-egg');
        on(logo, 'click', () => {
            clicks++;
            if (clicks === 5) {
                document.body.style.animation = 'rainbow 3s';
                setTimeout(() => { document.body.style.animation = ''; }, 3000);
                clicks = 0;
            }
        });
    }

    function initSurpriseButton() {
        const btn = $('#surprise-btn');
        on(btn, 'click', () => {
            const tasks = [createConfetti, createMatrixRainIntense, createFireworks, showRandomJoke, () => {
                const gm = $('#game-modal');
                if (gm) gm.classList.add('active');
                initGame();
            }];
            tasks[Math.floor(Math.random() * tasks.length)]();
        });
    }

    // ============== GITHUB STATS ==============
    async function fetchGitHubStats() {
        const username = 'danielikesh';
        try {
            const userRes = await fetch(`https://api.github.com/users/${username}`);
            const user = await userRes.json();
            const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
            const repos = await reposRes.json();
            const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
            const forks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
            setText('github-repos', repos.length);
            setText('github-stars', stars);
            setText('github-commits', '500+'); // placeholder
            setText('total-repos', repos.length);
            setText('total-stars', stars);
            setText('total-forks', forks);
            setText('total-followers', user.followers || '0');
        } catch (_) {
            setText('github-repos', '10+');
            setText('github-stars', '50+');
            setText('github-commits', '500+');
        }
    }

    // ============== SERVER STATUS ==============
    const weatherIcons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'];
    const weatherStatuses = ['All Systems Operational', 'High Performance Mode', 'Maintenance Scheduled', 'Peak Traffic Handling'];

    function updateServerStatus() {
        const icon = $('#status-weather');
        const text = document.querySelector('.status-text');
        if (!icon || !text) return;
        const i = Math.floor(Math.random() * weatherIcons.length);
        icon.className = 'fas ' + weatherIcons[i];
        text.textContent = weatherStatuses[i];
    }

    // ============== PROJECT FILTERS ==============
    function initProjectFilters() {
        const buttons = $$('.filter-btn');
        const cards = $$('.project-card');
        if (!buttons.length || !cards.length) return;
        buttons.forEach(btn => {
            on(btn, 'click', () => {
                const filter = btn.dataset.filter;
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                cards.forEach(card => {
                    const cats = (card.dataset.category || '');
                    const show = filter === 'all' || cats.includes(filter);
                    card.style.display = show ? 'block' : 'none';
                    if (show) card.style.animation = 'fadeIn 0.5s';
                });
                playSound('click');
            });
        });
    }

    // ============== SKILL SEARCH ==============
    function initSkillSearch() {
        const filter = $('#skill-filter');
        if (!filter) return;
        on(filter, 'input', (e) => {
            const q = e.target.value.toLowerCase();
            $$('.skill-card').forEach(card => {
                const name = (card.dataset.skill || '').toLowerCase();
                card.style.display = name.includes(q) ? 'block' : 'none';
            });
        });
    }

    // ============== COUNTERS & VISITORS ==============
    function startCounters() {
        let coffee = 0;
        setInterval(() => {
            coffee++;
            setText('coffee-counter', coffee);
        }, 5000);

        let lines = 0;
        const linesInt = setInterval(() => {
            lines += Math.floor(Math.random() * 100);
            setText('lines-counter', lines.toLocaleString());
            if (lines > 50000) clearInterval(linesInt);
        }, 100);

        let solved = 0;
        const probInt = setInterval(() => {
            solved++;
            setText('problems-counter', solved);
            if (solved > 99) clearInterval(probInt);
        }, 500);
    }

    function updateVisitorCount() {
        let visitors = parseInt(localStorage.getItem('visitorCount') || '0', 10) + 1;
        localStorage.setItem('visitorCount', visitors);
        setText('visitor-count', visitors);

        let pageViews = parseInt(sessionStorage.getItem('pageViews') || '0', 10) + 1;
        sessionStorage.setItem('pageViews', pageViews);
        setText('page-views', pageViews);
    }

    // ============== BACK TO TOP ==============
    function initBackToTop() {
        const btn = $('#back-to-top');
        if (!btn) return;
        on(window, 'scroll', () => {
            if (window.scrollY > 500) btn.classList.add('visible');
            else btn.classList.remove('visible');
        });
        on(btn, 'click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            playSound('click');
        });
    }

    // ============== EFFECTS & ANIMATIONS ==============
    function createConfetti() {
        const count = 100;
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            c.style.cssText = `
        position: fixed; width: 10px; height: 10px;
        background: ${['#00ffff','#ff00ff','#00ff00','#ffff00'][Math.floor(Math.random()*4)]};
        left: ${Math.random()*100}%; top: -10px; z-index: 9999;
        animation: confettiFall ${Math.random()*3+2}s linear;
      `;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }
    }

    function createMatrixRainIntense() {
        document.body.style.animation = 'matrixIntense 2s';
        setTimeout(() => { document.body.style.animation = ''; }, 2000);
    }

    function createFireworks() {
        const f = document.createElement('div');
        f.style.cssText = `
      position: fixed; width: 4px; height: 4px; background: #fff;
      left: ${Math.random()*100}%; bottom: 0; z-index: 9999;
      animation: fireworkLaunch 1s ease-out;
    `;
        document.body.appendChild(f);
        setTimeout(() => {
            f.remove();
            createFireworkExplosion(f.style.left);
        }, 1000);
    }

    function createFireworkExplosion(x) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
        position: fixed; width: 4px; height: 4px;
        background: ${['#ff0','#f0f','#0ff','#fff'][Math.floor(Math.random()*4)]};
        left: ${x}; top: 30%; z-index: 9999;
        animation: explode ${Math.random()*1+0.5}s ease-out;
      `;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1500);
        }
    }

    function showRandomJoke() {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why did the developer go broke? Because he used up all his cache!",
            "Why do Java developers wear glasses? Because they can't C#!",
            "What's a programmer's favorite hangout place? Foo Bar!",
            "Why did the DBA leave his wife? She had one-to-many relationships!"
        ];
        alert('😄 ' + jokes[Math.floor(Math.random() * jokes.length)]);
    }
    (function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
      @keyframes confettiFall { to { transform: translateY(100vh) rotate(360deg); } }
      @keyframes matrixIntense { 0%,100%{filter:hue-rotate(0deg) brightness(1);} 50%{filter:hue-rotate(180deg) brightness(1.5);} }
      @keyframes fireworkLaunch { to { transform: translateY(-70vh); } }
      @keyframes explode { to { transform: translate(${Math.random()*200-100}px, ${Math.random()*200-100}px); opacity: 0; } }
      @keyframes rainbow { 0%{filter:hue-rotate(0deg);} 100%{filter:hue-rotate(360deg);} }
    `;
        document.head.appendChild(style);
    })();

    // ============== GAME ==============
    function initGame() {
        const canvas = $('#game-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let player = { x: canvas.width / 2, y: canvas.height - 50, width: 40, height: 40 };
        let bullets = [];
        let enemies = [];
        let score = 0;
        let running = true;

        on(document, 'keydown', (e) => {
            if (!running) return;
            if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 20;
            else if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) player.x += 20;
            else if (e.key === ' ') {
                bullets.push({ x: player.x + player.width / 2, y: player.y, width: 4, height: 10 });
                playSound('click');
            }
        });

        function loop() {
            if (!running) return;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            bullets = bullets.filter(b => b.y > 0);
            bullets.forEach(b => {
                b.y -= 5;
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });
            if (Math.random() < 0.02) enemies.push({ x: Math.random() * (canvas.width - 30), y: 0, width: 30, height: 30 });
            enemies = enemies.filter(en => en.y < canvas.height);
            enemies.forEach(en => {
                en.y += 2;
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(en.x, en.y, en.width, en.height);
            });
            bullets.forEach((b, bi) => enemies.forEach((en, ei) => {
                if (b.x < en.x + en.width && b.x + b.width > en.x && b.y < en.y + en.height && b.y + b.height > en.y) {
                    bullets.splice(bi, 1);
                    enemies.splice(ei, 1);
                    score += 10;
                    playSound('success');
                }
            }));
            ctx.fillStyle = '#fff';
            ctx.font = '20px Orbitron';
            ctx.fillText('Score: ' + score, 10, 30);
            requestAnimationFrame(loop);
        }
        loop();
    }

    function closeGame() { const gm = $('#game-modal'); if (gm) gm.classList.remove('active'); }

    function startGame() { initGame(); }
    window.startGame = startGame;
    window.closeGame = closeGame;

    // ============== CERT LIGHTBOX & VERIFY ==============
    function initCertLightbox() {
        const badges = $$('.cert-badge');
        const overlay = $('#cert-overlay');
        const img = $('#cert-popup-img');
        const title = $('#cert-popup-title');
        const close = $('#cert-popup-close');
        if (!badges.length || !overlay) return;

        badges.forEach(b => {
            on(b, 'click', () => {
                if (img) img.src = b.getAttribute('data-img') || '';
                if (title) title.textContent = b.getAttribute('data-title') || '';
                overlay.style.display = 'flex';
                playSound('click');
            });
        });
        on(close, 'click', () => {
            overlay.style.display = 'none';
            playSound('click');
        });
        on(overlay, 'click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
    }

    function verifyCert(certId) {
        alert('✅ Certificate ' + String(certId).toUpperCase() + ' verified!');
        playSound('success');
    }
    window.verifyCert = verifyCert;

    // ============== DEMOS & RESUME ==============
    function showProjectDemo(name) { alert('🚀 Demo for ' + name + ' would be shown here!'); }
    window.showProjectDemo = showProjectDemo;

    function downloadResume() {
        const resume = `
Likesh Barve
AWS & DevOps Engineer
Email: likeshbarve08@gmail.com
Phone: 9763879173

SUMMARY
AWS-certified fresher with 6 certifications and hands-on experience in cloud infrastructure and DevOps automation.

EXPERIENCE
- Associate Systems Engineer at Braves Technologies
- AWS Cloud Intern at F13 Technologies

SKILLS
- AWS: EC2, S3, Lambda, RDS, VPC, IAM, CloudWatch
- DevOps: Docker, Git, CI/CD, Jenkins
- Programming: Python, Shell
- OS: Linux

CERTIFICATIONS
- AWS Cloud Practitioner Essentials
- AWS Solutions Architect
- AWS DevOps Navigate
`.trim();
        const blob = new Blob([resume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Likesh_Barve_Resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        playSound('success');
    }

    // ============== PARTICLES / TYPING / MATRIX / SCROLL / NAV / CONTACT ==============
    function createParticles() {
        const container = $('#particles') || $('#particles-js');
        if (!container) return;
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
        position:absolute; width:${Math.random()*3+1}px; height:${Math.random()*3+1}px;
        background: rgba(0,255,255,${Math.random()*0.5+0.3});
        left:${Math.random()*100}%; top:${Math.random()*100}%;
        border-radius:50%; animation: float ${Math.random()*10+10}s linear infinite;
        box-shadow:0 0 ${Math.random()*10+5}px currentColor;
      `;
            container.appendChild(p);
        }
    }

    function initTyping() {
        const el = $('#typed');
        if (!el) return;
        const arr = [
            'aws ec2 describe-instances',
            'kubectl get pods --all-namespaces',
            'docker-compose up -d',
            'terraform apply --auto-approve',
            'git push origin main',
            'ansible-playbook deploy.yml',
            'python automation.py',
            'cloud formation deploy',
            'jenkins build now'
        ];
        let i = 0,
            j = 0,
            deleting = false,
            speed = 100;
        (function tick() {
            const text = arr[i];
            if (deleting) {
                el.textContent = text.substring(0, j - 1);
                j--;
                speed = 50;
            } else {
                el.textContent = text.substring(0, j + 1);
                j++;
                speed = 100;
                if (soundEnabled && j % 3 === 0) playSound('typing');
            }
            if (!deleting && j === text.length) {
                deleting = true;
                speed = 2000;
            } else if (deleting && j === 0) {
                deleting = false;
                i = (i + 1) % arr.length;
                speed = 500;
            }
            setTimeout(tick, speed);
        })();
    }

    function createMatrixRain() {
        const bg = $('.matrix-bg');
        if (!bg) return;
        const canvas = document.createElement('canvas');
        bg.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        on(window, 'resize', resize);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}<>AWSDEVOPS".split("");
        const fontSize = 10;
        let columns = Math.floor(canvas.width / fontSize);
        let drops = new Array(columns).fill(1);
        setInterval(() => {
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = currentTheme === 'matrix' ? '#00ff00' : '#00ffff';
            ctx.font = fontSize + 'px monospace';
            drops.forEach((y, i) => {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(ch, i * fontSize, y * fontSize);
                drops[i] = (y * fontSize > canvas.height && Math.random() > 0.975) ? 0 : y + 1;
            });
        }, 35);
    }

    function initScrollAndNav() {
        // Observer animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                if (entry.target.classList.contains('skill-card')) {
                    const bar = entry.target.querySelector('.skill-level');
                    const level = entry.target.getAttribute('data-level');
                    if (bar && level) bar.style.setProperty('--skill-width', level + '%');
                }
                if (entry.target.classList.contains('stat-card')) {
                    const num = entry.target.querySelector('.stat-number');
                    if (num) animateNumber(num);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

        $$('.project-card, .skill-card, .stat-card, .about-content, .achievement-card, .timeline-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        // Active nav
        const sections = $$('section');
        const links = $$('.nav-link');
        on(window, 'scroll', () => {
            let current = '';
            sections.forEach(s => { if (scrollY >= (s.offsetTop - 200)) current = s.id; });
            links.forEach(l => {
                const href = l.getAttribute('href');
                const id = href ? href.slice(1) : '';
                if (id === current) l.classList.add('active');
                else l.classList.remove('active');
            });
        });

        // Smooth scrolling + mobile nav
        $$('a[href^="#"]').forEach(a => {
            on(a, 'click', (e) => {
                const href = a.getAttribute('href');
                if (!href) return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    playSound('click');
                }
            });
        });
        const burger = $('.hamburger');
        const menu = $('.nav-menu');
        on(burger, 'click', () => {
            burger.classList.toggle('active');
            if (menu) menu.classList.toggle('active');
            playSound('click');
        });
        $$('.nav-link').forEach(l => on(l, 'click', () => { if (burger) burger.classList.remove('active'); if (menu) menu.classList.remove('active'); }));
    }

    function animateNumber(el) {
        const target = parseFloat(el.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const t = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target % 1 === 0 ? target : target.toFixed(1);
                clearInterval(t);
            } else { el.textContent = Math.floor(current); }
        }, 16);
    }

    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;
        on(form, 'submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            console.log('Contact form submitted:', { name: fd.get('name'), email: fd.get('email'), message: fd.get('message') });
            alert('Thank you for your message! I will get back to you soon.');
            form.reset();
            playSound('success');
        });
    }

    // ============== INIT ALL ==============
    document.addEventListener('DOMContentLoaded', () => {
        initSoundUI();
        initTheme();
        initCommandPalette();
        initTerminal();
        initKonami();
        initLogoEasterEgg();
        initSurpriseButton();
        initProjectFilters();
        initSkillSearch();
        initBackToTop();
        initCertLightbox();
        initScrollAndNav();
        initContactForm();

        createParticles();
        initTyping();
        createMatrixRain();
        fetchGitHubStats();
        startCounters();
        updateVisitorCount();
        updateServerStatus();

        // Optional: Particles.js (only if script is included and #particles-js exists)
        if (typeof particlesJS !== 'undefined' && $('#particles-js')) {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80 },
                    color: { value: '#00ffff' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: '#00ffff', opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 2, out_mode: 'out' }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true }
                },
                retina_detect: true
            });
        }

        console.log('%c🚀 Portfolio Ready', 'color:#00ffff;font-weight:bold;');
    });

    // Cleanup timers (optional)
    window.addEventListener('beforeunload', () => {
        const highest = setTimeout(() => {}, 0);
        for (let i = 0; i <= highest; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    });

})();