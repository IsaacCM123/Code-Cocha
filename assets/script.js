/* =============================================
   STARFIELD
============================================= */
const canvas = document.getElementById('cosmos');
const ctx = canvas.getContext('2d');
let W, H, stars = [], speed = 0, targetSpeed = 0;

function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); initStars(); });

function initStars(){
  stars = [];
  const N = Math.floor((W * H) / 2200);
  for(let i = 0; i < N; i++){
    stars.push({
      x: (Math.random()-0.5)*W*3, y: (Math.random()-0.5)*H*3,
      z: Math.random()*W, pz: 0,
      size: Math.random()*1.5+0.3,
      color: Math.random()<0.15
        ? `hsl(${180+Math.random()*80},100%,85%)`
        : `rgba(255,255,255,${0.5+Math.random()*0.5})`
    });
  }
}
initStars();

function drawStars(){
  ctx.fillStyle='rgba(0,0,15,0.18)';
  ctx.fillRect(0,0,W,H);
  const cx=W/2, cy=H/2;
  for(let s of stars){
    s.pz=s.z; s.z-=speed*5+0.3;
    if(s.z<=0){ s.x=(Math.random()-0.5)*W*3; s.y=(Math.random()-0.5)*H*3; s.z=W; s.pz=s.z; }
    const sx=(s.x/s.z)*W+cx, sy=(s.y/s.z)*H+cy;
    const px=(s.x/s.pz)*W+cx, py=(s.y/s.pz)*H+cy;
    const r=Math.max(0.3,(1-s.z/W)*3*s.size);
    ctx.beginPath();
    if(speed>1){
      ctx.strokeStyle=s.color; ctx.lineWidth=r*0.7;
      ctx.globalAlpha=Math.min(1,(1-s.z/W)*1.4);
      ctx.moveTo(px,py); ctx.lineTo(sx,sy); ctx.stroke();
    } else {
      ctx.fillStyle=s.color;
      ctx.globalAlpha=Math.min(1,(1-s.z/W)*1.6);
      ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  requestAnimationFrame(drawStars);
}
drawStars();
setInterval(()=>{ speed+=(targetSpeed-speed)*0.08; },16);

/* RINGS */
const ringsEl=document.getElementById('rings');
for(let i=0;i<7;i++){
  const d=document.createElement('div'); d.className='ring';
  const sz=220+i*140;
  d.style.cssText=`width:${sz}px;height:${sz}px;--dur:${6+i*1.4}s;animation-delay:${-i*(6+i*1.4)/7}s;`;
  if(i%3===0) d.style.borderColor='rgba(123,47,255,0.12)';
  if(i%3===1) d.style.borderColor='rgba(255,45,120,0.07)';
  ringsEl.appendChild(d);
}

/* =============================================
   CARD ENGINE
============================================= */
const TOTAL=5;
const cards   = document.querySelectorAll('.card');
const hero    = document.getElementById('hero');
const flash   = document.getElementById('flash');
const aiFig   = document.getElementById('ai-figure');
const tunnelI = document.getElementById('tunnel-inner');

let current=-1, isAnim=false, accum=0;
const THRESH=120;

function triggerFlash(){ flash.classList.add('show'); setTimeout(()=>flash.classList.remove('show'),200); }

function setCard(idx){
  if(isAnim) return;
  if(idx===current) return;
  isAnim=true;
  triggerFlash();
  targetSpeed=8+Math.random()*4;

  tunnelI.style.transition='transform 0.5s ease-in';
  tunnelI.style.transform='scale(1.08)';
  setTimeout(()=>{ tunnelI.style.transition='transform 0.6s ease-out'; tunnelI.style.transform='scale(1)'; },350);

  if(current===-1){
    hero.classList.add('hidden');
    aiFig.classList.add('visible');
  } else {
    cards[current].classList.remove('active');
    cards[current].classList.add('exit');
    setTimeout(()=>cards[current].classList.remove('exit'),600);
  }

  current=idx;

  if(idx===-1){
    hero.classList.remove('hidden');
    aiFig.classList.remove('visible');
    setTimeout(()=>{ targetSpeed=0; isAnim=false; },700);
  } else {
    setTimeout(()=>{
      cards[idx].classList.add('active');
      setTimeout(()=>{ targetSpeed=0; isAnim=false; },700);
    },300);
  }
}

function navigate(dir){
  const next=current+dir;
  if(next<-1||next>=TOTAL) return;
  setCard(next);
}

window.addEventListener('wheel',e=>{
  e.preventDefault();
  accum+=e.deltaY;
  if(accum>THRESH){ accum=0; navigate(1); }
  if(accum<-THRESH){ accum=0; navigate(-1); }
},{passive:false});

window.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowRight') navigate(1);
  if(e.key==='ArrowUp'||e.key==='ArrowLeft') navigate(-1);
});

let ty0=0,tx0=0;
window.addEventListener('touchstart',e=>{ ty0=e.touches[0].clientY; tx0=e.touches[0].clientX; },{passive:true});
window.addEventListener('touchend',e=>{
  const dy=ty0-e.changedTouches[0].clientY, dx=tx0-e.changedTouches[0].clientX;
  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>40) navigate(dy>0?1:-1);
},{passive:true});

/* PARALLAX */
document.addEventListener('mousemove',e=>{
  const xR=(e.clientX/window.innerWidth-0.5)*2;
  const yR=(e.clientY/window.innerHeight-0.5)*2;
  document.getElementById('neb1').style.transform=`translate(${xR*18}px,${yR*12}px)`;
  document.getElementById('neb2').style.transform=`translate(${xR*-12}px,${yR*-8}px)`;
  ringsEl.style.transform=`translate(${xR*6}px,${yR*4}px)`;
  if(current>=0){
    cards[current].style.transform=`scale(0.82) rotateY(${xR*4}deg) rotateX(${-yR*3}deg)`;
  }
});
document.addEventListener('mouseleave',()=>{
  if(current>=0) cards[current].style.transform='scale(0.82)';
});

/* IDLE DRIFT */
setInterval(()=>{
  if(!isAnim&&targetSpeed===0){ targetSpeed=0.25+Math.random()*0.15; setTimeout(()=>{ targetSpeed=0; },1800); }
},5000);

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});