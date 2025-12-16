/* ============================================
   GLOBAL STATE & INIT
   ============================================ */
const app = {
  currentPage: 1,
  theme: localStorage.getItem('theme') || 'dark',
  audio: null,
  playlist: [
    { title: "Perfect - Ed Sheeran", file: "assets/music1.mp3" }, 
    { title: "A Thousand Years", file: "assets/music2.mp3" },
    { title: "All of Me", file: "assets/music3.mp3" }
  ],
  currentSongIdx: 0,
  isPlaying: false
};

// Anniversary Date (YYYY, MM-1, DD) -> Month is 0-indexed
const START_DATE = new Date(2024, 0, 1); 

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCountdown();
  showPage(1);
  loadNotes();
  loadWishes();
  loadMood();
  initAudio();
  
  // Responsive Canvas Resize Listener
  window.addEventListener('resize', () => {
    // Debounce resize to prevent lag
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      initJigsaw(3); 
      resetMaze();
    }, 200);
  });
});

/* ============================================
   NAVIGATION & THEME
   ============================================ */
function showPage(id) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  
  // Show target
  document.getElementById(`page${id}`).classList.add('active');
  document.querySelectorAll('.nav-item')[id-1].classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Initialize games only when visible to fix canvas sizing issues
  if(id === 2) {
    setTimeout(() => {
      initMemory();
      initJigsaw(3);
      resetMaze();
    }, 100);
  }
  if(id === 3) loadGallery();
}

function initTheme() {
  if (app.theme === 'light') document.body.classList.add('light-mode');
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  app.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  localStorage.setItem('theme', app.theme);
}

function showWeatherLove() {
  alert("Forecast: 100% chance of love showers with scattered hugs! 🌧️❤️");
}

/* ============================================
   COUNTDOWN
   ============================================ */
function initCountdown() {
  const update = () => {
    const now = new Date();
    const diff = now - START_DATE;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('countdownBadge').innerHTML = `💕 ${days} Days of Us 💕`;
  };
  update();
  setInterval(update, 1000 * 60 * 60); // Update hourly
}

/* ============================================
   GAME: MEMORY MATCH
   ============================================ */
let memState = { cards: [], flipped: [], solved: 0, moves: 0, locked: false };

function initMemory() {
  const emojis = ['❤️', '🌹', '🦋', '💍', '🍕', '🐱', '🌙', '🎵'];
  const deck = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
  
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  memState = { cards: deck, flipped: [], solved: 0, moves: 0, locked: false };
  updateMemStats();

  deck.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.idx = i;
    card.innerHTML = `<div class="content">${emoji}</div>`; // Hidden by CSS until flipped
    card.onclick = () => flipCard(card, emoji, i);
    grid.appendChild(card);
  });
}

function flipCard(card, emoji, idx) {
  if (memState.locked || card.classList.contains('flipped') || memState.flipped.includes(idx)) return;
  
  card.classList.add('flipped');
  memState.flipped.push({ idx, emoji, element: card });

  if (memState.flipped.length === 2) {
    memState.moves++;
    updateMemStats();
    checkMatch();
  }
}

function checkMatch() {
  memState.locked = true;
  const [c1, c2] = memState.flipped;
  
  if (c1.emoji === c2.emoji) {
    memState.solved++;
    memState.flipped = [];
    memState.locked = false;
    updateMemStats();
    if (memState.solved === 8) showOverlay("Perfect Match! 💑", "Just like us, these pairs belong together.");
  } else {
    setTimeout(() => {
      c1.element.classList.remove('flipped');
      c2.element.classList.remove('flipped');
      memState.flipped = [];
      memState.locked = false;
    }, 1000);
  }
}

function updateMemStats() {
  document.getElementById('memoryMoves').innerText = memState.moves;
  document.getElementById('memoryMatches').innerText = memState.solved;
}

/* ============================================
   GAME: MAZE (Responsive)
   ============================================ */
let mazeCtx, player, goal, mazeGrid, cellSize;

function resetMaze() {
  const canvas = document.getElementById('mazeCanvas');
  const container = canvas.parentElement;
  // Dynamic sizing
  const size = Math.min(container.clientWidth - 20, 350);
  canvas.width = size;
  canvas.height = size;
  
  mazeCtx = canvas.getContext('2d');
  const cols = 15; // Must be odd
  cellSize = size / cols;
  
  mazeGrid = generateMazeGrid(cols);
  player = { x: 1, y: 1 };
  goal = { x: cols-2, y: cols-2 };
  
  drawMaze();
}

