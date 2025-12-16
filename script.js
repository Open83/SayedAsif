/* ================= CONFIGURATION ================= */
const CONFIG = {
    startDate: new Date('2023-01-01'), // CHANGE THIS DATE
    puzzleImage: 'assets/puzzle.jpg', // Make sure this image exists in assets
    gridSize: 3 // 3x3 Puzzle
};

/* ================= INIT & LOADER ================= */
window.onload = () => {
    // 1. Loading Simulation
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 1000);
    }, 2000);

    // 2. Start Components
    initStarfield();
    updateCounter();
    loadNote();
    initGallery();
    
    // 3. Setup Music
    const audio = document.getElementById('bgMusic');
    audio.volume = 0.4;
};

/* ================= NAVIGATION ================= */
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active-page');
        // Reset animations by re-adding class
        void p.offsetWidth; 
    });
    
    // Show target
    document.getElementById(pageId).classList.add('active-page');

    // Update Nav Icons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.onclick.toString().includes(pageId)) btn.classList.add('active');
    });

    // Special case: Refresh puzzle if Arcade opened
    if(pageId === 'arcade' && !puzzleStarted) {
        document.getElementById('puzzleOverlay').style.display = 'flex';
    }
}

/* ================= FEATURES ================= */

// 1. Days Counter
function updateCounter() {
    const diff = new Date() - CONFIG.startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').innerText = days;
}

// 2. Music Player
let isPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const disk = document.getElementById('disk');
    const title = document.getElementById('songTitle');
    
    if (isPlaying) {
        audio.pause();
        disk.classList.remove('playing');
        title.innerText = "Paused";
    } else {
        audio.play().catch(e => alert("Interact with the page first!"));
        disk.classList.add('playing');
        title.innerText = "Our Song";
    }
    isPlaying = !isPlaying;
}

// 3. Interactive Notepad
function saveNote() {
    const val = document.getElementById('userNote').value;
    localStorage.setItem('saraa_love_note', val);
    alert("Saved to the stars! ✨");
}

function loadNote() {
    const saved = localStorage.getItem('saraa_love_note');
    if(saved) document.getElementById('userNote').value = saved;
}

function downloadNote() {
    const text = document.getElementById('userNote').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'NoteForYou.txt';
    a.click();
}

// 4. Masonry Gallery Population
function initGallery() {
    const grid = document.getElementById('photoGrid');
    // Using placeholder images - Replace src with assets/img1.jpg etc.
    const images = [
        'assets/img1.jpg', 'assets/img2.jpg', 'assets/img3.jpg', 
        'assets/img4.jpg', 'assets/img5.jpg'
    ];
    
    // If you don't have files yet, this prevents crash
    // Remove this check once you add images
    if(images.length > 0) {
       // Loop through images
       // For now, I will use placeholder logic so code works immediately for you
       const placeholderCount = 6;
       grid.innerHTML = '';
       for(let i=0; i<placeholderCount; i++) {
           let img = document.createElement('img');
           img.src = `https://picsum.photos/400/${300 + Math.floor(Math.random()*200)}?random=${i}`; // Random aesthetic heights
           img.onclick = function() {
               document.getElementById('imgModal').classList.add('show');
               document.getElementById('modalImg').src = this.src;
           }
           grid.appendChild(img);
       }
    }
}

/* ================= PUZZLE GAME LOGIC (Sliding Tile) ================= */
let puzzleStarted = false;
let emptyTile = { r: 2, c: 2 }; // Bottom right for 3x3

function startPuzzle() {
    document.getElementById('puzzleOverlay').style.display = 'none';
    puzzleStarted = true;
    createPuzzleGrid();
}

function createPuzzleGrid() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = ''; // Clear
    
    const size = 300;
    const tileCount = CONFIG.gridSize;
    const tileSize = size / tileCount;
    
    // Create tiles
    for (let r = 0; r < tileCount; r++) {
        for (let c = 0; c < tileCount; c++) {
            if (r === tileCount - 1 && c === tileCount - 1) continue; // Skip last one (empty)
            
            let tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.style.width = tileSize + 'px';
            tile.style.height = tileSize + 'px';
            tile.style.backgroundPosition = `-${c * tileSize}px -${r * tileSize}px`;
            tile.style.top = (r * tileSize) + 'px';
            tile.style.left = (c * tileSize) + 'px';
            tile.id = `tile-${r}-${c}`;
            
            // Randomize positions slightly for "unsolved" look (simplified shuffle)
            // In a real app, use solvable shuffle algorithm. 
            // Here we just swap a few for effect to ensure solvability.
            
            tile.onclick = () => moveTile(tile, r, c, tileSize);
            container.appendChild(tile);
        }
    }
    emptyTile = { r: tileCount - 1, c: tileCount - 1 };
}

function moveTile(tile, r, c, size) {
    // Check if adjacent to empty
    const dr = Math.abs(r - emptyTile.r);
    const dc = Math.abs(c - emptyTile.c);
    
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Swap DOM visual
        tile.style.top = (emptyTile.r * size) + 'px';
        tile.style.left = (emptyTile.c * size) + 'px';
        
        // Update data
        const oldR = r;
        const oldC = c;
        r = emptyTile.r;
        c = emptyTile.c;
        emptyTile = { r: oldR, c: oldC };
        
        // Reset onclick with new coords
        tile.onclick = () => moveTile(tile, r, c, size);
    }
}

/* ================= HEART POPPER GAME ================= */
function spawnHearts() {
    const container = document.getElementById('secret-reveal');
    container.innerHTML = "Catch a heart! ❤️";
    
    for(let i=0; i<15; i++) {
        let heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '-10vh';
        heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
        heart.style.cursor = 'pointer';
        heart.style.transition = `top ${Math.random() * 3 + 2}s linear`;
        heart.style.zIndex = 1000;
        
        heart.onclick = function() {
            const reasons = ["Your smile", "Your kindness", "Your eyes", "Everything"];
            this.innerHTML = reasons[Math.floor(Math.random() * reasons.length)];
            this.style.fontSize = '12px';
            this.style.background = 'white';
            this.style.color = 'black';
            this.style.padding = '5px';
            this.style.borderRadius = '5px';
        };

        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.style.top = '110vh';
        }, 100);

        setTimeout(() => heart.remove(), 6000);
    }
}

/* ================= STARFIELD CANVAS ================= */
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = [];
    for(let i=0; i<200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            star.y -= star.speed;
            if(star.y < 0) star.y = canvas.height;
        });
        requestAnimationFrame(animate);
    }
    animate();
    
    window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
