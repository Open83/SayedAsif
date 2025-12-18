const CONFIG = {
    startDate: new Date('2023-01-01'),
    secrets: ["My Happy Place 🏠", "Best Day Ever ❤️", "Your Beautiful Smile ✨", "Forever & Always 💕"],
    affirmations: ["You are the poem I never knew how to write.", "In a sea of people, my eyes will always search for you.", "Loving you is my favorite thing to do.", "You are my today and all of my tomorrows.", "Every love song reminds me of you.", "You make my heart smile in ways I never knew possible."],
    letters: [{
        title: "Why I Love You 💝",
        content: "My dearest Sara, where do I even begin? Your laugh lights up my darkest days. Your smile is my favorite view. The way you care about everything and everyone around you shows me what true beauty is. You're not just my love, you're my best friend, my adventure partner, and my home. Every moment with you feels like a dream I never want to wake up from. I love you more than words can express."
    }, {
        title: "Your Magic 🌟",
        content: "There's something magical about you that I can't quite explain. Maybe it's the way your eyes sparkle when you talk about things you love. Or how you make ordinary moments feel extraordinary. You have this incredible ability to turn my worst days into beautiful memories. Your presence is like sunshine - warming, bright, and absolutely essential to my happiness."
    }, {
        title: "Beautiful Soul 🌸",
        content: "Sara, your beauty goes so much deeper than what the eyes can see. Your kindness, your strength, your gentle heart - these are the things that made me fall in love with you. You see the good in people, you spread joy wherever you go, and you make the world a better place just by being in it. I'm so grateful to know someone as genuinely beautiful as you."
    }, {
        title: "Our Forever 💫",
        content: "When I think about the future, I see you in every chapter. I see us laughing together, growing together, building a life full of love and adventure. You're not just my present, you're my forever. Thank you for choosing me, for loving me, for being you. Here's to all our tomorrows, my love. I can't wait to create a lifetime of memories with you."
    }],
    fortunes: ["A surprise date night is in your near future! 🍝", "You will receive an unexpected compliment today! 🌟", "A beautiful memory will be made this week! 📸", "Love and laughter surround you always! 😊", "Your smile will brighten someone's day! ✨", "A sweet surprise awaits you soon! 🎁", "Today is perfect for making wishes come true! 🌠", "Your kindness will be rewarded! 💖"],
    trivia: [{
        q: "What makes our relationship special?",
        opts: ["Everything about it ❤️", "The adventures we share 🌍", "How we laugh together 😄", "All of the above 💯"],
        correct: 3
    }, {
        q: "What's the best thing about Sara?",
        opts: ["Her amazing smile 😊", "Her kind heart 💕", "Her beautiful soul ✨", "Everything! 🌟"],
        correct: 3
    }, {
        q: "How much do I love you?",
        opts: ["A lot 💗", "More than words can say 💝", "To the moon and back 🌙", "Infinity times infinity ♾️"],
        correct: 3
    }, {
        q: "What's our favorite thing to do together?",
        opts: ["Making memories 📸", "Laughing until it hurts 😂", "Being silly together 🤪", "All of these! 💖"],
        correct: 3
    }]
};
let wishes = [],
    puzzleCards = [],
    flippedCards = [],
    moves = 0,
    matches = 0,
    wheelRot = 0,
    isSpinning = !1,
    triviaIndex = 0,
    triviaScore = 0,
    snakeDir = 'right',
    snakeBody = [],
    snakeFood = {},
    snakeGame = null;

function nav(v) {
    document.querySelectorAll('.view').forEach(e => e.classList.remove('active'));
    document.getElementById(v).classList.add('active');
    document.querySelectorAll('.dock-item').forEach(b => {
        b.classList.remove('active');
        if (b.onclick.toString().includes(v)) b.classList.add('active')
    });
    if (v === 'scratch') setTimeout(() => initScratch(), 100);
    if (v === 'snake' && !snakeGame) initSnake()
}

