"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlinePlayers, setOnlinePlayers] = useState(null);

  useEffect(() => {
    // 1. Fetch Leaderboard Data
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    const refreshInterval = setInterval(fetchLeaderboard, 5000);

    // 2. Initialize Particles.js
    if (window.particlesJS) {
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#00aaaa" },
          shape: { type: "edge" },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: "#00aaaa", opacity: 0.4, width: 1 },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } },
        },
        retina_detect: true,
      });
    }

    // 3. Scroll Reveal Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));

    // 4. XP Bar Loading Screen Simulation
    const xpBar = document.getElementById("xp-bar-fill");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          const loadingScreen = document.getElementById("loading-screen");
          if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
            setTimeout(() => (loadingScreen.style.display = "none"), 800);
          }
        }, 500);
      }
      if (xpBar) xpBar.style.width = `${progress}%`;
    }, 100);

    // 5. Countdowns
    const startCountdown = (id, dateStr) => {
      const el = document.getElementById(id);
      if (!el) return;
      const target = new Date(dateStr).getTime();
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;
        if (dist < 0) {
          el.innerHTML = "STARTED!";
          clearInterval(timer);
          return;
        }
        const d = Math.floor(dist / (1000 * 60 * 60 * 24));
        const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((dist % (1000 * 60)) / 1000);
        el.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
      }, 1000);
      return () => clearInterval(timer);
    };

    let d1 = new Date(); d1.setHours(d1.getHours() + 12);
    let d2 = new Date(); d2.setDate(d2.getDate() + 3);
    startCountdown("countdown-pvp", d1);
    startCountdown("countdown-build", d2);

    // 6. Real Online Players from Minecraft Server
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/players");
        const data = await res.json();
        setOnlinePlayers(data.online);
      } catch (err) {
        setOnlinePlayers(0);
      }
    };
    fetchPlayers();
    const playersInterval = setInterval(fetchPlayers, 2000);
    return () => {
      clearInterval(interval);
      clearInterval(playersInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const copyIP = () => {
    const ip = "asia-trail.gl.joinmc.link";
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
    });
  };

  return (
    <>
      <div id="loading-screen" className="loading-screen">
        <img src="/tex-grass.png" alt="Loading..." className="spinning-block" />
        <div className="xp-bar-container">
          <div className="xp-bar-fill" id="xp-bar-fill"></div>
        </div>
        <div className="loading-text">Loading World...</div>
      </div>

      <div id="particles-js"></div>

      <nav className="navbar">
        <div className="logo">
          <svg className="quantum-logo-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#111", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#333", stopOpacity: 1 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M70 10 L120 40 L120 100 L70 130 L20 100 L20 40 Z" fill="url(#shieldGrad)" stroke="var(--cyan)" strokeWidth="6" filter="url(#glow)" />
            <path d="M70 10 L120 40 L70 70 L20 40 Z" fill="rgba(0, 170, 170, 0.1)" />
            <g fill="none" strokeWidth="8" strokeLinecap="square" opacity="0.9">
              <path d="M40 100 L100 40" stroke="var(--purple)" />
              <path d="M35 105 L45 95" stroke="var(--purple)" strokeWidth="12" />
              <path d="M100 100 L40 40" stroke="var(--gold)" />
              <path d="M35 45 L55 25" stroke="var(--gold)" strokeWidth="6" />
              <path d="M25 55 L45 35" stroke="var(--gold)" strokeWidth="6" />
            </g>
            <g filter="url(#glow)">
              <rect x="55" y="55" width="30" height="30" fill="var(--cyan)" transform="rotate(45 70 70)">
                <animate attributeName="fill" values="var(--cyan); var(--purple); var(--cyan)" dur="4s" repeatCount="indefinite" />
              </rect>
              <rect x="62" y="62" width="16" height="16" fill="white" transform="rotate(45 70 70)" opacity="0.5" />
            </g>
            <path d="M70 20 A50 50 0 1 1 69.9 20" fill="none" stroke="rgba(0, 170, 170, 0.3)" strokeWidth="1" strokeDasharray="2 4">
              <animateTransform attributeName="transform" type="rotate" from="0 70 70" to="360 70 70" dur="10s" repeatCount="indefinite" />
            </path>
          </svg>
          <span className="logo-text">QUANTUM<br /><span className="cyan-text" style={{ fontSize: "0.6em", textShadow: "none" }}>NETWORK</span></span>
        </div>

        <ul className="nav-links" id="navLinks">
          <li><a href="#home">HOME</a></li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#store">STORE</a></li>
          <li><a href="#staff">STAFF</a></li>
          <li><a href="#info">HELP</a></li>
        </ul>

        <div className="nav-auth">
          <button className="mc-btn nav-login-btn" id="navLoginBtn">🔑 LOGIN</button>
          <div className="nav-user-info" id="navUserInfo" style={{ display: "none" }}>
            <span className="nav-username" id="navUserLabel"></span>
            <button className="mc-btn nav-logout-btn" id="navLogoutBtn">LOGOUT</button>
          </div>
        </div>

        <button className="mobile-menu-toggle" id="mobileMenuBtn">☰</button>
      </nav>

      <section className="hero" id="home">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <div className="version-badge">VERSION 1.20.X - 1.21</div>
          <h1 className="mc-title">QUANTUM<br /><span className="cyan-text">NETWORK</span></h1>

          <div className="mc-dark-panel live-stats glowing-border">
            <span className="pulse-dot">🟢</span>
            <span className="shadow-text" id="onlinePlayers">
              {onlinePlayers === null ? "..." : onlinePlayers.toLocaleString()} PLAYERS ONLINE
            </span>
          </div>

          <div className="mc-dark-panel ip-widget hover-scale" id="ipWidget" onClick={copyIP}>
            <span className="ip-text shadow-text" id="ipText">asia-trail.gl.joinmc.link</span>
            <span className="copy-hint" id="copyHint">CLICK TO COPY IP</span>
          </div>

          <div className="hero-buttons">
            <a href="#store" className="mc-btn primary">🛒 STORE</a>
          </div>

          <div className="scroll-indicator">
            <span>SCROLL DOWN</span>
            <div className="arrow">↓</div>
          </div>
        </div>
        <div className="mc-dark-panel toast" id="toast">COPIED TO CLIPBOARD!</div>
      </section>

      <section className="about" id="about">
        <h2 className="section-title">ABOUT <span className="purple-text">QUANTUM</span></h2>
        <div className="about-grid">
          <div className="mc-panel about-text scroll-animate">
            <h3>SERVER HISTORY</h3>
            <p>Founded in 2026, Quantum Network is an ultra-premium Minecraft experience. Enjoy custom mechanics, zero lag, and a toxic-free environment.</p>
            <h3 style={{ marginTop: "20px" }}>GAMEMODES</h3>
            <div className="badges">
              <span className="mc-badge survival">Survival</span>
              <span className="mc-badge skyblock">SkyBlock</span>
              <span className="mc-badge factions">Factions</span>
              <span className="mc-badge pvp">PvP</span>
              <span className="mc-badge lifesteal">Lifesteal</span>
              <span className="mc-badge roleplay">Roleplay</span>
            </div>
          </div>
          <div className="mc-panel about-media scroll-animate">
            <div className="video-container">
              <iframe width="100%" height="250" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Server Trailer" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="store" id="store">
        <h2 className="section-title">SERVER <span className="gold-text">STORE</span></h2>
        <p className="section-subtitle">Auto-syncs instantly with the Minecraft server</p>
        <div className="pricing-table">
          <div className="mc-panel price-card scroll-animate">
            <h3>VIP RANK</h3>
            <div className="price">$9.99<span style={{ fontSize: "0.5em", color: "#aaa" }}>/lifetime</span></div>
            <div className="perks">
              <ul>
                <li><i className="fas fa-check text-green"></i> Priority Queue</li>
                <li><i className="fas fa-check text-green"></i> Yellow Chat Prefix</li>
              </ul>
            </div>
            <button className="mc-btn">PURCHASE</button>
          </div>
          <div className="mc-panel price-card popular-card scroll-animate">
            <div className="popular-badge">BEST VALUE</div>
            <h3 className="cyan-text shadow-text" style={{ fontSize: "2.2rem" }}>MVP RANK</h3>
            <div className="price">$19.99<span style={{ fontSize: "0.5em", color: "#aaa" }}>/lifetime</span></div>
            <div className="perks">
              <ul>
                <li><i className="fas fa-check text-green"></i> High Priority Queue</li>
                <li><i className="fas fa-check text-green"></i> Aqua Chat Prefix</li>
              </ul>
            </div>
            <button className="mc-btn primary">PURCHASE</button>
          </div>
          <div className="mc-panel price-card scroll-animate">
            <h3>ELITE RANK</h3>
            <div className="price">$39.99<span style={{ fontSize: "0.5em", color: "#aaa" }}>/lifetime</span></div>
            <div className="perks">
              <ul>
                <li><i className="fas fa-check text-green"></i> Queue Bypass</li>
                <li><i className="fas fa-check text-green"></i> Custom Hex Colors</li>
              </ul>
            </div>
            <button className="mc-btn">PURCHASE</button>
          </div>
        </div>
      </section>

      {/* Meet the Staff Section */}
      <section id="staff" className="section-padding scroll-animate">
        <h2 className="section-title shadow-text">Meet the <span className="cyan-text">Staff</span></h2>
        <p className="section-subtitle">Our dedicated team behind Quantum Network</p>
        
        <div className="staff-grid">
          <div className="mc-panel staff-card">
            <img src="https://mc-heads.net/body/nikolaopasnio" alt="Nikola" className="staff-body" />
            <h3>Nikola</h3>
            <div className="staff-role shadow-text">OWNER</div>
            <p>Lead Developer & Founder</p>
          </div>
          
          <div className="mc-panel staff-card">
            <img src="https://mc-heads.net/body/MHF_Steve" alt="Admin" className="staff-body" />
            <h3>QuantumAdmin</h3>
            <div className="staff-role shadow-text" style={{color: "var(--red)"}}>ADMINISTRATOR</div>
            <p>Infrastructure & Community</p>
          </div>
          
          <div className="mc-panel staff-card">
            <img src="https://mc-heads.net/body/MHF_Alex" alt="Moderator" className="staff-body" />
            <h3>VoxelGuard</h3>
            <div className="staff-role shadow-text" style={{color: "var(--gold)"}}>MODERATOR</div>
            <p>Rules & Fair Play</p>
          </div>
          
          <div className="mc-panel staff-card">
            <img src="https://mc-heads.net/body/MHF_Enderman" alt="Helper" className="staff-body" />
            <h3>PixelHelper</h3>
            <div className="staff-role shadow-text" style={{color: "var(--green)"}}>HELPER</div>
            <p>Player Support & Welcoming</p>
          </div>
        </div>
      </section>

      {/* Information Hub Section */}
      <section id="info" className="section-padding scroll-animate">
        <h2 className="section-title shadow-text">Information <span className="gold-text">Hub</span></h2>
        <p className="section-subtitle">Quick access to server resources and documentation</p>
        
        <div className="grid-container-3">
          <div className="mc-panel info-card">
            <h3 className="gold-text"><i className="fa-solid fa-book-open"></i> Server Rules</h3>
            <ul>
              <li>• No hacking or unauthorized clients</li>
              <li>• Respect all community members</li>
              <li>• No griefing in protected regions</li>
              <li>• No spam or unsolicited advertising</li>
            </ul>
            <div className="wiki-links" style={{marginTop: "15px"}}>
              <a href="#">READ FULL RULES <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
          
          <div className="mc-panel info-card">
            <h3 className="red-text"><i className="fa-solid fa-shield-halved"></i> Support Center</h3>
            <ul>
              <li>• Open a technical support ticket</li>
              <li>• Appeal a gameplay ban/mute</li>
              <li>• Report player misconduct</li>
              <li>• Submit a server bug report</li>
            </ul>
            <div className="wiki-links" style={{marginTop: "15px"}}>
              <a href="#">GET ASSISTANCE <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
          
          <div className="mc-panel info-card">
            <h3 className="cyan-text"><i className="fa-solid fa-circle-info"></i> Server Wiki</h3>
            <ul>
              <li>• New Player - Getting Started</li>
              <li>• Custom Enchantment Guide</li>
              <li>• Rank Benefits & Permissions</li>
              <li>• Global Economy & Trading</li>
            </ul>
            <div className="wiki-links" style={{marginTop: "15px"}}>
              <a href="#">BROWSE WIKI <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-vote-wrapper" id="leaderboards">
        <h2 className="section-title">TOP <span className="cyan-text">PLAYERS</span></h2>
        <div className="grid-container-2">
          <div className="mc-panel table-container scroll-animate">
            <table className="data-table" id="kills-data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>PLAYER</th>
                  <th>KILLS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: "center" }}>LOADING STATS...</td></tr>
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((player, index) => (
                    <tr key={index}>
                      <td className={index === 0 ? "gold-text" : ""}>#{index + 1}</td>
                      <td>
                        <img
                          src={`https://crafatar.com/avatars/${player?.username || "steve"}?size=24`}
                          className="inline-head"
                          alt="head"
                          onError={(e) => { e.target.src = "https://crafatar.com/avatars/steve?size=24" }}
                        />
                        {player?.username && player.username.length > 15
                          ? player.username.substring(0, 10) + "..."
                          : (player?.username || "UNKNOWN").toUpperCase()}
                      </td>
                      <td>{(player?.value || 0).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{ textAlign: "center" }}>NO DATA FOUND</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mc-panel vote-panel scroll-animate" id="vote">
            <h3>VOTE & REWARDS 🎁</h3>
            <p>Support the server and get daily rewards, crate keys, and cash!</p>
            <div className="vote-links">
              <a href="#" className="mc-btn vote-btn">Vote Site #1</a>
              <a href="#" className="mc-btn vote-btn">Vote Site #2</a>
              <a href="#" className="mc-btn vote-btn">Vote Site #3</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div className="brand">
            <h2 className="shadow-text">QUANTUM NETWORK</h2>
            <p>The ultimate Minecraft multiplayer experience.</p>
          </div>
        </div>
        <div className="disclaimer">
          <p>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT ASSOCIATED WITH MOJANG.</p>
          <p>&copy; 2026 QUANTUM NETWORK. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Auth Toast Notification */}
      <div className="auth-toast" id="auth-toast"></div>

      {/* ═══════════════════════════════════════════════
           AUTH MODAL — Login / Register
      ═══════════════════════════════════════════════ */}
      <div className="auth-modal-overlay" id="authModal">
        <div className="auth-modal-card">
          <button className="auth-modal-close" id="authModalClose">✖</button>
          <div className="auth-modal-header">
            <svg className="auth-logo-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shieldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#111", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#333", stopOpacity: 1 }} />
                </linearGradient>
                <filter id="glow2">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M70 10 L120 40 L120 100 L70 130 L20 100 L20 40 Z" fill="url(#shieldGrad2)" stroke="#00AAAA" strokeWidth="6" filter="url(#glow2)" />
              <g fill="none" strokeWidth="8" strokeLinecap="square" opacity="0.9">
                <path d="M40 100 L100 40" stroke="#AA00AA" />
                <path d="M35 105 L45 95" stroke="#AA00AA" strokeWidth="12" />
                <path d="M100 100 L40 40" stroke="#FFAA00" />
                <path d="M35 45 L55 25" stroke="#FFAA00" strokeWidth="6" />
                <path d="M25 55 L45 35" stroke="#FFAA00" strokeWidth="6" />
              </g>
              <g filter="url(#glow2)">
                <rect x="55" y="55" width="30" height="30" fill="#00AAAA" transform="rotate(45 70 70)">
                  <animate attributeName="fill" values="#00AAAA;#AA00AA;#00AAAA" dur="4s" repeatCount="indefinite" />
                </rect>
                <rect x="62" y="62" width="16" height="16" fill="white" transform="rotate(45 70 70)" opacity="0.5" />
              </g>
            </svg>
            <div className="auth-modal-title">QUANTUM <span className="cyan-text">NETWORK</span></div>
            <div className="auth-modal-subtitle">Join thousands of players</div>
          </div>

          <div className="auth-tabs">
            <button className="auth-tab-btn active" data-tab="login">LOGIN</button>
            <button className="auth-tab-btn" data-tab="register">REGISTER</button>
          </div>

          <form className="auth-form" id="login-form">
            <div className="auth-field">
              <label>EMAIL</label>
              <input type="email" id="login-email" placeholder="player@quantum.com" required autoComplete="email" />
            </div>
            <div className="auth-field">
              <label>PASSWORD</label>
              <input type="password" id="login-password" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" className="mc-btn auth-submit-btn primary">⚡ LOGIN</button>

            <div className="auth-divider"><span>OR</span></div>

            <button type="button" className="google-signin-btn">
              <svg className="google-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              SIGN IN WITH GOOGLE
            </button>
          </form>

          <form className="auth-form" id="register-form" style={{ display: "none" }}>
            <div className="auth-field">
              <label>USERNAME</label>
              <input type="text" id="reg-username" placeholder="YourPlayerName" required autoComplete="username" />
            </div>
            <div className="auth-field">
              <label>EMAIL</label>
              <input type="email" id="reg-email" placeholder="player@quantum.com" required autoComplete="email" />
            </div>
            <div className="auth-field">
              <label>PASSWORD</label>
              <input type="password" id="reg-password" placeholder="Min. 6 characters" required autoComplete="new-password" />
            </div>
            <button type="submit" className="mc-btn auth-submit-btn primary">🚀 CREATE ACCOUNT</button>

            <div className="auth-divider"><span>OR</span></div>

            <button type="button" className="google-signin-btn">
              <svg className="google-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              SIGN UP WITH GOOGLE
            </button>
          </form>
        </div>
      </div>
    </>
  );
}