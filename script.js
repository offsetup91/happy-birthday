// Respect reduced motion
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Elements
const btnCelebrate = document.getElementById("btnCelebrate");
const countdownWrap = document.getElementById("countdownWrap");
const countNum = document.getElementById("countNum");
const countNumSmall = document.getElementById("countNumSmall");
const reveal = document.getElementById("reveal");
const bgMusic = document.getElementById("bgMusic");

// Fireworks setup (canvas)
const fwCanvas = document.querySelector("canvas.fireworks");
const ctx = fwCanvas.getContext("2d");
function sizeCanvas() {
  fwCanvas.width = innerWidth * devicePixelRatio;
  fwCanvas.height = innerHeight * devicePixelRatio;
}
sizeCanvas();
addEventListener("resize", sizeCanvas);

const rockets = [];
const sparks = [];
function launch(x = Math.random() * fwCanvas.width, y = fwCanvas.height) {
  if (prefersReduced) return;
  rockets.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: -(6 + Math.random() * 3) * devicePixelRatio,
    life: 60 + Math.random() * 20,
  });
}
function boom(x, y) {
  const count = 120;
  const spd = 2.5 * devicePixelRatio;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2,
      v = spd * (0.5 + Math.random());
    sparks.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 50 + Math.random() * 30,
      hue: 200 * Math.random() + 20,
    });
  }
}
function drawDot(x, y, color, r) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r * devicePixelRatio, 0, Math.PI * 2);
  ctx.fill();
}
function step() {
  ctx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  // rockets
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.12 * devicePixelRatio;
    r.life--;
    drawDot(r.x, r.y, "#fff", 4);
    if (r.life <= 0 || r.vy > 0) {
      rockets.splice(i, 1);
      boom(r.x, r.y);
    }
  }
  // sparks
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.06 * devicePixelRatio;
    s.life--;
    drawDot(s.x, s.y, `hsl(${s.hue} 100% 60%)`, 2);
    if (s.life <= 0) sparks.splice(i, 1);
  }
  requestAnimationFrame(step);
}
if (!prefersReduced) step();

// Confetti (DOM)
const confettiColors = ["var(--p1)", "var(--p2)", "var(--p3)", "var(--p4)", "var(--p5)"];
function confettiBurst(n = 140) {
  if (prefersReduced) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 8;
    p.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-10px;width:${size}px;height:${size}px;background:${confettiColors[i % confettiColors.length]};transform:rotate(${Math.random() * 360}deg);z-index:4;`;
    p.style.transition = `transform ${1.6 + Math.random() * 1.6}s cubic-bezier(.22,.61,.36,1), opacity .6s ease`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${(Math.random() * 2 - 1) * 120}px, calc(100vh + ${Math.random() * 120}px)) rotate(${360 + Math.random() * 360}deg)`;
    });
    setTimeout(() => { p.style.opacity = 0; }, 2100);
    setTimeout(() => p.remove(), 3000);
  }
}

// Balloons (emoji floaters)
const balloonChars = ["🎈", "🎉", "🎊", "🎁", "🌟", "✨", "🎀", "🍰", "🥳"];
function launchBalloons(count = 22) {
  if (prefersReduced) return;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement("div");
      b.className = "balloon";
      b.textContent = balloonChars[(Math.random() * balloonChars.length) | 0];
      b.style.left = Math.random() * 92 + "vw";
      const dur = 7 + Math.random() * 6;
      b.style.animationDuration = dur + "s";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), dur * 1000);
    }, i * 180);
  }
}

// Celebrate flow
async function startCelebration() {
  // Announce
  const live = document.querySelector("article[aria-live]");
  live.setAttribute("aria-label", "Celebration started. Countdown active.");

  // Start music (user gesture compliant)
  if (bgMusic) {
    bgMusic.currentTime = 0;
    try { await bgMusic.play(); } catch (_) {}
  }

  // Show countdown
  countdownWrap.classList.remove("hidden");
  countdownWrap.setAttribute("aria-hidden", "false");

  // Kick off some early effects for excitement
  confettiBurst(80);
  launchBalloons(10);
  for (let i = 0; i < 3; i++) setTimeout(() => launch(), i * 220);

  // Countdown 10 → 0
  let t = 10;
  countNum.textContent = t;
  countNumSmall.textContent = t;

  const timer = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(timer);
      // Hide countdown, reveal content
      countdownWrap.classList.add("hidden");
      countdownWrap.setAttribute("aria-hidden", "true");

      reveal.classList.remove("hidden");
      reveal.setAttribute("aria-hidden", "false");

      live.setAttribute("aria-label", "Countdown finished. Fireworks, confetti, balloons, and message revealed.");

      // Big celebration sequence
      confettiBurst(220);
      launchBalloons(24);
      // A short volley of fireworks
      let volley = 0;
      const fwTimer = setInterval(() => {
        launch();
        if ((volley++) > 18) clearInterval(fwTimer);
      }, 320);
      // Additional confetti waves
      for (let i = 1; i <= 4; i++) setTimeout(() => confettiBurst(160), 900 * i);
    } else {
      countNum.textContent = t;
      countNumSmall.textContent = t;
      // Subtle mini-burst each second
      if (t % 2 === 0) confettiBurst(30);
    }
  }, 1000);
}

// Bind
btnCelebrate.addEventListener("click", startCelebration);
