const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CFG = window.PORTFOLIO_CONFIG || {};

$("#year").textContent = new Date().getFullYear();

/* ---- Toast helper ---- */
const toastEl = $("#toast");
let toastTimer = null;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

/* ---- Copy email helper ---- */
async function copyEmail() {
  const email = "techyexpert98@gmail.com";
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(email);
    } else {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("Email copied: " + email);
  } catch (e) {
    showToast("Email: " + email);
  }
}
const copyEmailHero = $("#copyEmailHero");
if (copyEmailHero) copyEmailHero.addEventListener("click", copyEmail);

/* ---- Apply optional config links (LinkedIn & Resume) ---- */
if (CFG.linkedinUrl) {
  const row = $("#linkedinRow"), link = $("#linkedinLink");
  if (row && link) {
    link.href = CFG.linkedinUrl;
    link.textContent = CFG.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "");
    row.style.display = "flex";
  }
}
if (CFG.resumeUrl) {
  const navCta = $("#navCta");
  if (navCta) {
    navCta.href = CFG.resumeUrl;
    navCta.setAttribute("download", "");
    navCta.textContent = "Download Resume";
  }
}

/* ---- Theme toggle (dark / light) ---- */
const themeBtn = $("#themeBtn");
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t === "light" ? "🌙" : "☀️";
  const metaTheme = $('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = t === "light" ? "#f6f8fc" : "#050814";
}
let savedTheme = "dark";
try { savedTheme = localStorage.getItem("portfolio_theme") || "dark"; } catch (e) {}
applyTheme(savedTheme);
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("portfolio_theme", next); } catch (e) {}
  showToast(next === "light" ? "Switched to Light Theme" : "Switched to Dark Theme");
});

/* ---- Load me.png when hosted alongside the file ---- */
const photo = $("#myPhoto");
if (location.protocol === "http:" || location.protocol === "https:" || location.protocol === "file:") {
  const realPhoto = new Image();
  realPhoto.onload = () => { photo.src = "me.png"; };
  realPhoto.src = "me.png";
}

/* ---- Interactive Case Study Tabs ---- */
$$(".case").forEach(card => {
  const tabs = $$(".case-tab", card);
  const panels = $$(".case-panel", card);
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      panels.forEach(p => p.classList.toggle("active", p.dataset.panel === target));
    });
  });
});

/* ---- Interactive Skill Category Filter ---- */
const skillBtns = $$("#skillFilters button");
const skillCards = $$("#skillGrid .panel");
skillBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    skillBtns.forEach(b => b.classList.toggle("active", b === btn));
    skillCards.forEach(card => {
      const match = f === "all" || card.dataset.cat === f;
      card.classList.toggle("dimmed", !match);
    });
  });
});

/* ---- Command Palette (Ctrl+K / Cmd+K) ---- */
const cmdBackdrop = $("#cmdBackdrop"), cmdBtn = $("#cmdBtn"), cmdClose = $("#cmdClose"), cmdSearch = $("#cmdSearch");
const cmdItems = $$("#cmdList button");
function toggleCmd(force) {
  const open = typeof force === "boolean" ? force : !cmdBackdrop.classList.contains("open");
  cmdBackdrop.classList.toggle("open", open);
  cmdBackdrop.setAttribute("aria-hidden", String(!open));
  if (open) {
    cmdSearch.value = "";
    cmdItems.forEach(b => b.style.display = "flex");
    setTimeout(() => cmdSearch.focus(), 60);
  }
}
if (cmdBtn) cmdBtn.addEventListener("click", () => toggleCmd(true));
if (cmdClose) cmdClose.addEventListener("click", () => toggleCmd(false));
cmdBackdrop.addEventListener("click", e => { if (e.target === cmdBackdrop) toggleCmd(false); });
cmdSearch.addEventListener("input", () => {
  const q = cmdSearch.value.toLowerCase();
  cmdItems.forEach(b => {
    b.style.display = b.textContent.toLowerCase().includes(q) ? "flex" : "none";
  });
});
cmdItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const act = btn.dataset.action;
    toggleCmd(false);
    if (act === "scroll") {
      const target = $(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    } else if (act === "chat") {
      toggleChat(true);
    } else if (act === "copy") {
      copyEmail();
    } else if (act === "theme") {
      themeBtn.click();
    }
  });
});

