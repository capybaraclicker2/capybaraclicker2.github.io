// Italian Brainrot Clicker - Game Engine
const CHARS = [
    {id:'tralalero',img:'../tralalero-tralala.png'},
    {id:'bombardiro',img:'../bombardiro-crocodilo.png'},
    {id:'cappuccino',img:'../cappuccino-assassino.png'},
    {id:'patapim',img:'../brr-brr-patapim.png'},
    {id:'sahur',img:'../tung-tung-tung-sahur.png'},
    {id:'ballerina',img:'../ballerina-cappuccina.png'},
    {id:'lirili',img:'../lirili-larila.png'},
    {id:'vaca',img:'../la-vaca-saturno-saturnita.png'},
    {id:'gusini',img:'../bombombini-gusini.png'}
];

let S = {
    brainrot: 0, clickPower: 1, bps: 0,
    upgrades: {
        tralalero:  {count:0, base:50,   mult:1.15, bps:0.5, click:0},
        bombardiro: {count:0, base:150,  mult:1.15, bps:3,   click:0},
        cappuccino: {count:0, base:500,  mult:1.15, bps:12,  click:0},
        patapim:    {count:0, base:1800, mult:1.15, bps:50,  click:0},
        sahur:      {count:0, base:8000, mult:1.15, bps:200, click:0},
        ballerina:  {count:0, base:30000,mult:1.15, bps:800, click:0},
        lirili:     {count:0, base:120000,mult:1.15,bps:3200,click:0},
        vaca:       {count:0, base:500000,mult:1.15,bps:12000,click:0},
        clicker:    {count:0, base:30,   mult:1.3,  bps:0,   click:1},
        gusini:     {count:0, base:200,  mult:1.4,  bps:0,   click:5}
    }
};

// Canvas particles
const canvas = document.getElementById('brCanvas');
const ctx = canvas.getContext('2d');
let parts = [];
function resizeC(){ canvas.width=canvas.parentElement.clientWidth; canvas.height=canvas.parentElement.clientHeight; }
window.addEventListener('resize', resizeC); resizeC();

class Spark {
    constructor(x,y){ this.x=x; this.y=y; this.vx=(Math.random()-.5)*4; this.vy=(Math.random()-.5)*4-2; this.r=Math.random()*3+1.5; this.a=1; this.d=Math.random()*.015+.015; this.c=Math.random()>.3?'#a78bfa':'#ffd700'; }
    update(){ this.x+=this.vx; this.y+=this.vy; this.vy+=.05; this.a-=this.d; }
    draw(){ ctx.save(); ctx.globalAlpha=this.a; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.c; ctx.shadowBlur=8; ctx.shadowColor=this.c; ctx.fill(); ctx.restore(); }
}
class FloatTxt {
    constructor(x,y,t){ this.x=x; this.y=y; this.vy=-Math.random()*1.5-1.5; this.vx=(Math.random()-.5)*2; this.a=1; this.t=t; this.fs=Math.floor(Math.random()*8)+28; }
    update(){ this.x+=this.vx; this.y+=this.vy; this.a-=.02; }
    draw(){ ctx.save(); ctx.globalAlpha=this.a; ctx.font=`bold ${this.fs}px 'Outfit',sans-serif`; ctx.fillStyle='#fff'; ctx.shadowBlur=10; ctx.shadowColor='#ffd700'; ctx.fillText(this.t,this.x,this.y); ctx.restore(); }
}

let particlesEnabled = true;
function spawnParts(x,y){
    if(!particlesEnabled) return;
    for(let i=0;i<10;i++) parts.push(new Spark(x,y));
    parts.push(new FloatTxt(x,y-20,`+${S.clickPower}`));
}
function animParts(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=parts.length-1;i>=0;i--){ parts[i].update(); parts[i].draw(); if(parts[i].a<=0) parts.splice(i,1); }
    requestAnimationFrame(animParts);
}
requestAnimationFrame(animParts);

