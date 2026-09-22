import { getRemaining, getReleaseTarget } from './countdown.js';
const fields = ['days', 'hours', 'minutes', 'seconds'];
const target = getReleaseTarget();
let timer;
function renderCountdown() {
  const remaining = getRemaining(target);
  for (const field of fields) {
    const value = String(remaining[field]).padStart(2, '0');
    for (const element of [document.getElementById(field),document.querySelector(`[data-mini="${field}"]`)]) {
      if (element && element.textContent !== value) element.textContent = value;
    }
  }
  if (remaining.complete) {
    document.getElementById('countdown-heading').textContent = 'THE SCHEDULED RELEASE DATE HAS ARRIVED';
    document.getElementById('timing-note').textContent = 'Check Rockstar Games for availability and the latest release information.';
    clearInterval(timer);
  }
}
renderCountdown();
if (Date.now() < target) timer = setInterval(renderCountdown,1000);

const body = document.body;
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const toggle = document.getElementById('motion-toggle');
const label = document.getElementById('motion-label');
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const landscape = document.querySelector('.hero-landscape');
const arrival = document.querySelector('.hero-arrival');
const experience = document.querySelector('.experience');
const cards = [...document.querySelectorAll('.scene-card')];
const selectors = [...document.querySelectorAll('[data-select]')];
const sceneNames = ['Daylight','Golden hour','After dark'];
const pageProgress = document.getElementById('page-progress');
let paused = false;
try { paused = localStorage.getItem('gta-motion-paused') === 'true'; } catch {}
let motion = true, selected = 1, selectionPosition = 1;
let geometry = {}, frame = 0, previousTime = 0;
let currentScroll = window.scrollY, pointerX=0,pointerY=0,currentX=0,currentY=0;
let emblem=null, emblemLoading=false, emblemFailed=false;
const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
const mix = (a,b,t) => a+(b-a)*t;
const smoothstep = (a,b,n) => {const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
function measure() {
  body.classList.toggle('compact-layout',innerHeight<=580 || parseFloat(getComputedStyle(document.documentElement).fontSize)>20);
  const nav = document.querySelector('.site-header').offsetHeight;
  geometry = {nav, width:innerWidth, height:innerHeight, heroStart:hero.offsetTop-nav,
    heroRange:Math.max(1,hero.offsetHeight-innerHeight+nav),
    sceneStart:experience.offsetTop-nav, sceneRange:Math.max(1,experience.offsetHeight-innerHeight+nav),
    total:Math.max(1,document.documentElement.scrollHeight-innerHeight)};
  schedule();
}
function schedule() { if (!frame && !document.hidden) frame=requestAnimationFrame(update); }
function update(time) {
  frame=0;
  const easing=motion?Math.min(1,1-Math.exp(-Math.min(64,time-(previousTime||time-16))/75)):1;
  previousTime=time;
  currentScroll=mix(currentScroll,window.scrollY,easing);
  currentX=mix(currentX,pointerX,easing); currentY=mix(currentY,pointerY,easing);
  selectionPosition=mix(selectionPosition,selected,motion?easing:1);
  const canPin=motion && !body.classList.contains('compact-layout');
  const heroP=canPin?clamp((currentScroll-geometry.heroStart)/geometry.heroRange):0;
  const sceneP=canPin?clamp((currentScroll-geometry.sceneStart)/geometry.sceneRange):0;
  pageProgress.style.transform=`scaleX(${clamp(window.scrollY/geometry.total)})`;
  if (canPin) {
    const fade=smoothstep(.17,.65,heroP);
    heroContent.style.opacity=1-fade;
    heroContent.style.transform=`translate3d(0,${-heroP*110}px,0) scale(${1+heroP*.3})`;
    // Avoid invisible focus targets after the introduction exits.
    landscape.style.opacity=.43+heroP*.57;
    landscape.style.transform=`scale(${1.03+heroP*.22}) translate3d(0,${-heroP*20}px,0)`;
    arrival.style.opacity=smoothstep(.51,.78,heroP);
    arrival.style.transform=`translate3d(0,${(1-smoothstep(.5,1,heroP))*60}px,0)`;
  } else {
    heroContent.style.opacity='1';heroContent.style.transform='none';
    landscape.style.opacity='.43';landscape.style.transform='none';arrival.style.opacity='0';
  }
  for (let i=0;i<cards.length;i++) {
    const relative=i-selectionPosition;
    const distance=Math.abs(relative);
    const activeWeight=1-clamp(distance);
    const mobile=geometry.width<=760;
    const spread=geometry.width*(mobile?.64:.34)*(1-sceneP*.14);
    const x=relative*spread;
    const y=distance*(35+sceneP*65) - activeWeight*Math.sin(sceneP*Math.PI)*16;
    const rotateY=-relative*(mobile?18:27) + activeWeight*(motion?(sceneP-.5)*13:0);
    const rotateZ=relative*(4+sceneP*4);
    const scale=mix(.72,1+sceneP*.07,activeWeight);
    cards[i].style.transform=`translateX(-50%) translate3d(${x}px,${y}px,${-distance*160}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    cards[i].style.zIndex=String(10-Math.round(distance*3));
    cards[i].querySelector('img').style.transform=`scale(1.08) translateY(${motion?(sceneP-.5)*-5:0}%)`;
  }
  if(emblem && currentScroll<hero.offsetHeight+geometry.nav) emblem.render({progress:heroP,pointerX:motion?currentX:0,pointerY:motion?currentY:0});
  if (Math.abs(currentScroll-window.scrollY)>.1 || Math.abs(currentX-pointerX)>.001 || Math.abs(currentY-pointerY)>.001 || Math.abs(selectionPosition-selected)>.001) schedule();
}
async function loadEmblem() {
  if (!motion || emblem || emblemLoading || emblemFailed) return;
  emblemLoading=true;
  try {const module=await import('./emblem.js');if(motion)emblem=module.createEmblem(document.getElementById('emblem'));}
  catch {emblemFailed=true;document.getElementById('emblem-wrap').classList.remove('webgl-ready');}
  finally {emblemLoading=false;schedule();}
}
function applyMotion(preservePosition=false) {
  const sections=[hero,document.querySelector('.world-intro'),experience,document.getElementById('countdown')];
  const visible=sections.filter(section=>section.offsetTop<=window.scrollY+100).at(-1)||hero;
  const offset=window.scrollY-visible.offsetTop;
  motion=!paused&&!reducedQuery.matches;
  body.dataset.motion=motion?'full':'reduced';
  body.classList.add('motion-ready');
  toggle.hidden=false;toggle.disabled=reducedQuery.matches;
  toggle.setAttribute('aria-pressed',String(!motion));
  label.textContent=reducedQuery.matches?'Reduced motion':motion?'Pause motion':'Enable motion';
  toggle.querySelector('.motion-icon').textContent=motion?'Ⅱ':'▷';
  if (!motion) {pointerX=pointerY=0;document.getElementById('emblem-wrap').classList.remove('webgl-ready');}
  if(preservePosition)window.scrollTo({top:visible.offsetTop+clamp(offset,0,Math.max(0,visible.offsetHeight-innerHeight)),behavior:'instant'});
  currentScroll=window.scrollY;measure();
  if(motion)loadEmblem();
}
function selectScene(index) {
  selected=index;
  for (const [i,card] of cards.entries()) {card.classList.toggle('is-selected',i===index);card.setAttribute('aria-pressed',String(i===index));}
  for (const [i,button] of selectors.entries()) button.setAttribute('aria-pressed',String(i===index));
  document.getElementById('scene-status').textContent=`${sceneNames[index]} selected.`;
  schedule();
}
for(const button of [...cards,...selectors]){
  const index=Number(button.dataset.scene??button.dataset.select);
  button.addEventListener('click',()=>selectScene(index));
  if(button.matches('.scene-card'))button.addEventListener('focus',()=>selectScene(index));
}
document.querySelector('.scene-selector').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?2:(selected+(event.key==='ArrowRight'?1:2))%3;
  selectScene(next);selectors[next].focus();
});
toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('gta-motion-paused',String(paused));}catch{}applyMotion(true);});
reducedQuery.addEventListener('change',()=>applyMotion(true));
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',measure,{passive:true});
hero.addEventListener('pointermove',event=>{
  if(!motion||!finePointer.matches||event.pointerType==='touch')return;
  pointerX=(event.clientX/innerWidth-.5)*2;pointerY=(event.clientY/innerHeight-.5)*2;schedule();
},{passive:true});
hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderCountdown();currentScroll=window.scrollY;measure();}else if(frame){cancelAnimationFrame(frame);frame=0;}});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
applyMotion();
document.fonts.ready.then(measure);
