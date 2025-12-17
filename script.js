/* ================== CONFIGURATION ================== */
const CONFIG = {
    startDate: new Date('2023-01-01'),
    secrets: [
        { img: 'assets/secret1.jpg', text: "My Happy Place 🏠" },
        { img: 'assets/secret2.jpg', text: "Best Day Ever ❤️" },
        { img: 'assets/secret3.jpg', text: "Your Beautiful Smile ✨" }
    ],
    affirmations: [
        "You are the poem I never knew how to write.",
        "In a sea of people, my eyes will always search for you.",
        "Loving you is my favorite thing to do.",
        "You are my today and all of my tomorrows.",
        "Every love song reminds me of you.",
        "You make my heart smile in ways I never knew possible."
    ],
    letters: [
        {
            title: "Why I Love You 💝",
            content: "My dearest Sara, where do I even begin? Your laugh lights up my darkest days. Your smile is my favorite view. The way you care about everything and everyone around you shows me what true beauty is. You're not just my love, you're my best friend, my adventure partner, and my home. Every moment with you feels like a dream I never want to wake up from. I love you more than words can express."
        },
        {
            title: "Your Magic 🌟",
            content: "There's something magical about you that I can't quite explain. Maybe it's the way your eyes sparkle when you talk about things you love. Or how you make ordinary moments feel extraordinary. You have this incredible ability to turn my worst days into beautiful memories. Your presence is like sunshine - warming, bright, and absolutely essential to my happiness."
        },
        {
            title: "Beautiful Soul 🌸",
            content: "Sara, your beauty goes so much deeper than what the eyes can see. Your kindness, your strength, your gentle heart - these are the things that made me fall in love with you. You see the good in people, you spread joy wherever you go, and you make the world a better place just by being in it. I'm so grateful to know someone as genuinely beautiful as you."
        },
        {
            title: "Our Forever 💫",
            content: "When I think about the future, I see you in every chapter. I see us laughing together, growing together, building a life full of love and adventure. You're not just my present, you're my forever. Thank you for choosing me, for loving me, for being you. Here's to all our tomorrows, my love. I can't wait to create a lifetime of memories with you."
        }
    ],
    fortunes: [
        "A surprise date night is in your near future! 💑",
        "You will receive an unexpected compliment today! 🌟",
        "A beautiful memory will be made this week! 📸",
        "Love and laughter surround you always! 😊",
        "Your smile will brighten someone's day! ✨",
        "A sweet surprise awaits you soon! 🎁",
        "Today is perfect for making wishes come true! 🌠",
        "Your kindness will be rewarded! 💖"
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
    initPuzzle();
    initFortuneWheel();
};

/* ================== NAVIGATION ================== */
function navigate(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('.dock-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.onclick.toString().includes(viewId)) btn.classList.add('active');
    });

    if(viewId === 'scratch') {
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

/* ================== SCRATCH GAME ================== */
let scratchCtx, scratchCanvas;
let isScratching = false;

function initScratchGame() {
    scratchCanvas = document.getElementById('scratchCanvas');
    scratchCtx = scratchCanvas.getContext('2d');
    
    const secret = CONFIG.secrets[Math.floor(Math.random() * CONFIG.secrets.length)];
    document.getElementById('secretImage').src = secret.img;
    document.querySelector('.secret-overlay-text').innerText = secret.text;
    
    resetScratchCanvasSize();
    
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
    const rect = scratchCanvas.parentElement.getBoundingClientRect();
    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;
    
    scratchCtx.fillStyle = '#C0C0C0';
    scratchCtx.fillRect(0,0,scratchCanvas.width, scratchCanvas.height);
    
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
    
    const rect = canvas.parentElement.getBoundingClientRect();
    jarW = canvas.width = rect.width;
    jarH = canvas.height = rect.height;
    
    const wishData = {};
    try {
        const saved = wishData['wishes'] || [];
        saved.forEach(txt => spawnWish(txt, true));
    } catch(e) {}
    
    animateJar();
}

function spawnWish(text, isInit = false) {
    wishes.push({
        x: Math.random() * (jarW - 40) + 20,
        y: isInit ? Math.random() * jarH : jarH + 20,
        r: Math.random() * 4 + 2,
        speed: Math.random() * 0.4 + 0.1,
        text: text,
        color: `hsl(${Math.random()*50 + 40}, 100%, 75%)`
    });
}

function addWishParticle() {
    const input = document.getElementById('wishInput');
    if(input.value.trim()) {
        spawnWish(input.value);
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
        if(p.y < -10) p.y = jarH + 10;
    });
    requestAnimationFrame(animateJar);
}

/* ================== JOURNAL ================== */
function initJournal() {
    const date = new Date();
    document.getElementById('currentDate').innerText = date.toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric' 
    });
    
    document.getElementById('journalEntry').addEventListener('input', (e) => {
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

/* ================== LOVE LETTERS ================== */
function openLetter(index) {
    const letter = CONFIG.letters[index];
    document.getElementById('letterTitle').innerText = letter.title;
    document.getElementById('letterBody').innerHTML = `<p>${letter.content}</p>`;
    document.getElementById('letterModal').classList.add('active');
}

function closeLetter(event) {
    if(!event || event.target.id === 'letterModal') {
        document.getElementById('letterModal').classList.remove('active');
    }
}

/* ================== MEMORY PUZZLE ================== */
let puzzleCards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;

function initPuzzle() {
    const symbols = ['❤️', '💕', '💖', '💗', '💝', '💘', '💞', '💓'];
    puzzleCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    renderPuzzle();
}

function renderPuzzle() {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    puzzleCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'puzzle-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.onclick = () => flipCard(index);
        grid.appendChild(card);
    });
    document.getElementById('moves').innerText = moves;
    document.getElementById('matches').innerText = matches;
}