// Character blast on click
function blastChars(cx,cy){
    if(!particlesEnabled) return;
    const n=5;
    for(let i=0;i<n;i++){
        const img = document.createElement('img');
        const ch = CHARS[Math.floor(Math.random()*CHARS.length)];
        img.src = ch.img;
        img.className = 'char-blast';
        img.style.left = cx+'px';
        img.style.top = cy+'px';
        const angle = Math.random()*Math.PI*2;
        const dist = 60+Math.random()*120;
        img.style.setProperty('--tx', Math.cos(angle)*dist+'px');
        img.style.setProperty('--ty', Math.sin(angle)*dist-30+'px');
        img.style.setProperty('--rot', (Math.random()-.5)*720+'deg');
        document.body.appendChild(img);
        setTimeout(()=>img.remove(), 750);
    }
}

// Cost calc
function getCost(k){ const u=S.upgrades[k]; return Math.floor(u.base*Math.pow(u.mult,u.count)); }

// Recalc
function recalc(){
    let bp=0, cp=1;
    Object.keys(S.upgrades).forEach(k=>{
        const u=S.upgrades[k];
        if(u.bps) bp+=u.count*u.bps;
        if(u.click) cp+=u.count*u.click;
    });
    S.bps=parseFloat(bp.toFixed(1)); S.clickPower=cp;
}

// UI update
function updateUI(){
    document.getElementById('br-count').textContent = Math.floor(S.brainrot).toLocaleString();
    document.getElementById('br-bps').textContent = `${S.bps} per second`;
    document.getElementById('br-cpp').textContent = `${S.clickPower} per click`;
    const badge = document.getElementById('br-badge-val');
    if(badge) badge.textContent = `+${S.clickPower}`;
    Object.keys(S.upgrades).forEach(k=>{
        const cost=getCost(k), cnt=S.upgrades[k].count;
        const ce=document.getElementById(`cost-${k}`), qe=document.getElementById(`qty-${k}`), be=document.getElementById(`upg-${k}`);
        if(ce) ce.textContent=cost.toLocaleString();
        if(qe) qe.textContent=cnt;
        if(be){ if(S.brainrot>=cost) be.classList.remove('locked'); else be.classList.add('locked'); }
    });
}

// Character tier order (lowest to highest BPS)
const CHAR_TIERS = ['tralalero','bombardiro','cappuccino','patapim','sahur','ballerina','lirili','vaca'];
const CHAR_IMG_MAP = {
    tralalero: '../tralalero-tralala.png',
    bombardiro: '../bombardiro-crocodilo.png',
    cappuccino: '../cappuccino-assassino.png',
    patapim: '../brr-brr-patapim.png',
    sahur: '../tung-tung-tung-sahur.png',
    ballerina: '../ballerina-cappuccina.png',
    lirili: '../lirili-larila.png',
    vaca: '../la-vaca-saturno-saturnita.png'
};

function updateMainChar(){
    const mainImg = document.getElementById('brMainImg');
    if(!mainImg) return;
    // Pick the highest-tier character the player owns
    let best = null;
    for(let i=CHAR_TIERS.length-1; i>=0; i--){
        const k = CHAR_TIERS[i];
        if(S.upgrades[k] && S.upgrades[k].count > 0){
            best = k;
            break;
        }
    }
    if(best && CHAR_IMG_MAP[best]){
        mainImg.src = CHAR_IMG_MAP[best];
        mainImg.alt = best;
    }
}

function buy(k){
    const cost=getCost(k);
    if(S.brainrot>=cost){
        S.brainrot-=cost; S.upgrades[k].count++;
        recalc(); updateUI(); updateMainChar(); save();
    }
}

// Save/Load
function save(){ localStorage.setItem('brainrot_save',JSON.stringify(S)); }
function load(){
    const d=localStorage.getItem('brainrot_save');
    if(d){ try{ const p=JSON.parse(d); if(p.brainrot!==undefined) S.brainrot=parseFloat(p.brainrot); if(p.upgrades) Object.keys(S.upgrades).forEach(k=>{ if(p.upgrades[k]) S.upgrades[k].count=parseInt(p.upgrades[k].count)||0; }); }catch(e){} }
    recalc(); updateUI(); updateMainChar();
}
function reset(){
    if(!confirm('Reset all brainrot progress?')) return;
    S.brainrot=0; S.clickPower=1; S.bps=0;
    Object.keys(S.upgrades).forEach(k=>S.upgrades[k].count=0);
    localStorage.removeItem('brainrot_save'); recalc(); updateUI();
}

