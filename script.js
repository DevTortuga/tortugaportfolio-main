
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================ LOADER ============================ */
  function initLoader() {
    const loader = $("#loader");
    if (!loader) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      loader.classList.add("is-done");
      document.body.style.overflow = "";
      startTyping();
    }, 1400);
  }

  /* ============================ TYPING ============================ */
  // subtitle from the brief
  const TYPE_LINES = [
    "Roblox Scripter • 4+ Years Experience",
    "FPS Frameworks • UI Systems • Game Architecture",
    "Clean, modular, scalable Lua."
  ];
  let typingStarted = false;
  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    const el = $("#typed");
    if (!el) return;
    if (reduceMotion) { el.textContent = TYPE_LINES[0]; return; }

    let li = 0, ci = 0, deleting = false;
    (function loop() {
      const full = TYPE_LINES[li];
      el.textContent = deleting ? full.slice(0, --ci) : full.slice(0, ++ci);

      let delay = deleting ? 35 : 60;
      if (!deleting && ci === full.length) { delay = 2000; deleting = true; }
      else if (deleting && ci === 0)       { deleting = false; li = (li + 1) % TYPE_LINES.length; delay = 400; }
      setTimeout(loop, delay);
    })();
  }

  /* ============================ PARTICLES ========================= */
  function initParticles() {
    const canvas = $("#particles");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;

    // particle count scaled to viewport for performance
    const count = () => Math.min(90, Math.floor(window.innerWidth / 16));

    function resize() {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
      particles = Array.from({ length: count() }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.4
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,255,136,0.5)";
        ctx.fill();

        // link nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 13000) {
            ctx.strokeStyle = `rgba(0,255,136,${0.12 * (1 - dist / 13000)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); draw(); }, { passive: true });

    // pause when tab hidden (saves battery/CPU)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ============================ CODE GLYPHS ======================= */
  function initGlyphs() {
    const host = $("#codeGlyphs");
    if (!host || reduceMotion) return;
    const symbols = ["{ }", "</>", "()", "[]", "::", "->", "local", "end", "fn", "0x1F", "=>", "self"];
    const n = window.innerWidth < 760 ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const g = document.createElement("span");
      g.className = "glyph";
      g.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      g.style.left = Math.random() * 100 + "vw";
      g.style.fontSize = (Math.random() * 0.8 + 0.8) + "rem";
      g.style.animationDuration = (Math.random() * 18 + 16) + "s";
      g.style.animationDelay = -(Math.random() * 30) + "s";
      host.appendChild(g);
    }
  }

  /* ============================ MOUSE GLOW ======================== */
  function initMouseGlow() {
    const glow = $("#mouseGlow");
    if (!glow || reduceMotion || matchMedia("(pointer: coarse)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY; glow.style.opacity = "1";
    }, { passive: true });
    (function follow() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ============================ NAV ============================== */
  function initNav() {
    const nav    = $("#nav");
    const burger = $("#navBurger");
    const links  = $("#navLinks");
    const anchors = $$(".nav__link", links);

    // sticky styling
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // mobile toggle
    const setMenu = (open) => {
      links.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    anchors.forEach(a => a.addEventListener("click", () => setMenu(false)));

    // active link via section observation
    const sections = anchors
      .map(a => $(a.getAttribute("href")))
      .filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = "#" + en.target.id;
          anchors.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ============================ SCROLL REVEAL ===================== */
  function initReveal() {
    const items = $$(".reveal");
    if (reduceMotion) { items.forEach(i => i.classList.add("is-visible")); return; }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(i => io.observe(i));
  }

  /* ============================ COUNTERS ========================== */
  function initCounters() {
    const nums = $$(".stat__num");
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        const el = en.target;
        const target = +el.dataset.count;
        if (reduceMotion) { el.textContent = target; return; }
        let cur = 0;
        const step = Math.max(1, target / 45);
        const run = () => {
          cur += step;
          if (cur >= target) { el.textContent = target; return; }
          el.textContent = Math.floor(cur);
          requestAnimationFrame(run);
        };
        run();
      });
    }, { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
  }

  /* ============================ SKILL BARS ======================== */
  function initSkills() {
    const skills = $$(".skill");
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    skills.forEach(s => io.observe(s));
  }

  /* ============================ BACK TO TOP ======================= */
  function initToTop() {
    const btn = $("#toTop");
    window.addEventListener("scroll", () => {
      btn.classList.toggle("is-show", window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }


  /* ============================ TESTIMONIAL MARQUEE ============== */
  // JS-driven so it always scrolls (ignores prefers-reduced-motion, which the
  // user explicitly wants here) and loops seamlessly using the duplicated set.
  function initMarquee() {
    const marquee = $("#testiMarquee");
    const track   = marquee && $(".testi__track", marquee);
    if (!track || track.children.length < 2) return;

    const half = track.children.length / 2;          // first card of the 2nd set
    let setWidth = track.children[half].offsetLeft;   // exact width of one full set
    let x = 0;
    const speed = 0.5;                                // px per frame (~30px/s @60fps)
    let paused = false;

    marquee.addEventListener("mouseenter", () => { paused = true; });
    marquee.addEventListener("mouseleave", () => { paused = false; });
    window.addEventListener("resize", () => { setWidth = track.children[half].offsetLeft; });

    function frame() {
      if (!paused && setWidth) {
        x -= speed;
        if (-x >= setWidth) x += setWidth;            // wrap before the seam shows
        track.style.transform = "translate3d(" + x + "px,0,0)";
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================ VIDEO FALLBACK ==================== */
  // hide the placeholder once a real video source is available
  function initVideo() {
    const video    = $("#fpsDemo");
    const fallback = $("#videoFallback");
    if (!video || !fallback) return;
    video.addEventListener("loadeddata", () => { fallback.style.display = "none"; });
    // if the source 404s, keep the friendly placeholder visible
    video.addEventListener("error", () => { fallback.style.display = "flex"; });
    // clicking the placeholder attempts to load/play
    fallback.addEventListener("click", () => { video.load(); video.play().catch(() => {}); });
  }

  /* ============================ INIT ============================== */
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initParticles();
    initGlyphs();
    initMouseGlow();
    initNav();
    initReveal();
    initCounters();
    initSkills();
    initToTop();
    initMarquee();
    initVideo();

    // safety: if loader's timing is ever interrupted, still kick typing on load
    window.addEventListener("load", () => setTimeout(startTyping, 1600));
  });
})();
