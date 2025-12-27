document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("threadCanvas");

  // 🚨 SAFETY CHECK
  if (!canvas) {
    console.error("Canvas with id 'threadCanvas' not found.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("2D context not supported.");
    return;
  }

  let w, h, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // SOUL POINTS
  const a = { x: w * 0.3, y: h * 0.4, vx: 0.25, vy: 0.18 };
  const b = { x: w * 0.7, y: h * 0.6, vx: -0.22, vy: -0.16 };

  function updatePoint(p) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 80 || p.x > w - 80) p.vx *= -1;
    if (p.y < 80 || p.y > h - 80) p.vy *= -1;
  }

  function drawThread() {
    ctx.clearRect(0, 0, w, h);

    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2 - 50;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(midX, midY, b.x, b.y);

    ctx.strokeStyle = "rgba(200,190,120,0.6)";
    ctx.lineWidth = 1.3;
    ctx.shadowBlur = 16;
    ctx.shadowColor = "rgba(200,190,120,0.6)";
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  function animate() {
    updatePoint(a);
    updatePoint(b);
    drawThread();
    requestAnimationFrame(animate);
  }

  animate();
});
