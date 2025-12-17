/* ================== CONFIGURATION ================== */
const CONFIG = {
    startDate: new Date('2023-01-01'), // UPDATE WITH YOUR ACTUAL ANNIVERSARY
    secrets: [
        { img: 'assets/secret1.jpg', text: "My Happy Place 🏠" },
        { img: 'assets/secret2.jpg', text: "Best Day Ever ❤️" },
        { img: 'assets/secret3.jpg', text: "Your Beautiful Smile ✨" }
    ],
    milestones: [
        { date: "Jan 1, 2023", text: "When my universe found its center. ❤️" },
        { date: "Feb 14, 2023", text: "Our first quiet sunset together. 🌅" },
        { date: "Today", text: "Every second with you is a gift I cherish." }
    ],
    memoryIcons: ['🌸', '💖', '💍', '🪐', '🌙', '🦋'],
    affirmations: [
        "You are the poem I never knew how to write.",
        "In a sea of people, my eyes search for you.",
        "Loving you is my favorite thing to do."
    ]
};

/* ================== INITIALIZATION ================== */
window.onload = () => {
    initConstellations();
    initGarden();
    initTimeline();
    initMemoryGame();
    initScratchGame();
    initGalaxyJar();
    initJournal();
    updateDays();
    typeAffirmation();
};

/* ================== CONSTELLATION ART ================== */
function initConstellations() {
    const canvas = document.getElementById('artCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let stars = Array(100).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
            ctx.fill();
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
            if (s.y < 0 || s.y > canvas.height) s.vy *= -1;

            stars.forEach(s2 => {
                let d = Math.hypot(s.x - s2.x, s.y - s2.y);
                if (d < 110) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - d / 110})`;
                    ctx.lineWidth = 0.2;
                    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
                }
            });
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ================== ZEN GARDEN ================== */
function initGarden() {
    const canvas = document.getElementById('gardenCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = 340; canvas.height = 500;

    canvas.addEventListener('click', (e) => {
        const x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width);
        const y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height);
        drawFlower(ctx, x, y);
    });

    function drawFlower(ctx, x, y) {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
            ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 75%, 0.6)`;
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 20, (i * (360 / petals)) * Math.PI / 180, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
}

/* ================== MEMORY GAME ================== */
function initMemoryGame() {
    const grid = document.getElementById('memoryGrid');
    const deck = [...CONFIG.memoryIcons, ...CONFIG.memoryIcons].sort(() => Math.random() - 0.5);
    grid.innerHTML = '';
    deck.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div class="card-front">?</div><div class="card-back">${icon}</div>`;
        card.onclick = () => card.classList.toggle('flipped');
        grid.appendChild(card);
    });
}

/* ================== NAVIGATION ================== */
function navigate(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.dock-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(viewId)) btn.classList.add('active');
    });
    if (viewId === 'arcade') setTimeout(resetScratchCanvasSize, 100);
}

/* ================== TIMELINE ================== */
function initTimeline() {
    const list = document.getElementById('timelineList');
    list.innerHTML = '';
    CONFIG.milestones.forEach(m => {
        list.innerHTML += `
            <div class="timeline-point">
                <div class="timeline-date">${m.date}</div>
                <div class="timeline-text">${m.text}</div>
            </div>`;
    });
}

/* ================== SCRATCH GAME ================== */
let scratchCtx, scratchCanvas, isScratching = false;

function initScratchGame() {
    scratchCanvas = document.getElementById('scratchCanvas');
    scratchCtx = scratchCanvas.getContext('2d');
    const secret = CONFIG.secrets[Math.floor(Math.random() * CONFIG.secrets.length)];
    document.getElementById('secretImage').src = secret.img;
    document.querySelector('.secret-overlay-text').innerText = secret.text;
    resetScratchCanvasSize();
    
    const scratch = (e) => {
        if (!isScratching) return;
        const rect = scratchCanvas.getBoundingClientRect();
        const x = (e.pageX || e.touches[0].pageX) - rect.left;
        const y = (e.pageY || e.touches[0].pageY) - rect.top;
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.beginPath(); scratchCtx.arc(x, y, 30, 0, Math.PI * 2); scratchCtx.fill();
    };
    scratchCanvas.addEventListener('mousedown', () => isScratching = true);
    scratchCanvas.addEventListener('touchstart', () => isScratching = true);
    window.addEventListener('mouseup', () => isScratching = false);
    window.addEventListener('touchend', () => isScratching = false);
    scratchCanvas.addEventListener('mousemove', scratch);
    scratchCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e); });
}

function resetScratchCanvasSize() {
    const rect = scratchCanvas.parentElement.getBoundingClientRect();
    scratchCanvas.width = rect.width; scratchCanvas.height = rect.height;
    scratchCtx.fillStyle = '#C0C0C0'; scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCtx.fillStyle = '#555'; scratchCtx.font = 'bold 20px Lato'; scratchCtx.textAlign = 'center';
    scratchCtx.fillText("Rub to Reveal ✨", scratchCanvas.width / 2, scratchCanvas.height / 2);
}

function resetScratchGame() { initScratchGame(); }

/* ================== GALAXY JAR ================== */
let jarCtx, jarW, jarH, wishes = [];

function initGalaxyJar() {
    const canvas = document.getElementById('jarCanvas');
    jarCtx = canvas.getContext('2d');
    jarW = canvas.width = canvas.parentElement.clientWidth;
    jarH = canvas.height = canvas.parentElement.clientHeight;
    const saved = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
    saved.forEach(t => spawnWish(t, true));
    animateJar();
}

function spawnWish(text, isInit = false) {
    wishes.push({
        x: Math.random() * jarW, y: isInit ? Math.random() * jarH : jarH + 20,
        r: Math.random() * 3 + 2, speed: Math.random() * 0.5 + 0.1,
        color: `hsl(${Math.random() * 50 + 330}, 100%, 75%)`
    });
}

function addWishParticle() {
    const input = document.getElementById('wishInput');
    if (input.value.trim()) {
        spawnWish(input.value);
        let saved = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
        saved.push(input.value); localStorage.setItem('saraa_wishes', JSON.stringify(saved));
        input.value = '';
    }
}

function animateJar() {
    jarCtx.clearRect(0, 0, jarW, jarH);
    wishes.forEach(p => {
        jarCtx.fillStyle = p.color; jarCtx.beginPath(); jarCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); jarCtx.fill();
        p.y -= p.speed; if (p.y < -10) p.y = jarH + 10;
    });
    requestAnimationFrame(animateJar);
}

/* ================== UTILITIES ================== */
function updateDays() {
    const diff = new Date() - CONFIG.startDate;
    document.getElementById('daysCount').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
}

function typeAffirmation() {
    const text = CONFIG.affirmations[Math.floor(Math.random() * CONFIG.affirmations.length)];
    const el = document.getElementById('typingText');
    let i = 0; el.innerText = "";
    function type() { if (i < text.length) { el.innerText += text.charAt(i++); setTimeout(type, 80); } }
    type();
}

function initJournal() {
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const saved = localStorage.getItem('saraa_journal');
    if (saved) document.getElementById('journalEntry').value = saved;
    document.getElementById('journalEntry').addEventListener('input', (e) => {
        localStorage.setItem('saraa_journal', e.target.value);
        document.getElementById('saveStatus').innerText = "Synced to Heart ❤️";
    });
}

function downloadJournal() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([document.getElementById('journalEntry').value], { type: "text/plain" }));
    a.download = "OurDiary.txt"; a.click();
}
