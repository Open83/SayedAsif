// ============================================
// GLOBAL STATE
// ============================================
let appState = {
  currentNote: '',
  wishes: [],
  quizAnswers: [],
  currentQuizQuestion: 0,
  songs: [
    '♫ Perfect - Ed Sheeran ♫',
    '♫ Thinking Out Loud ♫',
    '♫ All of Me - John Legend ♫',
    '♫ A Thousand Years ♫',
    '♫ Can\'t Help Falling in Love ♫'
  ],
  currentSongIndex: 0,
  isPlaying: false
};

// ============================================
// NAVIGATION
// ============================================
function showPage(n) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page' + n).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === n - 1);
  });
  window.scrollTo(0, 0);
}

// ============================================
// THEME TOGGLE
// ============================================
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const toggleBtn = document.querySelectorAll('.theme-toggle')[0];
  if (document.body.classList.contains('light-mode')) {
    toggleBtn.textContent = '☀️';
  } else {
    toggleBtn.textContent = '🌙';
  }
}

// ============================================
// WIN OVERLAY
// ============================================
function showWin(title, text) {
  document.getElementById('winTitle').textContent = title;
  document.getElementById('winText').textContent = text;
  document.getElementById('winOverlay').classList.add('show');
  createConfetti();
}

function closeWin() {
  document.getElementById('winOverlay').classList.remove('show');
}

function createConfetti() {
  const colors = ['#E8D4A8', '#6A1E32', '#F9F9F9', '#8A2E42'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, i * 30);
  }
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function updateCountdown() {
  // Set your anniversary date here (YYYY, MM-1, DD)
  const startDate = new Date(2024, 0, 1); // January 1, 2024
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  document.getElementById('countdownBadge').textContent = `💕 ${diffDays} Days Together 💕`;
}

// ============================================
// MEMORY GAME
// ============================================
let memoryState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0
};

function initMemory() {
  const emojis = ['❤️', '💕', '💖', '💗', '💝', '💘', '😍', '🥰'];
  const pairs = [...emojis, ...emojis];
  memoryState.cards = pairs.sort(() => Math.random() - 0.5);
  memoryState.flippedCards = [];
  memoryState.matchedPairs = 0;
  memoryState.moves = 0;
  
  updateMemoryStats();
  renderMemoryGrid();
}

function renderMemoryGrid() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = memoryState.cards.map((emoji, index) => 
    `<div class="memory-card" data-index="${index}" onclick="flipMemoryCard(${index})">${emoji}</div>`
  ).join('');
}

function flipMemoryCard(index) {
  if (memoryState.flippedCards.length >= 2) return;
  
  const card = document.querySelector(`[data-index="${index}"]`);
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  
  card.classList.add('flipped');
  memoryState.flippedCards.push(index);
  
  if (memoryState.flippedCards.length === 2) {
    memoryState.moves++;
    updateMemoryStats();
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  const [index1, index2] = memoryState.flippedCards;
  const card1 = document.querySelector(`[data-index="${index1}"]`);
  const card2 = document.querySelector(`[data-index="${index2}"]`);
  
  setTimeout(() => {
    if (memoryState.cards[index1] === memoryState.cards[index2]) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      memoryState.matchedPairs++;
      updateMemoryStats();
      
      if (memoryState.matchedPairs === 8) {
        setTimeout(() => showWin('Amazing! 🎉', 'Tumne sab match kar liye! Memory kamaal ki hai! ❤️'), 500);
      }
    } else {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
    }
    memoryState.flippedCards = [];
  }, 800);
}

function updateMemoryStats() {
  document.getElementById('memoryMoves').textContent = memoryState.moves;
  document.getElementById('memoryMatches').textContent = memoryState.matchedPairs;
}

// ============================================
// JIGSAW PUZZLE
// ============================================
let jigsawCanvas, jigsawCtx, jigsawPieces = [], jigsawGrid = 3;
let jigsawDragging = null, jigsawOffset = {x: 0, y: 0};
let jigsawImg = new Image();

jigsawImg.onload = () => initJigsaw(3);
jigsawImg.onerror = () => initJigsaw(3);
jigsawImg.src = 'assets/jigsaw.jpg';