function generateMazeGrid(size) {
  // Simple DFS maze generation
  let map = Array(size).fill().map(() => Array(size).fill(1));
  let stack = [[1, 1]];
  map[1][1] = 0;
  
  while (stack.length) {
    let [cx, cy] = stack[stack.length - 1];
    let dirs = [[0,-2], [0,2], [-2,0], [2,0]].sort(() => Math.random() - 0.5);
    let moved = false;
    
    for (let [dx, dy] of dirs) {
      let nx = cx + dx, ny = cy + dy;
      if (nx > 0 && ny > 0 && nx < size-1 && ny < size-1 && map[ny][nx] === 1) {
        map[ny][nx] = 0;
        map[cy + dy/2][cx + dx/2] = 0;
        stack.push([nx, ny]);
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }
  return map;
}

function drawMaze() {
  // Clear
  mazeCtx.fillStyle = app.theme === 'light' ? '#eee' : '#111';
  mazeCtx.fillRect(0, 0, mazeCtx.canvas.width, mazeCtx.canvas.height);
  
  // Walls
  mazeCtx.fillStyle = app.theme === 'light' ? '#333' : '#eee';
  for(let y=0; y<mazeGrid.length; y++) {
    for(let x=0; x<mazeGrid.length; x++) {
      if(mazeGrid[y][x]) mazeCtx.fillRect(x*cellSize, y*cellSize, cellSize+1, cellSize+1);
    }
  }
  
  // Player
  mazeCtx.fillStyle = '#ff4b6e';
  mazeCtx.beginPath();
  mazeCtx.arc((player.x+0.5)*cellSize, (player.y+0.5)*cellSize, cellSize/2.5, 0, Math.PI*2);
  mazeCtx.fill();
  
  // Goal
  mazeCtx.font = `${cellSize}px Arial`;
  mazeCtx.fillText('❤️', goal.x*cellSize, (goal.y+0.8)*cellSize);
}

function moveMaze(dx, dy) {
  let nx = player.x + dx;
  let ny = player.y + dy;
  if (mazeGrid[ny] && mazeGrid[ny][nx] === 0) {
    player.x = nx;
    player.y = ny;
    drawMaze();
    if(player.x === goal.x && player.y === goal.y) showOverlay("You Found My Heart! ❤️", "It was always waiting for you.");
  }
}

// Bind D-Pad
document.getElementById('upBtn').onclick = () => moveMaze(0, -1);
document.getElementById('downBtn').onclick = () => moveMaze(0, 1);
document.getElementById('leftBtn').onclick = () => moveMaze(-1, 0);
document.getElementById('rightBtn').onclick = () => moveMaze(1, 0);

/* ============================================
   GAME: JIGSAW (Placeholder Logic)
   ============================================ */
function initJigsaw(level) {
    // A simplified placeholder for Jigsaw - proper Jigsaw logic 
    // is very complex for a single file. 
    // Using a simple "Unscramble" visual for now.
    const canvas = document.getElementById('jigsawCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(0,0,300,300);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Lato';
    ctx.textAlign = 'center';
    ctx.fillText("Select difficulty to start", 150, 150);
}

/* ============================================
   GALLERY
   ============================================ */
function loadGallery() {
  const gallery = document.getElementById('gallery');
  if(gallery.innerHTML.trim() !== "") return; // Don't reload if exists

  // Use placeholder images for demo - replace with local assets
  const images = [
    {src: 'https://source.unsplash.com/random/400x500/?couple,love', cap: 'Us'},
    {src: 'https://source.unsplash.com/random/400x400/?romance', cap: 'Date Night'},
    {src: 'https://source.unsplash.com/random/400x600/?hug', cap: 'Warmth'},
    {src: 'https://source.unsplash.com/random/400x300/?kiss', cap: 'First Kiss'},
    {src: 'https://source.unsplash.com/random/400x550/?sunset,couple', cap: 'Forever'}
  ];
  
  gallery.innerHTML = images.map(img => `
    <div class="gallery-item" onclick="openModal('${img.src}', '${img.cap}')">
      <img src="${img.src}" loading="lazy" alt="Love Memory">
    </div>
  `).join('');
}

function openModal(src, cap) {
  const modal = document.getElementById('imageModal');
  document.getElementById('modalImg').src = src;
  document.getElementById('modalCaption').innerText = cap;
  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('imageModal').classList.remove('show');
}

/* ============================================
   MUSIC PLAYER
   ============================================ */
function initAudio() {
  app.audio = document.getElementById('audioPlayer');
  app.audio.onended = nextSong;
  loadSong(0);
}

function loadSong(idx) {
  app.currentSongIdx = idx;
  const song = app.playlist[idx];
  document.getElementById('currentSong').innerText = song.title;
  app.audio.src = song.file;
}

function togglePlay() {
  if (app.isPlaying) {
    app.audio.pause();
    document.getElementById('recordDisk').classList.remove('spinning');
    document.getElementById('playBtn').innerText = '▶️';
  } else {
    // Attempt to play - browsers may block if no interaction
    app.audio.play().catch(e => alert("Please add music files to assets/ folder!"));
    document.getElementById('recordDisk').classList.add('spinning');
    document.getElementById('playBtn').innerText = '⏸️';
  }
  app.isPlaying = !app.isPlaying;
}

function nextSong() {
  let next = (app.currentSongIdx + 1) % app.playlist.length;
  loadSong(next);
  if(app.isPlaying) app.audio.play();
}

function prevSong() {
  let prev = (app.currentSongIdx - 1 + app.playlist.length) % app.playlist.length;
  loadSong(prev);
  if(app.isPlaying) app.audio.play();
}

/* ============================================
   NOTES & WISHES (LocalStorage)
   ============================================ */
function saveNote() {
  const text = document.getElementById('notepad').value;
  localStorage.setItem('saraa_note', text);
  showOverlay("Saved 💾", "Your words are safe in my digital heart.");
}

function loadNotes() {
  const saved = localStorage.getItem('saraa_note');
  if(saved) document.getElementById('notepad').value = saved;
}

function addWish() {
  const input = document.getElementById('wishInput');
  const txt = input.value.trim();
  if(!txt) return;
  
  let wishes = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
  wishes.push(txt);
  localStorage.setItem('saraa_wishes', JSON.stringify(wishes));
  input.value = '';
  loadWishes();
}

function loadWishes() {
  let wishes = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
  const list = document.getElementById('wishList');
  list.innerHTML = wishes.map((w, i) => `
    <li class="wish-item">✨ ${w} <span onclick="deleteWish(${i})" style="float:right;cursor:pointer">×</span></li>
  `).join('');
}

function deleteWish(i) {
  let wishes = JSON.parse(localStorage.getItem('saraa_wishes') || '[]');
  wishes.splice(i, 1);
  localStorage.setItem('saraa_wishes', JSON.stringify(wishes));
  loadWishes();
}

/* ============================================
   QUIZ & MOOD
   ============================================ */
const quizData = [
    { q: "Where was our first date?", opts: ["Cafe", "Park", "Movies", "Beach"], a: 0 },
    { q: "What is my favorite color on you?", opts: ["Red", "Blue", "Black", "White"], a: 2 },
    // Add more questions here
];
let quizIdx = 0;

function renderQuiz() {
    // Simplified quiz renderer
    const container = document.getElementById('quizContainer');
    if(quizIdx >= quizData.length) {
        container.innerHTML = "<h3>You know everything! ❤️</h3>";
        return;
    }
    const q = quizData[quizIdx];
    container.innerHTML = `
        <h4>${q.q}</h4>
        <div class="quiz-opts">
            ${q.opts.map((o, i) => `<button class="btn btn-sm" onclick="checkAnswer(${i}, ${q.a})">${o}</button>`).join('')}
        </div>
    `;
}
// Initialize Quiz
renderQuiz();

function checkAnswer(selected, correct) {
    if(selected === correct) {
        alert("Correct! 😍");
        quizIdx++;
        renderQuiz();
    } else {
        alert("Try again sweetie! 😅");
    }
}

function setMood(emoji) {
    localStorage.setItem('saraa_mood', emoji);
    loadMood();
}

function loadMood() {
    const m = localStorage.getItem('saraa_mood');
    if(m) document.getElementById('moodText').innerText = `Current Mood: ${m}`;
}

/* ============================================
   UTILS
   ============================================ */
function showOverlay(title, text) {
  document.getElementById('overlayTitle').innerText = title;
  document.getElementById('overlayText').innerText = text;
  document.getElementById('overlay').classList.add('show');
}
function closeOverlay() {
  document.getElementById('overlay').classList.remove('show');
}
function downloadNote() {
    const text = document.getElementById('notepad').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'LoveLetter.txt';
    a.click();
}