/* ---- Interactive Constellation Particle Canvas ---- */
const canvas = $("#bgCanvas");
if (canvas && !reduce) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, pts = [];
  const mouse = { x: -9999, y: -9999 };
  const isMobile = () => innerWidth < 640;

  function initCanvas() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    const count = isMobile() ? 14 : 26;
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.5 + 0.8
    }));
  }
  initCanvas();
  addEventListener("resize", initCanvas);
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  function draw() {
    if (window.scrollY > h * 1.15) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, w, h);
    const light = document.documentElement.getAttribute("data-theme") === "light";
    const dotCol = light ? "rgba(37, 99, 235, 0.30)" : "rgba(124, 196, 250, 0.45)";
    const lineRgb = light ? "37, 99, 235" : "124, 196, 250";

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotCol;
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${lineRgb}, ${(1 - dist / 135) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 165) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${lineRgb}, ${(1 - md / 165) * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ---- Mobile menu & Global Keyboard Shortcuts ---- */
const menuBtn = $("#menuBtn"), links = $("#links");
const closeMenu = () => { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
menuBtn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
$$("a", links).forEach(a => a.addEventListener("click", closeMenu));
addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    toggleCmd();
  } else if (e.key === "Escape") {
    closeMenu();
    toggleCmd(false);
  }
});
document.addEventListener("click", e => { if (!e.target.closest("nav")) closeMenu(); });
addEventListener("resize", () => { if (innerWidth > 900) closeMenu(); });

/* ---- Scroll: progress bar, photo fade + parallax, menu highlight ---- */
const progress = $("#progress"), hero = $("#top"), stage = $("#photo"), heroText = $("#heroText");
const items = $$(".links a.item");
const sections = items.map(a => $(a.getAttribute("href")));
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

  const p = Math.min(y / (hero.offsetHeight * 0.75), 1);
  stage.style.opacity = 1 - p;
  stage.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(${1 - p * 0.06})`;
  heroText.style.opacity = 1 - p * 0.65;
  heroText.style.transform = `translate3d(0, ${y * 0.07}px, 0)`;

  const mark = y + 140;
  sections.forEach((s, i) => {
    if (s && s.offsetTop <= mark && s.offsetTop + s.offsetHeight > mark) {
      items.forEach(a => a.classList.remove("active"));
      items[i].classList.add("active");
    }
  });
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

/* ---- Reveal on scroll + counters ---- */
function countUp(el) {
  const target = +el.dataset.count; let n = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const t = setInterval(() => { n = Math.min(target, n + step); el.textContent = n; if (n >= target) clearInterval(t); }, 30);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$(".reveal, .stagger").forEach(el => io.observe(el));

/* ---- Typing effect ---- */
const words = ["education platforms.", "AI-powered tools.", "campus software.", "scalable web apps."];
const typedEl = $("#typed");
if (reduce) { typedEl.textContent = words[0]; }
else {
  let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    typedEl.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  })();
}

/* ---- Marquee ---- */
const track = $("#marqueeTrack");
track.innerHTML += track.innerHTML;

/* ---- Cursor glow ---- */
const glow = $("#cursorGlow");
addEventListener("pointermove", e => { glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`; }, { passive: true });

