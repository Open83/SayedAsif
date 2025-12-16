/* ================== CONFIGURATION ================== */
const CONFIG = {
    startDate: new Date('2023-01-01'), // YOUR DATE HERE
    // DYNAMIC SECRETS: These will be used in the 9:16 scratch card
    // Use vertical images (9:16 ratio) for best results
    secrets: [
        { img: 'assets/secret1.jpg', text: "My Happy Place 🏠" },
        { img: 'assets/secret2.jpg', text: "Best Day Ever ❤️" },
        { img: 'assets/secret3.jpg', text: "Your Beautiful Smile ✨" }
    ],
    affirmations: [
        "You are the poem I never knew how to write.",
        "In a sea of people, my eyes will always search for you.",
        "Loving you is my favorite thing to do.",
        "You are my today and all of my tomorrows."
    ]
};

/* ================== INIT ================== */
window.onload = () => {
    startBackgroundAnimation();
    updateDays();
    typeAffirmation();
    initScratchGame();
    initGalaxyJar();
    initJournal();
};

/* ================== NAVIGATION ================== */
function navigate(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('.dock-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.onclick.toString().includes(viewId)) btn.classList.add('active');
    });

    // Re-init scratch canvas if navigating to arcade to fix sizing
    if(viewId === 'arcade') {
        setTimeout(resetScratchCanvasSize, 100);
    }
}

/* ================== HOME LOGIC ================== */
function updateDays() {
    const diff = new Date() - CONFIG.startDate;
    document.getElementById('daysCount').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
}

function typeAffirmation() {
    const text = CONFIG.affirmations[Math.floor(Math.random() * CONFIG.affirmations.length)];
    const el = document.getElementById('typingText');
    el.innerText = "";
    let i = 0;
    function type() {
        if(i < text.length) {
            el.innerText += text.charAt(i);
            i++;
            setTimeout(type, 80);
        }
    }
    type();
}

/* ================== MUSIC ================== */
let isMusicPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const status = document.getElementById('musicStatus');
    
    if(isMusicPlaying) {
        audio.pause();
        status.innerText = "Play Music";
        document.querySelector('.equalizer').style.opacity = '0.5';
    } else {
        audio.play().catch(e => alert("Interact with page first!"));
        status.innerText = "Playing...";
        document.querySelector('.equalizer').style.opacity = '1';
    }
    isMusicPlaying = !isMusicPlaying;
}

/* ================== SCRATCH GAME (Dynamic) ================== */
let scratchCtx, scratchCanvas;
let isScratching = false;

function initScratchGame() {
    scratchCanvas = document.getElementById('scratchCanvas');
    scratchCtx = scratchCanvas.getContext('2d');
    
    // Pick Random Secret
    const secret = CONFIG.secrets[Math.floor(Math.random() * CONFIG.secrets.length)];
    document.getElementById('secretImage').src = secret.img;
    document.querySelector('.secret-overlay-text').innerText = secret.text;
    
    resetScratchCanvasSize();
    
    // Events
    const start = () => isScratching = true;
    const end = () => isScratching = false;
    const move = (e) => {
        if(!isScratching) return;
        e.preventDefault();
        const rect = scratchCanvas.getBoundingClientRect();
        const x = (e.pageX || e.touches[0].pageX) - rect.left - window.scrollX;
        const y = (e.pageY || e.touches[0].pageY) - rect.top - window.scrollY;
        
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.beginPath();
        scratchCtx.arc(x, y, 30, 0, Math.PI*2);
        scratchCtx.fill();
    };
    
    scratchCanvas.addEventListener('mousedown', start);
    scratchCanvas.addEventListener('touchstart', start);
    scratchCanvas.addEventListener('mouseup', end);
    scratchCanvas.addEventListener('touchend', end);
    scratchCanvas.addEventListener('mousemove', move);
    scratchCanvas.addEventListener('touchmove', move);
}

function resetScratchCanvasSize() {
    // Sync canvas resolution with CSS display size (9:16)
    const rect = scratchCanvas.parentElement.getBoundingClientRect();
    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;
    
    // Draw Overlay Layer (Silver)
    scratchCtx.fillStyle = '#C0C0C0';
    scratchCtx.fillRect(0,0,scratchCanvas.width, scratchCanvas.height);
    
    // Draw Text
    scratchCtx.fillStyle = '#555';
    scratchCtx.font = 'bold 20px Lato';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText("Rub to Reveal ✨", scratchCanvas.width/2, scratchCanvas.height/2);
}

function resetScratchGame() {
    initScratchGame();
}

/* ================== GALAXY JAR ================== */
let jarCtx, jarW, jarH;
let wishes = [];

function initGalaxyJar() {
    const canvas = document.getElementById('jarCanvas');
    jarCtx = canvas.getContext('2d');
    
    // Sync size
    const rect = canvas.parentElement.getBoundingClientRect();
    jarW = canvas.width = rect.width;
    jarH = canvas.height = rect.height;
    
    // Load saved wishes
    const saved = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
    saved.forEach(txt => spawnWish(txt, true));
    
    animateJar();
}

function spawnWish(text, isInit = false) {
    wishes.push({
        x: Math.random() * (jarW - 40) + 20,
        y: isInit ? Math.random() * jarH : jarH + 20,
        r: Math.random() * 4 + 2,
        speed: Math.random() * 0.4 + 0.1,
        text: text,
        color: `hsl(${Math.random()*50 + 40}, 100%, 75%)` // Gold colors
    });
}

function addWishParticle() {
    const input = document.getElementById('wishInput');
    if(input.value.trim()) {
        spawnWish(input.value);
        let saved = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
        saved.push(input.value);
        localStorage.setItem('saraa_wishes', JSON.stringify(saved));
        input.value = '';
    }
}

function animateJar() {
    jarCtx.clearRect(0,0,jarW, jarH);
    wishes.forEach(p => {
        jarCtx.shadowBlur = 10;
        jarCtx.shadowColor = p.color;
        jarCtx.fillStyle = p.color;
        jarCtx.beginPath();
        jarCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        jarCtx.fill();
        jarCtx.shadowBlur = 0;
        p.y -= p.speed;
        if(p.y < -10) p.y = jarH + 10; // Loop
    });
    requestAnimationFrame(animateJar);
}

/* ================== JOURNAL ================== */
function initJournal() {
    const date = new Date();
    document.getElementById('currentDate').innerText = date.toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric' 
    });
    
    const saved = localStorage.getItem('saraa_journal');
    if(saved) document.getElementById('journalEntry').value = saved;
    
    document.getElementById('journalEntry').addEventListener('input', (e) => {
        localStorage.setItem('saraa_journal', e.target.value);
        const status = document.getElementById('saveStatus');
        status.innerText = "Saving...";
        status.style.color = "#ff4b6e";
        setTimeout(() => {
            status.innerText = "Synced to Heart ❤️";
            status.style.color = "#888";
        }, 1000);
    });
}

function downloadJournal() {
    const blob = new Blob([document.getElementById('journalEntry').value], {type: "text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "LoveDiary.txt";
    a.click();
}

/* ================== BACKGROUND ================== */
function startBackgroundAnimation() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = Array(60).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2,
        sp: Math.random() * 0.3
    }));
    
    function loop() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fill();
            p.y -= p.sp;
            if(p.y < 0) p.y = canvas.height;
        });
        requestAnimationFrame(loop);
    }
    loop();
}