function flipCard(index) {
    const card = document.querySelector(`[data-index="${index}"]`);
    if(card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) return;
    
    card.innerText = card.dataset.symbol;
    card.classList.add('flipped');
    flippedCards.push({index, symbol: card.dataset.symbol, element: card});
    
    if(flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').innerText = moves;
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if(card1.symbol === card2.symbol) {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matches++;
        document.getElementById('matches').innerText = matches;
        if(matches === 8) {
            setTimeout(() => alert(`🎉 You won in ${moves} moves!`), 300);
        }
    } else {
        card1.element.innerText = '';
        card2.element.innerText = '';
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }
    flippedCards = [];
}

function resetPuzzle() {
    moves = 0;
    matches = 0;
    flippedCards = [];
    initPuzzle();
}

/* ================== LOVE CALCULATOR ================== */
function calculateLove() {
    const percentEl = document.getElementById('lovePercent');
    const messageEl = document.getElementById('loveMessage');
    
    let current = 0;
    const target = 100;
    const interval = setInterval(() => {
        current += 2;
        percentEl.innerText = current + '%';
        if(current >= target) {
            clearInterval(interval);
            const messages = [
                "Perfect match! You two are meant to be! 💕",
                "100% Pure Love! Nothing can break this bond! ❤️",
                "Soulmates detected! Your love is infinite! ✨",
                "True Love Alert! You complete each other! 💖"
            ];
            messageEl.innerText = messages[Math.floor(Math.random() * messages.length)];
        }
    }, 20);
}

/* ================== FORTUNE WHEEL ================== */
let wheelRotation = 0;
let isSpinning = false;

function initFortuneWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const segments = CONFIG.fortunes.length;
    const anglePerSegment = (2 * Math.PI) / segments;
    
    const colors = ['#ff4b6e', '#a855f7', '#ffd700', '#3b82f6', '#ff6b88', '#c084fc', '#ffa500', '#60a5fa'];
    
    for(let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.moveTo(140, 140);
        ctx.arc(140, 140, 140, i * anglePerSegment, (i + 1) * anglePerSegment);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();
        
        ctx.save();
        ctx.translate(140, 140);
        ctx.rotate(i * anglePerSegment + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Lato';
        ctx.fillText('🎁', 90, 5);
        ctx.restore();
    }
}

function spinWheel() {
    if(isSpinning) return;
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('fortuneText').innerText = 'Spinning...';
    
    const extraSpins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const totalRotation = (360 * extraSpins) + randomAngle;
    wheelRotation += totalRotation;
    
    const wheel = document.getElementById('fortuneWheel');
    wheel.style.transform = `rotate(${wheelRotation}deg)`;
    
    setTimeout(() => {
        const normalizedAngle = wheelRotation % 360;
        const segmentAngle = 360 / CONFIG.fortunes.length;
        const selectedIndex = Math.floor((360 - normalizedAngle) / segmentAngle) % CONFIG.fortunes.length;
        
        document.getElementById('fortuneText').innerText = CONFIG.fortunes[selectedIndex];
        isSpinning = false;
        document.getElementById('spinBtn').disabled = false;
    }, 3000);
}

/* ================== BACKGROUND ================== */
function startBackgroundAnimation() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = Array(80).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5,
        sp: Math.random() * 0.4 + 0.1,
        color: `rgba(255, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 0.3)`
    }));
    
    function loop() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
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