// Click handlers
const clickEl = document.getElementById('brClick');
function handleClick(e){
    const r=canvas.getBoundingClientRect();
    const x=(e.clientX||e.touches[0].clientX)-r.left;
    const y=(e.clientY||e.touches[0].clientY)-r.top;
    S.brainrot+=S.clickPower;
    spawnParts(x,y);
    blastChars(e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY);
    updateUI();
    clickEl.classList.add('clicked');
    setTimeout(()=>clickEl.classList.remove('clicked'),80);
}
clickEl.addEventListener('mousedown', handleClick);
clickEl.addEventListener('touchstart', e=>{e.preventDefault(); handleClick(e);}, {passive:false});

// Upgrade listeners
Object.keys(S.upgrades).forEach(k=>{
    const el=document.getElementById(`upg-${k}`);
    if(el) el.addEventListener('click',()=>buy(k));
});

// Reset
document.getElementById('br-reset').addEventListener('click', reset);

// BPS tick (10x/sec)
setInterval(()=>{ if(S.bps>0){ S.brainrot+=S.bps/10; updateUI(); } },100);

// Auto-save
let autoSave=true;
setInterval(()=>{ if(autoSave) save(); },10000);

// Init
load(); updateUI();

// ============ TOOLBAR CONTROLS ============

// Settings modal
const modal=document.getElementById('brModal');
document.getElementById('br-settings').addEventListener('click',()=>modal.classList.add('open'));
document.getElementById('br-close-modal').addEventListener('click',()=>modal.classList.remove('open'));
modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('open'); });

// Toggles
function setupTog(id,cb){
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener('click',()=>{ el.classList.toggle('on'); cb(el.classList.contains('on')); });
}
setupTog('tog-particles',v=>{particlesEnabled=v;});
setupTog('tog-autosave',v=>{autoSave=v;});
setupTog('tog-bps',v=>{ document.querySelector('.br-stats .bps').style.display=v?'':'none'; });
setupTog('tog-sound',()=>{});

// Save toast
function showToast(msg){
    const t=document.getElementById('brToast'); if(!t) return;
    t.textContent=msg||'☁️ Saved!';
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2200);
}
document.getElementById('br-save').addEventListener('click',()=>{ save(); showToast('☁️ Game Saved!'); });
const ss=document.getElementById('br-save-shop'); if(ss) ss.addEventListener('click',()=>{ save(); showToast('☁️ Game Saved!'); });

// 2x Speed
let speedOn=false, fastInt=null;
const speedBtn=document.getElementById('br-speed');
speedBtn.addEventListener('click',()=>{
    speedOn=!speedOn; speedBtn.classList.toggle('speed-on',speedOn);
    if(speedOn) fastInt=setInterval(()=>{ if(S.bps>0){ S.brainrot+=S.bps/10; updateUI(); } },100);
    else { clearInterval(fastInt); fastInt=null; }
});

// Free brainrot
let freeCD=false;
const freeBtn=document.getElementById('br-free');
freeBtn.addEventListener('click',()=>{
    if(freeCD) return;
    const bonus=Math.max(100, Math.floor(S.brainrot*0.05+100));
    S.brainrot+=bonus; updateUI();
    showToast(`⭐ +${bonus.toLocaleString()} Free Brainrot!`);
    freeCD=true; freeBtn.classList.add('cd');
    let rem=30; freeBtn.title=`${rem}s`;
    const cd=setInterval(()=>{ rem--; freeBtn.title=`${rem}s`; if(rem<=0){ clearInterval(cd); freeCD=false; freeBtn.classList.remove('cd'); freeBtn.title='Free Brainrot'; } },1000);
});

// ============ CHARACTER CAROUSEL ============
(function(){
    const track=document.getElementById('carTrack');
    const dots=document.querySelectorAll('.car-dot');
    const total=dots.length;
    let idx=0;
    function goTo(i){ idx=((i%total)+total)%total; track.style.transform=`translateX(-${idx*100}%)`; dots.forEach((d,j)=>d.classList.toggle('active',j===idx)); }
    document.getElementById('carPrev').addEventListener('click',()=>goTo(idx-1));
    document.getElementById('carNext').addEventListener('click',()=>goTo(idx+1));
    dots.forEach((d,i)=>d.addEventListener('click',()=>goTo(i)));
    setInterval(()=>goTo(idx+1),4000);
})();
