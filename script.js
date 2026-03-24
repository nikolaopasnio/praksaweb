/* 
================================================
  QUANTUM NETWORK | ULTIMATE MINECRAFT WEBSITE
  10. Design & UX: Interactive Elements
================================================ 
*/

// Loading Screen Logic
window.addEventListener('load', () => {
    const xpBar = document.getElementById('xp-bar-fill');
    let progress = 0;

    // Simulate loading fill for the XP Bar
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => loadingScreen.style.display = 'none', 800);
                }
            }, 500); // Short delay after 100% before fading out
        }
        if (xpBar) xpBar.style.width = `${progress}%`;
    }, 100);
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles
    if (window.particlesJS) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00aaaa" },
                "shape": { "type": "edge" },
                "opacity": { "value": 0.5, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#00aaaa", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    // 2. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 3. Scroll Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));



    // 5. Event Countdowns
    function startCountdown(id, dateStr) {
        const el = document.getElementById(id);
        if (!el) return;
        const target = new Date(dateStr).getTime();

        setInterval(() => {
            const now = new Date().getTime();
            const dist = target - now;

            if (dist < 0) { el.innerHTML = "STARTED!"; return; }

            const d = Math.floor(dist / (1000 * 60 * 60 * 24));
            const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((dist % (1000 * 60)) / 1000);

            el.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
        }, 1000);
    }

    // Set mocks for a few days ahead
    let d1 = new Date(); d1.setHours(d1.getHours() + 12);
    let d2 = new Date(); d2.setDate(d2.getDate() + 3);
    startCountdown('countdown-pvp', d1);
    startCountdown('countdown-build', d2);

    // 6. Live Server Stats Fetching Mock
    setInterval(() => {
        // Randomly fluctuate players
        let currentPlayers = 1540 + Math.floor(Math.random() * 21) - 10;
        const pEl = document.getElementById('onlinePlayers');
        if (pEl) pEl.innerText = `${currentPlayers.toLocaleString()} PLAYERS ONLINE`;
    }, 5000);
});

// IP Copy Function (Toast)
function copyIP() {
    const ip = "PLAY.QUANTUM.COM";
    navigator.clipboard.writeText(ip).then(() => {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.innerText = "IP COPIED: " + ip;
            toast.classList.add("show");
        }
        const hint = document.getElementById("copyHint");
        if (hint) hint.innerText = "✔ COPIED!";

        setTimeout(() => {
            if (toast) toast.classList.remove("show");
            if (hint) hint.innerText = "CLICK TO COPY IP";
        }, 3000);
    }).catch(err => console.error("Could not copy text: ", err));
}
