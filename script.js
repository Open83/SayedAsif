/* ============ CONFIGURATION ============ */
const CONFIG = {
    startDate: new Date('2023-01-01'), // DATE: YYYY-MM-DD
    secretImage: 'assets/secret.jpg',  // For scratch card
    puzzleImage: 'assets/puzzle.jpg'   // For jigsaw
};

/* ============ INIT ============ */
window.onload = () => {
    updateCountdown();
    initScratchCard();
    initPuzzle();
    loadNotes();
    initStarJar();
};

/* ============ NAVIGATION ============ */
function navTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.dock-btn').forEach(b => {
        b.classList.remove('active');
        if(b.onclick.toString().includes(pageId)) b.classList.add('active');
    });

    if(pageId === 'quiz') startQuiz();
}

/* ============ HOME: Countdown ============ */
function updateCountdown() {
    const diff = new Date() - CONFIG.startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').innerText = days;
}

/* ============ MUSIC ============ */
let isPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const floater = document.querySelector('.music-floater');
    
    if(isPlaying) {
        audio.pause();
        floater.classList.remove('playing');
    } else {
        audio.play().catch(e => alert("Please add 'music.mp3' to assets folder!"));
        floater.classList.add('playing');
    }
    isPlaying = !isPlaying;
}

/* ============ GAME 1: SCRATCH CARD ============ */
function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.scratch-wrapper');
    
    // Set size
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    // Fill with gray overlay
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text "Scratch Me"
    ctx.fillStyle = '#333';
    ctx.font = '20px Montserrat';
    ctx.fillText("Scratch Me ❤️", canvas.width/2 - 60, canvas.height/2);

    let isDrawing = false;

    function scratch(e) {
        if(!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('touchstart', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch);
}

/* ============ GAME 2: SLIDING PUZZLE ============ */
function initPuzzle() {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';
    const tiles = [0,1,2,3,4,5,6,7,8]; // 8 is empty
    
    // Simple shuffle (that maintains solvability for demo, or just random swap)
    tiles.sort(() => Math.random() - 0.5);

    tiles.forEach((num, index) => {
        const div = document.createElement('div');
        div.className = 'puzzle-tile';
        if(num !== 8) {
            div.style.backgroundImage = `url('${CONFIG.puzzleImage}')`;
            // Calculate position in 3x3 grid (300px image assumed)
            const row = Math.floor(num / 3);
            const col = num % 3;
            div.style.backgroundPosition = `-${col*80}px -${row*80}px`; // 80px based on css
            div.innerText = ""; // Remove number for pure image
        } else {
            div.style.background = 'transparent';
            div.style.cursor = 'default';
        }
        div.onclick = () => alert("Keep trying! 🧩");
        board.appendChild(div);
    });
}

/* ============ QUIZ SYSTEM ============ */
const quizData = [
    { q: "Where was our first date?", options: ["Cafe", "Park", "Cinema", "Beach"], a: 0 },
    { q: "What is my favorite food?", options: ["Pizza", "Sushi", "Burgers", "Tacos"], a: 1 },
    { q: "What's our special date?", options: ["14th", "21st", "1st", "10th"], a: 2 }
];
let currentQ = 0;
let score = 0;

function startQuiz() {
    currentQ = 0;
    score = 0;
    document.getElementById('quizBox').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    loadQuestion();
}

function loadQuestion() {
    const q = quizData[currentQ];
    document.getElementById('questionText').innerText = q.q;
    document.getElementById('quizProgress').style.width = `${((currentQ)/quizData.length)*100}%`;
    
    const opts = document.getElementById('optionsBox');
    opts.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(idx, q.a);
        opts.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    if(selected === correct) score++;
    currentQ++;
    if(currentQ < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quizBox').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    document.getElementById('scoreText').innerText = `You got ${score} / ${quizData.length}`;
}

function restartQuiz() { startQuiz(); }

/* ============ STAR JAR (Wishes) ============ */
let stars = [];
let jarCanvas, jarCtx;

function initStarJar() {
    jarCanvas = document.getElementById('starJarCanvas');
    jarCtx = jarCanvas.getContext('2d');
    jarCanvas.width = jarCanvas.offsetWidth;
    jarCanvas.height = jarCanvas.offsetHeight;
    
    // Load existing stars
    const saved = JSON.parse(localStorage.getItem('saraa_stars') || '[]');
    saved.forEach(s => createStarObject(s));
    
    animateStars();
}

function createStarObject(text) {
    stars.push({
        x: Math.random() * jarCanvas.width,
        y: Math.random() * jarCanvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.2 + 0.1,
        text: text
    });
}

function addStarWish() {
    const input = document.getElementById('wishInput');
    const txt = input.value.trim();
    if(txt) {
        createStarObject(txt);
        // Save to storage
        const saved = JSON.parse(localStorage.getItem('saraa_stars') || '[]');
        saved.push(txt);
        localStorage.setItem('saraa_stars', JSON.stringify(saved));
        
        input.value = '';
        alert("Your wish is now a star! ✨");
    }
}

function animateStars() {
    jarCtx.clearRect(0, 0, jarCanvas.width, jarCanvas.height);
    jarCtx.fillStyle = '#ffe97d'; // Gold star color
    
    stars.forEach(star => {
        jarCtx.beginPath();
        jarCtx.arc(star.x, star.y, star.size, 0, Math.PI*2);
        jarCtx.fill();
        
        // Float animation
        star.y -= star.speed;
        if(star.y < 0) star.y = jarCanvas.height;
    });
    
    requestAnimationFrame(animateStars);
}

/* ============ NOTES ============ */
function saveNote() {
    const txt = document.getElementById('loveNote').value;
    localStorage.setItem('saraa_note', txt);
    alert("Saved forever ❤️");
}

function loadNotes() {
    const txt = localStorage.getItem('saraa_note');
    if(txt) document.getElementById('loveNote').value = txt;
}

function downloadNote() {
    const txt = document.getElementById('loveNote').value;
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'OurStory.txt';
    a.click();
}
