document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("threadCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  const a = { x: 200, y: 200, vx: 0.3, vy: 0.2 };
  const b = { x: 400, y: 300, vx: -0.25, vy: -0.15 };

  function update(p) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 50 || p.x > canvas.width - 50) p.vx *= -1;
    if (p.y < 50 || p.y > canvas.height - 50) p.vy *= -1;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(
      (a.x + b.x) / 2,
      (a.y + b.y) / 2 - 40,
      b.x,
      b.y
    );
    ctx.strokeStyle = "rgba(200,190,120,0.6)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  function animate() {
    update(a);
    update(b);
    draw();
    requestAnimationFrame(animate);
  }
  animate();

  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, { threshold: 0.3 });

  reveals.forEach(el => observer.observe(el));
});