function initJigsawCanvas() {
  jigsawCanvas = document.getElementById('jigsawCanvas');
  jigsawCtx = jigsawCanvas.getContext('2d');
  
  jigsawCanvas.addEventListener('mousedown', jigsawDown);
  jigsawCanvas.addEventListener('mousemove', jigsawMove);
  jigsawCanvas.addEventListener('mouseup', jigsawUp);
  jigsawCanvas.addEventListener('touchstart', e => jigsawDown(e.touches[0]));
  jigsawCanvas.addEventListener('touchmove', e => { e.preventDefault(); jigsawMove(e.touches[0]); });
  jigsawCanvas.addEventListener('touchend', jigsawUp);
}

function initJigsaw(n) {
  if (!jigsawCanvas) initJigsawCanvas();
  jigsawGrid = n;
  jigsawPieces = [];
  const size = jigsawCanvas.width / n;
  
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      jigsawPieces.push({
        sx: c * (jigsawImg.width / n),
        sy: r * (jigsawImg.height / n),
        sw: jigsawImg.width / n,
        sh: jigsawImg.height / n,
        x: Math.random() * (jigsawCanvas.width - size),
        y: Math.random() * (jigsawCanvas.height - size),
        w: size,
        h: size,
        correctX: c * size,
        correctY: r * size,
        placed: false
      });
    }
  }
  shuffleJigsaw();
}

function shuffleJigsaw() {
  jigsawPieces.forEach(p => {
    p.x = Math.random() * (jigsawCanvas.width - p.w);
    p.y = Math.random() * (jigsawCanvas.height - p.h);
    p.placed = false;
  });
  drawJigsaw();
}

function drawJigsaw() {
  jigsawCtx.clearRect(0, 0, jigsawCanvas.width, jigsawCanvas.height);
  jigsawCtx.fillStyle = '#f0f0f0';
  jigsawCtx.fillRect(0, 0, jigsawCanvas.width, jigsawCanvas.height);
  
  jigsawPieces.forEach(p => {
    if (jigsawImg.complete && jigsawImg.naturalWidth) {
      jigsawCtx.drawImage(jigsawImg, p.sx, p.sy, p.sw, p.sh, p.x, p.y, p.w, p.h);
    } else {
      jigsawCtx.fillStyle = p.placed ? '#90EE90' : '#FFB6C1';
      jigsawCtx.fillRect(p.x, p.y, p.w, p.h);
    }
    jigsawCtx.strokeStyle = '#333';
    jigsawCtx.strokeRect(p.x, p.y, p.w, p.h);
  });
}

