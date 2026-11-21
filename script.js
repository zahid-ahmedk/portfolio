const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CFG = window.PORTFOLIO_CONFIG || {};

$("#year").textContent = new Date().getFullYear();

/* ---- Apply config.js (LinkedIn & Resume) ---- */
if (CFG.linkedinUrl) {
  const row = $("#linkedinRow"), link = $("#linkedinLink"), navLi = $("#navLinkedin");
  if (row && link) {
    link.href = CFG.linkedinUrl;
    link.textContent = CFG.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "");
    row.style.display = "flex";
  }
  if (navLi) {
    navLi.href = CFG.linkedinUrl;
    navLi.style.display = "inline-flex";
  }
}

/* ---- Theme toggle (dark obsidian default + light mode) ---- */
const themeBtn = $("#themeBtn");
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t === "light" ? "🌙" : "☀️";
  const metaTheme = $('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = t === "light" ? "#f4f7fa" : "#050709";
}
let savedTheme = "dark";
try { savedTheme = localStorage.getItem("portfolio_theme_v3") || "dark"; } catch (e) {}
applyTheme(savedTheme);
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("portfolio_theme_v3", next); } catch (e) {}
});

/* ---- Load me.png when hosted ---- */
const photo = $("#myPhoto");
if (location.protocol === "http:" || location.protocol === "https:" || location.protocol === "file:") {
  const realPhoto = new Image();
  realPhoto.onload = () => { photo.src = "me.png"; };
  realPhoto.src = "me.png";
}

/* ---- Spotlight & Magnetic hover (desktop only, lightweight) ---- */
if (!reduce && matchMedia("(hover: hover)").matches) {
  $$(".spotlight").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  $$(".magnetic").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.14;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.14;
      el.style.transform = `translate(${dx}px, ${dy - 2}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ---- Case Study Tabs ---- */
$$(".case-box").forEach(card => {
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

/* ---- Skill Filter Pills ---- */
const skillBtns = $$("#skillFilters button");
const skillCards = $$("#skillGrid .skill-box");
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

/* ---- Mobile Menu ---- */
const menuBtn = $("#menuBtn"), links = $("#links");
const closeMenu = () => { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
menuBtn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
$$("a", links).forEach(a => a.addEventListener("click", closeMenu));
addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
document.addEventListener("click", e => { if (!e.target.closest("header")) closeMenu(); });
addEventListener("resize", () => { if (innerWidth > 900) closeMenu(); });

/* ---- Scroll Progress & Active Nav ---- */
const progress = $("#progress");
const items = $$(".nav-box a.item");
const sections = items.map(a => $(a.getAttribute("href")));
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  const mark = y + 120;
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

/* ---- Reveal & Counters ---- */
function countUp(el) {
  const target = +el.dataset.count; let n = 0;
  const step = Math.max(1, Math.ceil(target / 35));
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

/* ---- Typing Effect ---- */
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

/* ---- Contact Form ---- */
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
      formStatus.textContent = "Could not send right now — please email techyexpert98@gmail.com directly.";
    }
  } catch (err) {
    formStatus.textContent = "Could not send right now — please email techyexpert98@gmail.com directly.";
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
