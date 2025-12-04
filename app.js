/* app.js
  Mobile-first, optimized JS for:
  - Jigsaw (uses local image assets/jigsaw.jpg)
  - Heart maze (DFS carve clipped to heart)
  - Dot connect
  - UI: pages, overlay + confetti, lazy gallery, notepad autosave
  - Optimizations: rAF drawing, debounced resize, minimal DOM writes
*/

(() => {
  'use strict';

  // helpers
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const debounce = (fn,ms=120) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } };

  // Preloader hide
  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      setTimeout(()=> { const p = $('#preloader'); if(p) p.style.display = 'none'; }, 350);
    }
  };

  // NAV: showPage
  window.showPage = (n) => {
    $$('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page' + n);
    if (pg) pg.classList.add('active');
    $$('.nav button').forEach((b,i) => b.classList.toggle('active', i === n-1));
    window.scrollTo({top:0, behavior:'smooth'});
  };

  // Overlay + confetti (light)
  const overlay = $('#overlay'), confettiCanvas = $('#confetti');
  let confCtx = null, confRAF = null, confPieces = [];

  function openOverlay(title, text) {
    $('#overlayTitle').textContent = title;
    $('#overlayMsg').textContent = text;
    overlay.classList.add('show'); overlay.setAttribute('aria-hidden','false');
    startConfetti();
  }
  window.closeOverlay = () => {
    overlay.classList.remove('show'); overlay.setAttribute('aria-hidden','true');
    stopConfetti();
  };

  function startConfetti() {
    confettiCanvas.width = overlay.clientWidth;
    confettiCanvas.height = overlay.clientHeight;
    confCtx = confettiCanvas.getContext('2d');
    confPieces = Array.from({length: 30}, () => ({
      x: Math.random()*confettiCanvas.width,
      y: -Math.random()*confettiCanvas.height,
      vx: (Math.random()-0.5)*2, vy: 2 + Math.random()*4,
      r: 6 + Math.random()*10, color: ['#ff6b9d','#ffd166','#9ecce3','#8c933f','#176c5e'][Math.floor(Math.random()*5)],
      rot: Math.random()*360, vr: (Math.random()-0.5)*8
    }));
    (function frame(){
      confRAF = requestAnimationFrame(frame);
      confCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
      confPieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.rot * Math.PI / 180);
        confCtx.fillStyle = p.color;
        confCtx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
        confCtx.restore();
      });
      confPieces = confPieces.map(p => (p.y > confettiCanvas.height + 30) ? { ...p, y: -40, x: Math.random()*confettiCanvas.width } : p);
    })();
    setTimeout(stopConfetti, 3200);
  }
  function stopConfetti() { if (confRAF) cancelAnimationFrame(confRAF); confRAF = null; if (confCtx) confCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }

  /* ------------------- JIGSAW (image slicing) ------------------- */
  (function jigsaw() {
    const canvas = $('#jigsawCanvas'), ctx = canvas.getContext('2d');
    const defaultGrid = 3;
    let gridN = defaultGrid;
    let pieces = []; // {sx, sy, sw, sh, x, y, w, h, placed}
    let dragging = null, dragOffset = {x:0,y:0};
    const MAX_SIZE = 520;
    let img = new Image();
    img.src = 'assets/jigsaw.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => initGrid(gridN);
    img.onerror = () => initGrid(gridN); // fallback to colored boxes

    function resizeCanvas() {
      const w = Math.min(MAX_SIZE, Math.floor(window.innerWidth * 0.86));
      const oldW = canvas.width || w;
      const scale = w / oldW;
      canvas.width = w; canvas.height = w;
      if(pieces.length && oldW){
        pieces.forEach(p => {
          p.x = p.x * scale;
          p.y = p.y * scale;
          p.w = w / gridN;
          p.h = w / gridN;
          p.correctX = p.correctX * scale;
          p.correctY = p.correctY * scale;
        });
      }
      draw();
    }

    function initGrid(n) {
      gridN = n;
      pieces = [];
      const pieceSize = canvas.width / gridN;
      for (let r=0;r<gridN;r++){
        for (let c=0;c<gridN;c++){
          const sx = Math.floor(c * (img.width / gridN));
          const sy = Math.floor(r * (img.height / gridN));
          const sw = Math.ceil(img.width / gridN);
          const sh = Math.ceil(img.height / gridN);
          pieces.push({
            sx, sy, sw, sh,
            w: pieceSize, h: pieceSize,
            x: Math.random()*(canvas.width-pieceSize),
            y: Math.random()*(canvas.height-pieceSize),
            correctX: c * pieceSize, correctY: r * pieceSize,
            placed: false
          });
        }
      }
      requestDraw();
    }

    let needsDraw = false;
    function requestDraw() { if(!needsDraw){ needsDraw=true; requestAnimationFrame(draw); } }
    function draw() {
      needsDraw=false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);

      for (let p of pieces) {
        if(img.complete && img.naturalWidth){
          ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.x, p.y, p.w, p.h);
          ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
          ctx.strokeRect(p.x+0.5, p.y+0.5, p.w-1, p.h-1);
        } else {
          ctx.fillStyle = p.placed ? '#e9f7f3' : '#9ecce3';
          ctx.fillRect(p.x,p.y,p.w,p.h);
          ctx.strokeStyle = '#105a4e'; ctx.strokeRect(p.x,p.y,p.w,p.h);
          ctx.fillStyle = '#fff'; ctx.font = `${Math.max(14,p.w/6|0)}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline='middle';
          ctx.fillText('❤️', p.x + p.w/2, p.y + p.h/2 + 6);
        }
      }
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.touches?e.touches[0].clientX:e.clientX) - rect.left) * (canvas.width / rect.width);
      const y = ((e.touches?e.touches[0].clientY:e.clientY) - rect.top) * (canvas.height / rect.height);
      return {x,y};
    }

    function pickPiece(x,y){
      for(let i=pieces.length-1;i>=0;i--){
        const p = pieces[i];
        if(x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p;
      }
      return null;
    }

    function onDown(e){
      const {x,y} = getCanvasCoords(e);
      const p = pickPiece(x,y);
      if(p && !p.placed){
        dragging = p;
        dragOffset.x = x - p.x; dragOffset.y = y - p.y;
        pieces = pieces.filter(xx => xx !== p);
        pieces.push(p);
        draw();
      }
    }
    function onMove(e){
      if(!dragging) return;
      const {x,y} = getCanvasCoords(e);
      dragging.x = clamp(x - dragOffset.x, -10, canvas.width - dragging.w + 10);
      dragging.y = clamp(y - dragOffset.y, -10, canvas.height - dragging.h + 10);
      requestDraw();
    }
    function onUp(){
      if(!dragging) return;
      const d = dragging;
      const dx = Math.abs(d.x - d.correctX), dy = Math.abs(d.y - d.correctY);
      if(dx < Math.max(12, d.w*0.18) && dy < Math.max(12, d.h*0.18)){
        d.x = d.correctX; d.y = d.correctY; d.placed = true;
      }
      dragging = null;
      requestDraw();
      checkWin();
    }

    function shufflePieces(){
      pieces.forEach(p => { p.x = Math.random()*(canvas.width-p.w); p.y = Math.random()*(canvas.height-p.h); p.placed = false; });
      requestDraw();
    }

    function checkWin(){
      if(pieces.length && pieces.every(p => p.placed)){
        openOverlay('Wah! Badhiya 🎉', 'Tumne puzzle solve kar diya — dil se shabash! ❤️');
      }
    }

    // events
    canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', e => { onDown(e); }, {passive:true});
    canvas.addEventListener('touchmove', e => { onMove(e); }, {passive:true});
    canvas.addEventListener('touchend', onUp);

    // controls
    $$('.grid-btn').forEach(btn => btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.size, 10) || 3; gridN = n; initGrid(n);
    }));
    $('#shuffleJigsaw').addEventListener('click', shufflePieces);

    // responsive
    window.addEventListener('resize', debounce(() => {
      resizeCanvas();
    }, 120));

    // initial size and grid
    canvas.width = Math.min(MAX_SIZE, Math.floor(window.innerWidth*0.86));
    canvas.height = canvas.width;
    initGrid(defaultGrid);
    requestDraw();

    // expose for debug
    window._jigsaw = { initGrid, shufflePieces };
  })();

  /* ------------------- DOT CONNECT ------------------- */
  (function dotConnect(){
    const canvas = $('#dotCanvas'), ctx = canvas.getContext('2d');
    const MAX = 520; let W = Math.min(MAX, Math.floor(window.innerWidth*0.86));
    const Hcoords = [
      {x:0.5,y:0.18},{x:0.38,y:0.12},{x:0.25,y:0.18},{x:0.15,y:0.28},
      {x:0.12,y:0.4},{x:0.15,y:0.56},{x:0.25,y:0.7},{x:0.38,y:0.82},
      {x:0.5,y:0.9},{x:0.62,y:0.82},{x:0.75,y:0.7},{x:0.85,y:0.56},
      {x:0.88,y:0.4},{x:0.85,y:0.28},{x:0.75,y:0.18},{x:0.62,y:0.12}
    ];
    let dots = [], connected = [];

    function resize() {
      W = Math.min(MAX, Math.floor(window.innerWidth*0.86));
      canvas.width = W; canvas.height = W;
      dots = Hcoords.map(p => ({ x: p.x * W, y: p.y * W }));
      draw();
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      if(connected.length > 1) {
        ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = '#105a4e';
        ctx.moveTo(connected[0].x, connected[0].y);
        for(let i=1;i<connected.length;i++) ctx.lineTo(connected[i].x, connected[i].y);
        ctx.stroke();
      }
      for(let i=0;i<dots.length;i++){
        const d = dots[i];
        const sel = connected.includes(d);
        ctx.beginPath(); ctx.fillStyle = sel ? '#8c933f' : '#d7e7ee'; ctx.arc(d.x,d.y,10,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = sel ? '#fff' : '#105a4e'; ctx.font='12px serif'; ctx.textAlign='center'; ctx.fillText(i+1, d.x, d.y+4);
      }
      if(connected.length === dots.length){
        ctx.lineWidth = 6; ctx.strokeStyle = '#ff6b9d'; ctx.shadowBlur = 18; ctx.shadowColor = '#ff6b9d';
        ctx.beginPath(); ctx.moveTo(dots[0].x,dots[0].y); dots.forEach(d=>ctx.lineTo(d.x,d.y)); ctx.closePath(); ctx.stroke();
        ctx.shadowBlur = 0;
        setTimeout(()=> openOverlay('Lovely! ❤️', 'Tumne sab dots connect kar diye — kitni sweet baat hai!'), 220);
      }
    }

    function hit(x,y){ return dots.find(d => Math.hypot(d.x-x,d.y-y) < 20); }

    canvas.addEventListener('mousedown', e => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left)*(canvas.width/rect.width);
      const y = (e.clientY - rect.top)*(canvas.height/rect.height);
      const clicked = hit(x,y);
      if(clicked && !connected.includes(clicked)){ connected.push(clicked); draw(); }
    });
    canvas.addEventListener('touchstart', e => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left)*(canvas.width/rect.width);
      const y = (e.touches[0].clientY - rect.top)*(canvas.height/rect.height);
      const clicked = hit(x,y);
      if(clicked && !connected.includes(clicked)){ connected.push(clicked); draw(); }
    }, {passive:true});

    $('#undoDot').addEventListener('click', ()=>{ connected.pop(); draw(); });
    $('#resetDot').addEventListener('click', ()=>{ connected = []; draw(); });

    window.addEventListener('resize', debounce(resize,120));
    resize();
  })();

  /* ------------------- MAZE (heart + DFS) ------------------- */
  (function maze(){
    const canvas = $('#mazeCanvas'), ctx = canvas.getContext('2d');
    const MAX = 520; let W = Math.min(MAX, Math.floor(window.innerWidth*0.86));
    const COLS = 21, ROWS = 21;
    let grid = [], player = {r:1,c:1}, goal = {r:ROWS-2,c:COLS-2}, showPath=false;

    function resize(){ W = Math.min(MAX, Math.floor(window.innerWidth*0.86)); canvas.width = W; canvas.height = W; draw(); }

    function makeMask(){
      const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = W;
      const tctx = tmp.getContext('2d');
      tctx.fillStyle = 'black';
      tctx.save(); tctx.translate(W/2, W/2.2);
      const s = Math.min(W,W)/520;
      tctx.beginPath();
      tctx.moveTo(0,-120*s);
      tctx.bezierCurveTo(90*s,-200*s,210*s,-80*s,0,120*s);
      tctx.bezierCurveTo(-210*s,-80*s,-90*s,-200*s,0,-120*s);
      tctx.closePath(); tctx.fill(); tctx.restore();
      const img = tctx.getImageData(0,0,W,W).data;
      const mask = Array.from({length:ROWS}, ()=>Array(COLS).fill(false));
      for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
          const cx = Math.floor((c+0.5)*(W/COLS));
          const cy = Math.floor((r+0.5)*(W/ROWS));
          mask[r][c] = img[(cy*W + cx)*4 + 3] > 10;
        }
      }
      return mask;
    }

    function carve(){
      const g = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
      const inBounds = (r,c) => r>0 && r<ROWS-1 && c>0 && c<COLS-1;
      const stack = [];
      const sr = 1, sc = 1; g[sr][sc] = 1; stack.push([sr,sc]);
      const dirs = [[0,2],[0,-2],[2,0],[-2,0]];
      while(stack.length){
        const [r,c] = stack[stack.length-1];
        const neighbors = dirs.filter(d => {
          const nr = r + d[0], nc = c + d[1];
          return inBounds(nr,nc) && g[nr][nc] === 0;
        });
        if(!neighbors.length){ stack.pop(); continue; }
        const [dr,dc] = neighbors[Math.floor(Math.random()*neighbors.length)];
        const nr = r + dr, nc = c + dc;
        g[nr][nc] = 1; g[r+dr/2][c+dc/2] = 1; stack.push([nr,nc]);
      }
      const mask = makeMask();
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!mask[r][c]) g[r][c] = 0;
      grid = g; player = findOpen(ROWS-2,1) || {r:1,c:1}; goal = findOpen(1,COLS-2) || {r:ROWS-2,c:COLS-2};
      showPath = false; draw();
    }

    function findOpen(r,c){
      const q = [[r,c]]; const seen = Array.from({length:ROWS}, ()=>Array(COLS).fill(false)); seen[r][c] = true;
      while(q.length){
        const [rr,cc] = q.shift();
        if(grid[rr][cc]===1) return {r:rr,c:cc};
        for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nr = rr + dr, nc = cc + dc;
          if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS && !seen[nr][nc]){ seen[nr][nc] = true; q.push([nr,nc]); }
        }
      }
      return null;
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.save(); ctx.translate(canvas.width/2, canvas.height/2.2);
      const scale = Math.min(canvas.width, canvas.height)/520;
      ctx.beginPath();
      ctx.moveTo(0,-120*scale);
      ctx.bezierCurveTo(90*scale,-200*scale,210*scale,-80*scale,0,120*scale);
      ctx.bezierCurveTo(-210*scale,-80*scale,-90*scale,-200*scale,0,-120*scale);
      ctx.closePath(); ctx.clip();
      ctx.translate(-canvas.width/2, -canvas.height/2);
      const cs = Math.floor(canvas.width/COLS);
      for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
          if(grid[r][c] === 0){ ctx.fillStyle = '#8c933f'; ctx.fillRect(c*cs, r*cs, cs, cs); }
        }
      }
      ctx.fillStyle = '#e8fbf6'; ctx.beginPath(); ctx.arc((player.c+0.5)*cs, (player.r+0.5)*cs, cs*0.36, 0, Math.PI*2); ctx.fill();
      ctx.font = `${Math.floor(cs*0.9)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('❤️', (goal.c+0.5)*cs, (goal.r+0.5)*cs + 2);
      if(showPath){ const sol = findPath(player, goal); if(sol){ ctx.beginPath(); ctx.lineWidth = Math.max(6, cs*0.25); ctx.strokeStyle='rgba(255,107,157,0.95)'; ctx.moveTo((sol[0].c+0.5)*cs, (sol[0].r+0.5)*cs); for(let i=1;i<sol.length;i++) ctx.lineTo((sol[i].c+0.5)*cs, (sol[i].r+0.5)*cs); ctx.stroke(); } }
      ctx.restore();
      ctx.save(); ctx.translate(canvas.width/2, canvas.height/2.2);
      ctx.beginPath(); ctx.moveTo(0,-120*scale); ctx.bezierCurveTo(90*scale,-200*scale,210*scale,-80*scale,0,120*scale); ctx.bezierCurveTo(-210*scale,-80*scale,-90*scale,-200*scale,0,-120*scale); ctx.closePath(); ctx.lineWidth=6; ctx.strokeStyle='rgba(16,36,30,0.12)'; ctx.stroke();
      ctx.restore();
    }

    function findPath(from, to){
      const q = [[from.r, from.c]]; const seen = Array.from({length:ROWS}, ()=>Array(COLS).fill(false));
      const parent = Array.from({length:ROWS}, ()=>Array(COLS).fill(null));
      seen[from.r][from.c] = true;
      while(q.length){
        const [r,c] = q.shift();
        if(r===to.r && c===to.c) break;
        for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nr = r + dr, nc = c + dc;
          if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS && !seen[nr][nc] && grid[nr][nc]===1){
            seen[nr][nc] = true; parent[nr][nc] = [r,c]; q.push([nr,nc]);
          }
        }
      }
      if(!parent[to.r][to.c]) return null;
      const path = []; let cur = [to.r,to.c];
      while(cur){ path.push({r:cur[0], c:cur[1]}); cur = parent[cur[0]][cur[1]]; }
      return path.reverse();
    }

    function movePlayer(dr,dc){
      const nr = player.r + dr, nc = player.c + dc;
      if(nr<0||nr>=ROWS||nc<0||nc>=COLS) return;
      if(grid[nr][nc] === 1){ player.r = nr; player.c = nc; draw(); }
      if(player.r === goal.r && player.c === goal.c){
        setTimeout(()=> openOverlay('Ohooo — Jeet gaya! 🏆', 'Kitna pyaara chalaya — tumne dil jeet liya!'), 220);
      }
    }

    $('#upBtn').addEventListener('click', ()=> movePlayer(-1,0));
    $('#downBtn').addEventListener('click', ()=> movePlayer(1,0));
    $('#leftBtn').addEventListener('click', ()=> movePlayer(0,-1));
    $('#rightBtn').addEventListener('click', ()=> movePlayer(0,1));

    let ts = null;
    canvas.addEventListener('touchstart', e => { ts = {x: e.touches[0].clientX, y: e.touches[0].clientY}; }, {passive:true});
    canvas.addEventListener('touchend', e => {
      if(!ts) return;
      const dx = e.changedTouches[0].clientX - ts.x, dy = e.changedTouches[0].clientY - ts.y;
      if(Math.abs(dx) > Math.abs(dy)) movePlayer(0, dx>0?1:-1);
      else movePlayer(dy>0?1:-1, 0);
      ts = null;
    }, {passive:true});

    $('#mazeReset').addEventListener('click', () => carve());
    $('#mazeSolve').addEventListener('click', () => { showPath = !showPath; draw(); });

    window.addEventListener('resize', debounce(resize, 120));
    carve(); resize();
  })();

  /* ------------------- Gallery, timeline, notepad ------------------- */
  (function content(){
    const images = [
      {src:'assets/img1.jpg', caption:'Forever Together 💕'},
      {src:'assets/img2.jpg', caption:'My Favorite Smile ❤️'},
      {src:'assets/img3.jpg', caption:'Beautiful Moments 🌸'},
      {src:'assets/img4.jpg', caption:'You & Me 💑'},
      {src:'assets/img5.jpg', caption:'Perfect Day 🌟'},
      {src:'assets/img6.jpg', caption:'Love Always 💝'}
    ];
    $('#gallery').innerHTML = images.map((it,i) => `
      <div class="polaroid" data-i="${i}" aria-label="${it.caption}">
        <img src="${it.src}" alt="${it.caption}" loading="lazy" decoding="async">
      </div>
    `).join('');
    $('#gallery').addEventListener('click', e => {
      const p = e.target.closest('.polaroid'); if(!p) return;
      const i = +p.dataset.i;
      const modal = document.createElement('div'); modal.style.position='fixed'; modal.style.inset='0'; modal.style.background='rgba(0,0,0,0.92)'; modal.style.display='grid'; modal.style.placeItems='center'; modal.style.zIndex=6000;
      modal.innerHTML = `<div style="max-width:94%;max-height:94%;position:relative">
        <img src="${images[i].src}" alt="${images[i].caption}" style="max-width:100%;max-height:100%;border-radius:12px;display:block">
        <button aria-label="close" style="position:absolute;right:-10px;top:-10px;background:var(--p1);border:none;padding:10px;border-radius:999px;cursor:pointer">×</button>
      </div>`;
      modal.querySelector('button').addEventListener('click', ()=> modal.remove());
      document.body.appendChild(modal);
    });

    const timeline = [
      {date:'The Beginning', text:'The day we first met — duniya thodi slow ho gayi thi.'},
      {date:'First Date', text:'Wo pal jab tumne muskura ke kaha — yaad hai?'},
      {date:'Falling Deeper', text:'Har roz tumse pyaar badhta gaya.'},
      {date:'Our Adventure', text:'Choti choti safar, magar yaadein lambe waqt tak.'},
      {date:'Forever Promise', text:'Aaj aur hamesha — tumhara mera vaada.'}
    ];
    $('#timeline').innerHTML = timeline.map(it => `<div class="timeline-item"><strong>${it.date}</strong><p style="margin-top:8px">${it.text}</p></div>`).join('');

    // notepad autosave
    const note = $('#notepad');
    const saved = localStorage.getItem('loveNote'); if(saved) note.value = saved;
    note.addEventListener('input', debounce(() => localStorage.setItem('loveNote', note.value), 400));
    $('#downloadNote').addEventListener('click', () => {
      const text = note.value || 'My love note for you... ❤️';
      const blob = new Blob([text], {type:'text/plain'}), url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Love_Note_for_Saraaa.txt'; a.click(); URL.revokeObjectURL(url);
    });
  })();

  // keyboard nav
  window.addEventListener('keydown', e => {
    if(e.key === '1') showPage(1);
    if(e.key === '2') showPage(2);
    if(e.key === '3') showPage(3);
    if(e.key === '4') showPage(4);
    if(e.key === '5') showPage(5);
  });

})(); // IIFE