function jigsawDown(e) {
  const rect = jigsawCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (jigsawCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (jigsawCanvas.height / rect.height);
  
  for (let i = jigsawPieces.length - 1; i >= 0; i--) {
    const p = jigsawPieces[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h && !p.placed) {
      jigsawDragging = p;
      jigsawOffset.x = x - p.x;
      jigsawOffset.y = y - p.y;
      jigsawPieces.splice(i, 1);
      jigsawPieces.push(p);
      break;
    }
  }
}

function jigsawMove(e) {
  if (!jigsawDragging) return;
  const rect = jigsawCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (jigsawCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (jigsawCanvas.height / rect.height);
  jigsawDragging.x = Math.max(0, Math.min(jigsawCanvas.width - jigsawDragging.w, x - jigsawOffset.x));
  jigsawDragging.y = Math.max(0, Math.min(jigsawCanvas.height - jigsawDragging.h, y - jigsawOffset.y));
  drawJigsaw();
}

function jigsawUp() {
  if (!jigsawDragging) return;
  const p = jigsawDragging;
  const dx = Math.abs(p.x - p.correctX);
  const dy = Math.abs(p.y - p.correctY);
  if (dx < 20 && dy < 20) {
    p.x = p.correctX;
    p.y = p.correctY;
    p.placed = true;
  }
  jigsawDragging = null;
  drawJigsaw();
  
  if (jigsawPieces.every(p => p.placed)) {
    setTimeout(() => showWin('Perfect! 🎉', 'Tumne puzzle solve kar diya — bahut khoob! ❤️'), 300);
  }
}

// ============================================
// MAZE GAME
// ============================================
let mazeCanvas, mazeCtx, mazeGrid = [], mazePlayer, mazeGoal;
const MAZE_SIZE = 21;

function initMaze() {
  mazeCanvas = document.getElementById('mazeCanvas');
  mazeCtx = mazeCanvas.getContext('2d');
  resetMaze();
  
  document.getElementById('upBtn').onclick = () => moveMaze(0, -1);
  document.getElementById('downBtn').onclick = () => moveMaze(0, 1);
  document.getElementById('leftBtn').onclick = () => moveMaze(-1, 0);
  document.getElementById('rightBtn').onclick = () => moveMaze(1, 0);
}

function resetMaze() {
  mazeGrid = generateMaze(MAZE_SIZE);
  mazePlayer = {x: 1, y: 1};
  mazeGoal = {x: MAZE_SIZE - 2, y: MAZE_SIZE - 2};
  drawMaze();
}

function generateMaze(size) {
  const grid = Array(size).fill().map(() => Array(size).fill(1));
  const stack = [[1, 1]];
  grid[1][1] = 0;
  
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const neighbors = [];
    
    [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
        neighbors.push([nx, ny, x + dx/2, y + dy/2]);
      }
    });
    
    if (neighbors.length) {
      const [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[ny][nx] = 0;
      grid[wy][wx] = 0;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }
  
  return grid;
}

function drawMaze() {
  const cellSize = mazeCanvas.width / MAZE_SIZE;
  mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      mazeCtx.fillStyle = mazeGrid[y][x] ? '#0A1A2F' : '#F9F9F9';
      mazeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
  
  mazeCtx.fillStyle = '#6A1E32';
  mazeCtx.beginPath();
  mazeCtx.arc((mazePlayer.x + 0.5) * cellSize, (mazePlayer.y + 0.5) * cellSize, cellSize * 0.4, 0, Math.PI * 2);
  mazeCtx.fill();
  
  mazeCtx.fillStyle = '#E8D4A8';
  mazeCtx.font = `${cellSize * 0.8}px serif`;
  mazeCtx.textAlign = 'center';
  mazeCtx.textBaseline = 'middle';
  mazeCtx.fillText('❤️', (mazeGoal.x + 0.5) * cellSize, (mazeGoal.y + 0.5) * cellSize);
}

function moveMaze(dx, dy) {
  const newX = mazePlayer.x + dx;
  const newY = mazePlayer.y + dy;
  
  if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && mazeGrid[newY][newX] === 0) {
    mazePlayer.x = newX;
    mazePlayer.y = newY;
    drawMaze();
    
    if (mazePlayer.x === mazeGoal.x && mazePlayer.y === mazeGoal.y) {
      setTimeout(() => showWin('Amazing! 🏆', 'Tumne maze solve kar diya — dil jeet liya! 💕'), 300);
    }
  }
}

// ============================================
// DOT CONNECT
// ============================================
let dotCanvas, dotCtx, dots = [], connectedDots = [];

function initDots() {
  dotCanvas = document.getElementById('dotCanvas');
  dotCtx = dotCanvas.getContext('2d');
  
  const heartShape = [
    [0.5, 0.2], [0.4, 0.15], [0.3, 0.15], [0.2, 0.25],
    [0.15, 0.35], [0.2, 0.5], [0.3, 0.65], [0.4, 0.8],
    [0.5, 0.9], [0.6, 0.8], [0.7, 0.65], [0.8, 0.5],
    [0.85, 0.35], [0.8, 0.25], [0.7, 0.15], [0.6, 0.15]
  ];
  
  dots = heartShape.map(([x, y]) => ({
    x: x * dotCanvas.width,
    y: y * dotCanvas.height
  }));
  
  dotCanvas.addEventListener('click', dotClick);
  dotCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = dotCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    dotClick({
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: dotCanvas
    });
  });
  
  drawDots();
}

