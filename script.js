// ===================================
// INITIALIZATION
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  // Loading Screen
  const loadingScreen = document.querySelector('.loading-screen');
  
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800);
  }, 2500);

  // Canvas Setup
  const threadCanvas = document.getElementById("threadCanvas");
  const particleCanvas = document.getElementById("particleCanvas");
  const threadCtx = threadCanvas.getContext("2d");
  const particleCtx = particleCanvas.getContext("2d");

  let width, height;
  let time = 0;

  // ===================================
  // CONFIGURATION
  // ===================================
  const config = {
    // Thread settings
    threads: [
      { color: "rgba(255, 214, 232, 0.4)", width: 2, amplitude: 50, frequency: 0.002, speed: 0.02, offset: 0 },
      { color: "rgba(201, 160, 220, 0.3)", width: 1.5, amplitude: 35, frequency: 0.0025, speed: 0.015, offset: 20 },
      { color: "rgba(137, 207, 240, 0.25)", width: 1.2, amplitude: 40, frequency: 0.0018, speed: 0.025, offset: -15 }
    ],
    
    // Particle settings
    particles: [],
    stardust: [],
    maxParticles: 80,
    maxStardust: 120
  };

  // ===================================
  // RESIZE HANDLER
  // ===================================
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    threadCanvas.width = width;
    threadCanvas.height = height;
    particleCanvas.width = width;
    particleCanvas.height = height;
    
    initParticles();
  }

  window.addEventListener("resize", resize);

  // ===================================
  // PARTICLE CLASS - FIREFLIES
  // ===================================
  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.baseSize = this.size;
      this.speedY = Math.random() * 0.3 - 0.15;
      this.speedX = Math.random() * 0.3 - 0.15;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.baseOpacity = this.opacity;
      this.hue = Math.random() * 60 + 300; // Pink to blue hues
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around screen
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Pulsing effect
      this.pulsePhase += this.pulseSpeed;
      const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
      this.opacity = this.baseOpacity * pulse;
      this.size = this.baseSize * (0.8 + pulse * 0.4);
    }

    draw() {
      const gradient = particleCtx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 70%, 80%, ${this.opacity})`);
      gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 70%, ${this.opacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);

      particleCtx.fillStyle = gradient;
      particleCtx.beginPath();
      particleCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      particleCtx.fill();
    }
  }

  // ===================================
  // STARDUST CLASS - TINY TWINKLING STARS
  // ===================================
  class Stardust {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1 + 0.3;
      this.opacity = Math.random() * 0.8;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.twinklePhase += this.twinkleSpeed;
      this.opacity = Math.abs(Math.sin(this.twinklePhase)) * 0.8;
    }

    draw() {
      particleCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      particleCtx.beginPath();
      particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      particleCtx.fill();
    }
  }

  // ===================================
  // INITIALIZE PARTICLES
  // ===================================
  function initParticles() {
    config.particles = [];
    config.stardust = [];
    
    // Create fireflies
    for (let i = 0; i < config.maxParticles; i++) {
      config.particles.push(new Particle());
    }
    
    // Create stardust
    for (let i = 0; i < config.maxStardust; i++) {
      config.stardust.push(new Stardust());
    }
  }

  // ===================================
  // THREAD ANIMATION
  // ===================================
  function drawThreads() {
    config.threads.forEach(thread => {
      threadCtx.beginPath();
      
      for (let x = 0; x <= width; x += 3) {
        // Complex wave formula with multiple harmonics
        const y = height / 2 + thread.offset
          + Math.sin(x * thread.frequency + time * thread.speed) * thread.amplitude 
          + Math.sin(x * thread.frequency * 2 + time * thread.speed * 1.5) * (thread.amplitude / 3)
          + Math.sin(x * thread.frequency * 0.5 + time * thread.speed * 0.7) * (thread.amplitude / 4);
        
        if (x === 0) {
          threadCtx.moveTo(x, y);
        } else {
          threadCtx.lineTo(x, y);
        }
      }

      threadCtx.strokeStyle = thread.color;
      threadCtx.lineWidth = thread.width;
      threadCtx.shadowBlur = 15;
      threadCtx.shadowColor = thread.color;
      threadCtx.stroke();
    });
    
    threadCtx.shadowBlur = 0;
  }

  // ===================================
  // ANIMATION LOOP
  // ===================================
  function animate() {
    // Clear canvases
    threadCtx.clearRect(0, 0, width, height);
    particleCtx.clearRect(0, 0, width, height);

    // Update time
    time += 1;

    // Draw and update stardust
    config.stardust.forEach(star => {
      star.update();
      star.draw();
    });

    // Draw and update fireflies
    config.particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw threads
    drawThreads();

    requestAnimationFrame(animate);
  }

  // ===================================
  // INTERSECTION OBSERVER - TEXT REVEAL
  // ===================================
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px"
  });

  reveals.forEach(el => observer.observe(el));

  // ===================================
  // INTERACTIVE HEART
  // ===================================
  const interactiveHeart = document.getElementById('interactiveHeart');
  const finalReveal = document.getElementById('finalReveal');
  
  interactiveHeart.addEventListener('click', () => {
    interactiveHeart.classList.add('clicked');
    
    // Create heart explosion particles
    createHeartExplosion(
      interactiveHeart.offsetLeft + interactiveHeart.offsetWidth / 2,
      interactiveHeart.offsetTop + interactiveHeart.offsetHeight / 2
    );
    
    setTimeout(() => {
      interactiveHeart.style.opacity = '0';
      interactiveHeart.style.pointerEvents = 'none';
      
      setTimeout(() => {
        finalReveal.classList.add('show');
      }, 300);
    }, 600);
  });

  // ===================================
  // HEART EXPLOSION EFFECT
  // ===================================
  function createHeartExplosion(x, y) {
    const container = document.body;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = Math.random() * 10 + 5 + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = `hsl(${Math.random() * 60 + 300}, 80%, 70%)`;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 200 + 100;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      container.appendChild(particle);
      
      let posX = x;
      let posY = y;
      let opacity = 1;
      let scale = 1;
      
      const animateParticle = () => {
        posX += vx * 0.016;
        posY += vy * 0.016;
        opacity -= 0.02;
        scale -= 0.02;
        
        particle.style.left = posX + 'px';
        particle.style.top = posY + 'px';
        particle.style.opacity = opacity;
        particle.style.transform = `scale(${scale})`;
        
        if (opacity > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          particle.remove();
        }
      };
      
      animateParticle();
    }
  }

  // ===================================
  // MUSIC TOGGLE (OPTIONAL)
  // ===================================
  const musicToggle = document.getElementById('musicToggle');
  let isPlaying = false;
  
  // You can add background music here if desired
  // const bgMusic = new Audio('path-to-your-music.mp3');
  // bgMusic.loop = true;
  
  musicToggle.addEventListener('click', () => {
    isPlaying = !isPlaying;
    musicToggle.classList.toggle('playing', isPlaying);
    
    // Uncomment if you add music
    // if (isPlaying) {
    //   bgMusic.play();
    // } else {
    //   bgMusic.pause();
    // }
    
    // Visual feedback
    musicToggle.style.transform = isPlaying ? 'scale(1.1)' : 'scale(1)';
    setTimeout(() => {
      musicToggle.style.transform = 'scale(1)';
    }, 200);
  });

  // ===================================
  // SMOOTH SCROLL
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ===================================
  // MOUSE TRAIL EFFECT (OPTIONAL)
  // ===================================
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Create subtle sparkle on mouse move
    if (Math.random() > 0.95) {
      createSparkle(mouseX, mouseY);
    }
  });

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'fixed';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    sparkle.style.background = 'rgba(255, 255, 255, 0.8)';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
    
    document.body.appendChild(sparkle);
    
    let opacity = 1;
    let scale = 1;
    
    const fade = () => {
      opacity -= 0.05;
      scale += 0.1;
      sparkle.style.opacity = opacity;
      sparkle.style.transform = `scale(${scale})`;
      
      if (opacity > 0) {
        requestAnimationFrame(fade);
      } else {
        sparkle.remove();
      }
    };
    
    fade();
  }

  // ===================================
  // PARALLAX SCROLL EFFECT
  // ===================================
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.text-wrapper');
    
    parallaxElements.forEach((el, index) => {
      const speed = 0.05 * (index + 1);
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });

  // ===================================
  // START EVERYTHING
  // ===================================
  resize();
  animate();
  
  console.log('✨ The Thread Between Us - Created with love ✨');
});
