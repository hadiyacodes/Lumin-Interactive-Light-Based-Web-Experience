const canvas = document.getElementById('lumenCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 100;
let stars = [];
const starCount = 150;
let mouse = { x: null, y: null };
let mode = 'pulse';

document.getElementById('mode').addEventListener('change', (e) => {
  mode = e.target.value;
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
  initParticles();
});

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ---------- STARFIELD ------------
class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.opacity = Math.random();
    this.size = Math.random() * 1.5;
    this.fade = 0.005 + Math.random() * 0.01;
  }

  update() {
    this.opacity += this.fade;
    if (this.opacity > 1 || this.opacity < 0) {
      this.fade = -this.fade;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initStars() {
  stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
}

// ---------- PARTICLES ------------
class Particle {
  constructor(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
  }

  update() {
    if (mode === 'pulse') {
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
    } else if (mode === 'orbit' && mouse.x && mouse.y) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const force = 0.03 * Math.min(100, dist);
      this.vx -= Math.cos(angle) * force;
      this.vy -= Math.sin(angle) * force;
    } else if (mode === 'wave') {
      this.vy += Math.sin(this.x * 0.01) * 0.05;
    }

    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(
      new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        2
      )
    );
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / 150})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stars first
  for (let star of stars) {
    star.update();
    star.draw();
  }

  // Draw light particles
  ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    p.update();
    p.draw();
  }

  drawConnections();
  requestAnimationFrame(animate);
}

// -------- INIT EVERYTHING --------
initStars();
initParticles();
animate();

// Sound toggle logic
const bgAudio = document.getElementById("bgAudio");
const soundToggle = document.getElementById("soundToggle");

// Autoplay workaround – wait for user interaction
window.addEventListener("click", () => {
  if (bgAudio.paused) {
    bgAudio.play();
  }
}, { once: true });

soundToggle.addEventListener("click", () => {
  if (bgAudio.paused) {
    bgAudio.play();
    soundToggle.textContent = "🔊";
  } else {
    bgAudio.pause();
    soundToggle.textContent = "🔇";
  }
});