function dotClick(e) {
  const rect = dotCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (dotCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (dotCanvas.height / rect.height);
  
  const clicked = dots.find((d, i) => {
    const dist = Math.sqrt((d.x - x) ** 2 + (d.y - y) ** 2);
    return dist < 20 && !connectedDots.includes(i);
  });
  
  if (clicked) {
    connectedDots.push(dots.indexOf(clicked));
    drawDots();
    
    if (connectedDots.length === dots.length) {
      setTimeout(() => showWin('Beautiful! 💖', 'Tumne dil bana diya — kitna pyaara! ❤️'), 300);
    }
  }
}

function drawDots() {
  dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
  dotCtx.fillStyle = '#f0f0f0';
  dotCtx.fillRect(0, 0, dotCanvas.width, dotCanvas.height);
  
  if (connectedDots.length > 1) {
    dotCtx.strokeStyle = '#6A1E32';
    dotCtx.lineWidth = 4;
    dotCtx.beginPath();
    dotCtx.moveTo(dots[connectedDots[0]].x, dots[connectedDots[0]].y);
    for (let i = 1; i < connectedDots.length; i++) {
      dotCtx.lineTo(dots[connectedDots[i]].x, dots[connectedDots[i]].y);
    }
    dotCtx.stroke();
  }
  
  dots.forEach((d, i) => {
    const connected = connectedDots.includes(i);
    dotCtx.fillStyle = connected ? '#6A1E32' : '#E8D4A8';
    dotCtx.beginPath();
    dotCtx.arc(d.x, d.y, 12, 0, Math.PI * 2);
    dotCtx.fill();
    
    dotCtx.fillStyle = connected ? '#F9F9F9' : '#0A1A2F';
    dotCtx.font = '12px sans-serif';
    dotCtx.textAlign = 'center';
    dotCtx.textBaseline = 'middle';
    dotCtx.fillText(i + 1, d.x, d.y);
  });
}

function undoDot() {
  connectedDots.pop();
  drawDots();
}

function resetDots() {
  connectedDots = [];
  drawDots();
}

// ============================================
// GALLERY
// ============================================
const galleryImages = [
  { src: 'assets/img1.jpg', caption: 'Forever Together 💕' },
  { src: 'assets/img2.jpg', caption: 'My Favorite Smile ❤️' },
  { src: 'assets/img3.jpg', caption: 'Beautiful Moments 🌸' },
  { src: 'assets/img4.jpg', caption: 'You & Me 💑' },
  { src: 'assets/img5.jpg', caption: 'Perfect Day 🌟' },
  { src: 'assets/img6.jpg', caption: 'Love Always 💝' }
];

function initGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = galleryImages.map((img, i) => `
    <div class="gallery-item" onclick="openImage('${img.src}')">
      <img src="${img.src}" alt="${img.caption}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%236A1E32\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%23E8D4A8\' font-size=\'20\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3E❤️%3C/text%3E%3C/svg%3E'">
      <div class="caption">${img.caption}</div>
    </div>
  `).join('');
}

function openImage(src) {
  document.getElementById('modalImage').src = src;
  document.getElementById('imageModal').classList.add('show');
}

function closeModal() {
  document.getElementById('imageModal').classList.remove('show');
}

// ============================================
// TIMELINE
// ============================================
const timelineData = [
  { date: 'The Beginning', text: 'The day we first met — duniya thodi slow ho gayi thi.' },
  { date: 'First Date', text: 'Wo pal jab tumne muskura ke kaha — yaad hai?' },
  { date: 'Falling Deeper', text: 'Har roz tumse pyaar badhta gaya.' },
  { date: 'Our Adventure', text: 'Choti choti safar, magar yaadein lambe waqt tak.' },
  { date: 'Forever Promise', text: 'Aaj aur hamesha — tumhara mera vaada.' }
];

function initTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = timelineData.map(item => `
    <div class="timeline-item">
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-text">${item.text}</div>
    </div>
  `).join('');
}

// ============================================
// MUSIC PLAYER
// ============================================
function togglePlay() {
  appState.isPlaying = !appState.isPlaying;
  const playBtn = document.getElementById('playBtn');
  playBtn.textContent = appState.isPlaying ? '⏸️' : '▶️';
}

function prevSong() {
  appState.currentSongIndex = (appState.currentSongIndex - 1 + appState.songs.length) % appState.songs.length;
  updateSongDisplay();
}