function updateDays() {
    const d = Math.floor((new Date() - CONFIG.startDate) / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').innerText = d
}

function typeAffirmation() {
    const t = CONFIG.affirmations[Math.floor(Math.random() * CONFIG.affirmations.length)];
    const e = document.getElementById('typingText');
    e.innerText = '';
    let i = 0;

    function type() {
        if (i < t.length) {
            e.innerText += t.charAt(i);
            i++;
            setTimeout(type, 80)
        }
    }
    type()
}
let scratchCtx, scratchCanvas, isScratching = !1;

function initScratch() {
    scratchCanvas = document.getElementById('scratchCanvas');
    scratchCtx = scratchCanvas.getContext('2d');
    const r = scratchCanvas.parentElement.getBoundingClientRect();
    scratchCanvas.width = r.width;
    scratchCanvas.height = r.height;
    scratchCtx.fillStyle = '#C0C0C0';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCtx.fillStyle = '#555';
    scratchCtx.font = 'bold 20px Lato';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText("Rub to Reveal ✨", scratchCanvas.width / 2, scratchCanvas.height / 2);
    const start = () => isScratching = !0;
    const end = () => isScratching = !1;
    const move = (e) => {
        if (!isScratching) return;
        e.preventDefault();
        const rect = scratchCanvas.getBoundingClientRect();
        const x = (e.pageX || e.touches[0].pageX) - rect.left - window.scrollX;
        const y = (e.pageY || e.touches[0].pageY) - rect.top - window.scrollY;
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.beginPath();
        scratchCtx.arc(x, y, 30, 0, Math.PI * 2);
        scratchCtx.fill()
    };
    scratchCanvas.addEventListener('mousedown', start);
    scratchCanvas.addEventListener('touchstart', start);
    scratchCanvas.addEventListener('mouseup', end);
    scratchCanvas.addEventListener('touchend', end);
    scratchCanvas.addEventListener('mousemove', move);
    scratchCanvas.addEventListener('touchmove', move)
}

function resetScratch() {
    document.getElementById('secretText').innerText = CONFIG.secrets[Math.floor(Math.random() * CONFIG.secrets.length)];
    initScratch()
}
let jarCtx, jarW, jarH;

function initJar() {
    const c = document.getElementById('jarCanvas');
    jarCtx = c.getContext('2d');
    const r = c.parentElement.getBoundingClientRect();
    jarW = c.width = r.width;
    jarH = c.height = r.height;
    animateJar()
}

function spawnWish(txt, isInit = !1) {
    wishes.push({
        x: Math.random() * (jarW - 40) + 20,
        y: isInit ? Math.random() * jarH : jarH + 20,
        r: Math.random() * 4 + 2,
        speed: Math.random() * .4 + .1,
        text: txt,
        color: `hsl(${Math.random()*50+40},100%,75%)`
    })
}

function addWish() {
    const i = document.getElementById('wishInput');
    if (i.value.trim()) {
        spawnWish(i.value);
        i.value = ''
    }
}

function animateJar() {
    jarCtx.clearRect(0, 0, jarW, jarH);
    wishes.forEach(p => {
        jarCtx.shadowBlur = 10;
        jarCtx.shadowColor = p.color;
        jarCtx.fillStyle = p.color;
        jarCtx.beginPath();
        jarCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        jarCtx.fill();
        jarCtx.shadowBlur = 0;
        p.y -= p.speed;
        if (p.y < -10) p.y = jarH + 10
    });
    requestAnimationFrame(animateJar)
}

function initJournal() {
    const d = new Date();
    document.getElementById('currentDate').innerText = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
}

function openLetter(i) {
    const l = CONFIG.letters[i];
    document.getElementById('letterTitle').innerText = l.title;
    document.getElementById('letterBody').innerHTML = `<p>${l.content}</p>`;
    document.getElementById('letterModal').classList.add('active')
}

function closeLetter(e) {
    if (!e || e.target.id === 'letterModal') {
        document.getElementById('letterModal').classList.remove('active')
    }
}

function initPuzzle() {
    const s = ['❤️', '💕', '💖', '💗', '💝', '💘', '💞', '💓'];
    puzzleCards = [...s, ...s].sort(() => Math.random() - .5);
    renderPuzzle()
}

function renderPuzzle() {
    const g = document.getElementById('puzzleGrid');
    g.innerHTML = '';
    puzzleCards.forEach((s, i) => {
        const c = document.createElement('div');
        c.className = 'puzzle-card';
        c.dataset.index = i;
        c.dataset.symbol = s;
        c.onclick = () => flipCard(i);
        g.appendChild(c)
    });
    document.getElementById('moves').innerText = moves;
    document.getElementById('matches').innerText = matches
}

function flipCard(i) {
    const c = document.querySelector(`[data-index="${i}"]`);
    if (c.classList.contains('flipped') || c.classList.contains('matched') || flippedCards.length >= 2) return;
    c.innerText = c.dataset.symbol;
    c.classList.add('flipped');
    flippedCards.push({
        index: i,
        symbol: c.dataset.symbol,
        element: c
    });
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').innerText = moves;
        setTimeout(checkMatch, 800)
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;
    if (c1.symbol === c2.symbol) {
        c1.element.classList.add('matched');
        c2.element.classList.add('matched');
        matches++;
        document.getElementById('matches').innerText = matches;
        if (matches === 8) {
            setTimeout(() => alert(`🎉 You won in ${moves} moves!`), 300)
        }
    } else {
        c1.element.innerText = '';
        c2.element.innerText = '';
        c1.element.classList.remove('flipped');
        c2.element.classList.remove('flipped')
    }
    flippedCards = []
}

function resetPuzzle() {
    moves = 0;
    matches = 0;
    flippedCards = [];
    initPuzzle()
}

function calculateLove() {
    const p = document.getElementById('lovePercent');
    const m = document.getElementById('loveMessage');
    let c = 0;
    const t = 100;
    const int = setInterval(() => {
        c += 2;
        p.innerText = c + '%';
        if (c >= t) {
            clearInterval(int);
            const msgs = ["Perfect match! You two are meant to be! 💕", "100% Pure Love! Nothing can break this bond! ❤️", "Soulmates detected! Your love is infinite! ✨", "True Love Alert! You complete each other! 💖"];
            m.innerText = msgs[Math.floor(Math.random() * msgs.length)]
        }
    }, 20)
}

function initWheel() {
    const c = document.getElementById('wheelCanvas');
    const ctx = c.getContext('2d');
    const seg = CONFIG.fortunes.length;
    const ang = 2 * Math.PI / seg;
    const cols = ['#ff4b6e', '#a855f7', '#ffd700', '#3b82f6', '#ff6b88', '#c084fc', '#ffa500', '#60a5fa'];
    for (let i = 0; i < seg; i++) {
        ctx.beginPath();
        ctx.moveTo(140, 140);
        ctx.arc(140, 140, 140, i * ang, (i + 1) * ang);
        ctx.fillStyle = cols[i % cols.length];
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.translate(140, 140);
        ctx.rotate(i * ang + ang / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Lato';
        ctx.fillText('🎁', 90, 5);
        ctx.restore()
    }
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = !0;
    document.getElementById('spinBtn').disabled = !0;
    document.getElementById('fortuneText').innerText = 'Spinning...';
    const extra = 5 + Math.random() * 3;
    const rand = Math.random() * 360;
    const total = 360 * extra + rand;
    wheelRot += total;
    const w = document.getElementById('fortuneWheel');
    w.style.transform = `rotate(${wheelRot}deg)`;
    setTimeout(() => {
        const norm = wheelRot % 360;
        const segAng = 360 / CONFIG.fortunes.length;
        const selIdx = Math.floor((360 - norm) / segAng) % CONFIG.fortunes.length;
        document.getElementById('fortuneText').innerText = CONFIG.fortunes[selIdx];
        isSpinning = !1;
        document.getElementById('spinBtn').disabled = !1
    }, 3000)
}

function loadTrivia() {
    const t = CONFIG.trivia[triviaIndex];
    document.getElementById('triviaQuestion').innerText = t.q;
    const o = document.getElementById('triviaOptions');
    o.innerHTML = '';
    t.opts.forEach((opt, i) => {
        const d = document.createElement('div');
        d.className = 'trivia-option';
        d.innerText = opt;
        d.onclick = () => answerTrivia(i, d);
        o.appendChild(d)
    })
}

function answerTrivia(sel, el) {
    const t = CONFIG.trivia[triviaIndex];
    const opts = document.querySelectorAll('.trivia-option');
    opts.forEach(o => o.style.pointerEvents = 'none');
    if (sel === t.correct) {
        el.classList.add('correct');
        triviaScore++
    } else {
        el.classList.add('wrong');
        opts[t.correct].classList.add('correct')
    }
    document.getElementById('triviaScore').innerText = `Score: ${triviaScore}/${triviaIndex+1}`
}

function nextTrivia() {
    triviaIndex = (triviaIndex + 1) % CONFIG.trivia.length;
    loadTrivia()
}

function initSnake() {
    const c = document.getElementById('snakeCanvas');
    const ctx = c.getContext('2d');
    const rect = c.parentElement.getBoundingClientRect();
    c.width = c.height = rect.width;
    const sz = 20;
    const w = Math.floor(c.width / sz);
    const h = Math.floor(c.height / sz);
    snakeBody = [{
        x: 5,
        y: 5
    }];
    snakeDir = 'right';
    snakeFood = {
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * h)
    };
    document.getElementById('snakeScore').innerText = '0';
    if (snakeGame) clearInterval(snakeGame);
    snakeGame = setInterval(() => {
        const head = { ...snakeBody[0]
        };
        if (snakeDir === 'up') head.y--;
        if (snakeDir === 'down') head.y++;
        if (snakeDir === 'left') head.x--;
        if (snakeDir === 'right') head.x++;
        if (head.x < 0 || head.x >= w || head.y < 0 || head.y >= h || snakeBody.some(s => s.x === head.x && s.y === head.y)) {
            clearInterval(snakeGame);
            snakeGame = null;
            alert('Game Over! Score: ' + document.getElementById('snakeScore').innerText);
            return
        }
        snakeBody.unshift(head);
        if (head.x === snakeFood.x && head.y === snakeFood.y) {
            document.getElementById('snakeScore').innerText = snakeBody.length - 1;
            snakeFood = {
                x: Math.floor(Math.random() * w),
                y: Math.floor(Math.random() * h)
            }
        } else {
            snakeBody.pop()
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#ff4b6e';
        snakeBody.forEach(s => {
            ctx.fillRect(s.x * sz, s.y * sz, sz - 2, sz - 2)
        });
        ctx.fillStyle = '#ffd700';
        ctx.fillText('❤️', snakeFood.x * sz, snakeFood.y * sz + 15)
    }, 150)
}

function changeDir(d) {
    if (d === 'up' && snakeDir !== 'down') snakeDir = 'up';
    if (d === 'down' && snakeDir !== 'up') snakeDir = 'down';
    if (d === 'left' && snakeDir !== 'right') snakeDir = 'left';
    if (d === 'right' && snakeDir !== 'left') snakeDir = 'right'
}

function resetSnake() {
    initSnake()
}

function selectMood(i) {
    document.querySelectorAll('.mood-item').forEach(m => m.classList.remove('selected'));
    document.querySelectorAll('.mood-item')[i].classList.add('selected')
}

function startBg() {
    const c = document.getElementById('bgCanvas');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const parts = Array(80).fill().map(() => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 2.5,
        sp: Math.random() * .4 + .1,
        color: `rgba(255,${Math.random()*100+100},${Math.random()*100+150},0.3)`
    }));

    function loop() {
        ctx.clearRect(0, 0, c.width, c.height);
        parts.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.y -= p.sp;
            if (p.y < 0) p.y = c.height
        });
        requestAnimationFrame(loop)
    }
    loop()
}
window.onload = () => {
    startBg();
    updateDays();
    typeAffirmation();
    initScratch();
    initJar();
    initJournal();
    initPuzzle();
    initWheel();
    loadTrivia()
};
