document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("threadCanvas");
  const ctx = canvas.getContext("2d");

  let width, height;
  let time = 0;

  // Configuration for the visuals
  const config = {
    threadColor: "rgba(200, 180, 140, 0.5)", // Gold/Champagne
    threadWidth: 1.5,
    amplitude: 40,    // How high the wave goes
    frequency: 0.002, // How many waves
    speed: 0.02,      // How fast it moves
    particles: []
  };

  // Resize handling with High DPI support
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  window.addEventListener("resize", resize);

  // PARTICLE SYSTEM (Fireflies)
  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around screen
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    config.particles = [];
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
      config.particles.push(new Particle());
    }
  }

  // THREAD ANIMATION
  function drawThread() {
    ctx.beginPath();
    
    // We draw the line across the width of the screen
    for (let x = 0; x <= width; x += 5) {
      // Complex wave formula: combines two sine waves for organic movement
      const y = height / 2 
        + Math.sin(x * config.frequency + time) * config.amplitude 
        + Math.sin(x * config.frequency * 2 + time * 1.5) * (config.amplitude / 2);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = config.threadColor;
    ctx.lineWidth = config.threadWidth;
    
    // Add a glow effect to the thread
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(200, 180, 140, 0.4)";
    
    ctx.stroke();
    
    // Reset shadow for particles
    ctx.shadowBlur = 0;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update time
    time += config.speed;

    // Draw Particles
    config.particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw Thread
    drawThread();

    requestAnimationFrame(animate);
  }

  // INTERSECTION OBSERVER (Text Reveal)
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.2, // Trigger when 20% visible
    rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
  });

  reveals.forEach(el => observer.observe(el));

  // Initialize
  resize();
  animate();
});