function nextSong() {
  appState.currentSongIndex = (appState.currentSongIndex + 1) % appState.songs.length;
  updateSongDisplay();
}

function updateSongDisplay() {
  document.getElementById('currentSong').textContent = appState.songs[appState.currentSongIndex];
}

// ============================================
// QUIZ
// ============================================
const quizQuestions = [
  {
    question: "What's your ideal date?",
    options: ['🌅 Sunset beach walk', '🍿 Movie night at home', '🍽️ Fancy dinner date', '🏕️ Adventure camping']
  },
  {
    question: "What makes you happiest?",
    options: ['💑 Quality time together', '🎁 Thoughtful surprises', '💬 Deep conversations', '😂 Making each other laugh']
  },
  {
    question: "Your love language is?",
    options: ['💝 Gifts', '🤗 Physical touch', '⏰ Quality time', '💬 Words of affirmation']
  }
];

function selectQuizOption(element, index) {
  document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  appState.quizAnswers[appState.currentQuizQuestion] = index;
}

function nextQuestion() {
  if (!appState.quizAnswers[appState.currentQuizQuestion] && appState.quizAnswers[appState.currentQuizQuestion] !== 0) {
    alert('Please select an option first! 💕');
    return;
  }
  
  appState.currentQuizQuestion++;
  
  if (appState.currentQuizQuestion >= quizQuestions.length) {
    showWin('Quiz Complete! 🎉', 'Tumhare answers se pata chalta hai kitna special ho! ❤️');
    appState.currentQuizQuestion = 0;
    appState.quizAnswers = [];
    renderQuiz();
  } else {
    renderQuiz();
  }
}

function renderQuiz() {
  const q = quizQuestions[appState.currentQuizQuestion];
  const container = document.getElementById('quizContainer');
  container.innerHTML = `
    <div class="quiz-question">${q.question}</div>
    ${q.options.map((opt, i) => `
      <div class="quiz-option" onclick="selectQuizOption(this, ${i})">${opt}</div>
    `).join('')}
  `;
}

// ============================================
// MOOD TRACKER
// ============================================
function selectMood(emoji) {
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
  
  const messages = {
    '😊': 'Khushi mil rahi hai tumhe! Keep smiling! ✨',
    '😍': 'Pyaar mein ho? Same here! 💕',
    '🥰': 'Aww, kitna cute mood hai! ❤️',
    '😘': 'Sending kisses back to you! 💋',
    '💕': 'Love is in the air! 🌸',
    '✨': 'Shining bright today! Keep glowing! 🌟'
  };
  
  const msgDiv = document.getElementById('moodMessage');
  msgDiv.textContent = messages[emoji];
  msgDiv.style.display = 'block';
}

// ============================================
// WISH JAR
// ============================================
function addWish() {
  const input = document.getElementById('wishInput');
  const wish = input.value.trim();
  
  if (wish) {
    appState.wishes.push(wish);
    input.value = '';
    renderWishes();
  }
}

function renderWishes() {
  const list = document.getElementById('wishList');
  list.innerHTML = appState.wishes.map((wish, index) => `
    <div class="wish-item">
      <span>${wish}</span>
      <button class="wish-delete" onclick="deleteWish(${index})">×</button>
    </div>
  `).join('');
}

function deleteWish(index) {
  appState.wishes.splice(index, 1);
  renderWishes();
}

// ============================================
// NOTEPAD
// ============================================
function saveNote() {
  const notepad = document.getElementById('notepad');
  appState.currentNote = notepad.value;
  alert('Note saved! 💾❤️');
}

function downloadNote() {
  const notepad = document.getElementById('notepad');
  const text = notepad.value || 'My love note for you... ❤️';
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Love_Note_for_Saraaa.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  initMemory();
  initJigsaw(3);
  initMaze();
  initDots();
  initGallery();
  initTimeline();
  renderQuiz();
  
  // Load saved note if exists
  const notepad = document.getElementById('notepad');
  if (appState.currentNote) {
    notepad.value = appState.currentNote;
  }
  
  // Update countdown every day
  setInterval(updateCountdown, 86400000);
});