/* ---- 3D tilt + shine + magnetic buttons ---- */
if (!reduce && matchMedia("(hover: hover)").matches) {
  $$(".tilt").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      const big = r.width > 700 ? 0.25 : 1;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7 * big}deg) rotateY(${(x - 0.5) * 9 * big}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  $$(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.16;
      el.style.transform = `translate(${dx}px, ${dy - 2}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ---- Contact form inline feedback ---- */
const contactForm = $("#contactForm"), formStatus = $("#formStatus");
contactForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (location.protocol !== "http:" && location.protocol !== "https:") {
    formStatus.textContent = "Message ready — when deployed on Netlify, this submits directly to your Netlify Forms inbox.";
    formStatus.classList.add("show");
    contactForm.reset();
    return;
  }
  const data = new FormData(contactForm);
  try {
    const res = await fetch(location.pathname || "/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString()
    });
    if (res.ok) {
      formStatus.textContent = "Thanks! Your message has been received.";
      contactForm.reset();
    } else {
      formStatus.textContent = "Could not send right now — feel free to email techyexpert98@gmail.com directly.";
    }
  } catch (err) {
    formStatus.textContent = "Could not send right now — feel free to email techyexpert98@gmail.com directly.";
  }
  formStatus.classList.add("show");
});

/* ---- AI Portfolio Chatbot ---- */
const chatFab = $("#chatFab"), chatWidget = $("#chatWidget"), chatClose = $("#chatClose");
const chatBody = $("#chatBody"), chatForm = $("#chatForm"), chatInput = $("#chatInput");
const chatModeLabel = $("#chatModeLabel");

chatModeLabel.textContent = (CFG.apiEndpoint || CFG.geminiApiKey) ? "Live AI · Connected" : "Smart Assistant · Ready";

function toggleChat(force) {
  const open = typeof force === "boolean" ? force : !chatWidget.classList.contains("open");
  chatWidget.classList.toggle("open", open);
  chatWidget.setAttribute("aria-hidden", String(!open));
  chatFab.setAttribute("aria-expanded", String(open));
  if (open) setTimeout(() => chatInput.focus(), 140);
}
chatFab.addEventListener("click", () => toggleChat());
chatClose.addEventListener("click", () => toggleChat(false));

function appendMsg(text, who, isHtml = false) {
  const div = document.createElement("div");
  div.className = "chat-msg " + who;
  if (isHtml) div.innerHTML = text;
  else div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return div;
}

function localAnswer(q) {
  const s = q.toLowerCase();
  if (s.includes("campus") || s.includes("fyp") || s.includes("risk")) {
    return "Campus Core AI is Zahid's full-stack campus management platform built with Python (FastAPI), Next.js (TypeScript & Tailwind CSS), Scikit-learn for early-warning student risk prediction, and the Gemini API for AI study advice.";
  }
  if (s.includes("ilm") || s.includes("ails") || s.includes("academy") || s.includes("edtech")) {
    return "Al-Ilm Learning Site (ailslearning.com) is an FBR- and SECP-registered free online academy in Pakistan. Zahid serves as Co-founder and Technical Manager, leading web development and technical operations.";
  }
  if (s.includes("skill") || s.includes("stack") || s.includes("tech") || s.includes("language")) {
    return "Zahid works with HTML5, CSS3, JavaScript, TypeScript, React/Next.js, Tailwind CSS, Python, FastAPI, REST APIs, SQL, Scikit-learn, and the Gemini API, using Git/GitHub and Netlify.";
  }
  if (s.includes("contact") || s.includes("email") || s.includes("hire") || s.includes("github") || s.includes("linkedin")) {
    return "You can reach Zahid at techyexpert98@gmail.com, check his code at github.com/zahid-ahmedk, or use the contact form right on this page.";
  }
  if (s.includes("education") || s.includes("university") || s.includes("quest") || s.includes("degree")) {
    return "Zahid completed his BS in Information Technology (2021–2026) at Quaid-e-Awam University of Engineering, Science and Technology (QUEST), Nawabshah.";
  }
  return "Zahid Ahmed is a BS IT graduate from Nawabshah, Pakistan, building Al-Ilm Learning Site (ailslearning.com) and Campus Core AI. Ask about his projects, skills, education, or contact info!";
}

async function askAssistant(question) {
  appendMsg(question, "user");
  const thinking = appendMsg('<span class="typing-dots"><i></i><i></i><i></i></span>', "bot", true);

  if (CFG.apiEndpoint) {
    try {
      const res = await fetch(CFG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, systemPrompt: CFG.systemPrompt })
      });
      const data = await res.json();
      thinking.textContent = data.reply || data.text || localAnswer(question);
      return;
    } catch (e) {}
  }

  if (CFG.geminiApiKey) {
    try {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(CFG.geminiApiKey);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: CFG.systemPrompt + "\n\nVisitor question: " + question }] }]
        })
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) { thinking.textContent = reply; return; }
    } catch (e) {}
  }

  setTimeout(() => { thinking.textContent = localAnswer(question); }, 350);
}

chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const q = chatInput.value.trim();
  if (!q) return;
  chatInput.value = "";
  askAssistant(q);
});

$$("#chatQuick button").forEach(btn => {
  btn.addEventListener("click", () => askAssistant(btn.dataset.q));
});
