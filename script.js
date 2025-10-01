// script.js
// Particle Background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.3})`;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particlesContainer.appendChild(particle);
    }
}

// Typing Effect
const typedTextElement = document.getElementById('typed');
const textArray = [
    'aws ec2 describe-instances',
    'kubectl get pods --all-namespaces',
    'docker-compose up -d',
    'terraform apply --auto-approve',
    'git push origin main',
    'ansible-playbook deploy.yml'
];
let textArrayIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentText = textArray[textArrayIndex];

    if (isDeleting) {
        typedTextElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typedTextElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textArrayIndex = (textArrayIndex + 1) % textArray.length;
        typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Animate skill levels
            if (entry.target.classList.contains('skill-card')) {
                const level = entry.target.querySelector('.skill-level');
                const skillLevel = entry.target.dataset.skill;
                const levelElement = entry.target.querySelector('.skill-level::after');
                if (level) {
                    const width = level.parentElement.querySelector('.skill-level').dataset.level || '85';
                    level.style.setProperty('--skill-width', width + '%');
                }
            }

            // Animate numbers
            if (entry.target.classList.contains('stat-card')) {
                const number = entry.target.querySelector('.stat-number');
                if (number) {
                    animateNumber(number);
                }
            }
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.project-card, .skill-card, .stat-card, .about-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Number Animation
function animateNumber(element) {
    const target = parseFloat(element.dataset.count);
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target % 1 === 0 ? target : target.toFixed(1);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Set skill levels
document.querySelectorAll('.skill-card').forEach(card => {
    const level = card.querySelector('.skill-level');
    if (level) {
        const width = level.dataset.level;
        level.style.setProperty('--skill-width', width + '%');
    }
});

// Matrix Rain Effect
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const matrixBg = document.querySelector('.matrix-bg');

    if (!matrixBg) return;

    matrixBg.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");

    const fontSize = 10;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ffff';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 35);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    type();
    createMatrixRain();

    // Add active nav link on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Glitch effect on hover
    document.querySelectorAll('.glitch').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.animation = 'glitch 0.3s infinite';
        });
        element.addEventListener('mouseleave', () => {
            element.style.animation = 'none';
        });
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Certifications Lightbox
const certBadges = document.querySelectorAll('.cert-badge');
const certOverlay = document.getElementById('cert-overlay');
const certPopupImg = document.getElementById('cert-popup-img');
const certPopupTitle = document.getElementById('cert-popup-title');
const certPopupClose = document.getElementById('cert-popup-close');

certBadges.forEach(badge => {
    badge.addEventListener('click', () => {
        const imgSrc = badge.getAttribute('data-img');
        const title = badge.getAttribute('data-title');
        certPopupImg.src = imgSrc;
        certPopupTitle.textContent = title;
        certOverlay.style.display = 'flex';
    });
});

certPopupClose.addEventListener('click', () => {
    certOverlay.style.display = 'none';
});

certOverlay.addEventListener('click', (e) => {
    if (e.target === certOverlay) {
        certOverlay.style.display = 'none';
    }
});

// Animate numbers when visible (add inside existing IntersectionObserver)
if (entry.target.classList.contains('stat-card')) {
    const number = entry.target.querySelector('.stat-number');
    if (number && !number.classList.contains('animated')) {
        number.classList.add('animated');
        let target = parseInt(number.dataset.count);
        let current = 0;
        let increment = Math.ceil(target / 50);
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                number.textContent = target;
                clearInterval(interval);
            } else {
                number.textContent = current;
            }
        }, 30);
    }
}