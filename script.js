'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* ===== ADSENSE CONFIG: fill in after your account is approved, then set enabled:true ===== */
const ADS={enabled:false,pub:'ca-pub-XXXXXXXXXXXXXXXX',slots:{header:'0000000001',home:'0000000002',sidebar:'0000000003',between:'0000000004',footer:'0000000005',reward:'0000000006'}};
function initAds(root=document){
  $$('.ad',root).forEach(el=>{
    if(el.dataset.done)return;el.dataset.done=1;
    if(ADS.enabled){
      el.innerHTML=`<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="${ADS.pub}" data-ad-slot="${ADS.slots[el.dataset.slot]}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}
    }else el.insertAdjacentHTML('beforeend','<small>Ad space</small>');
  });
}
/* ===== State ===== */
let S={coins:0,xp:0,hs:{},fav:[],name:'Player',lastDaily:'',badges:[],plays:0,mute:false};
try{Object.assign(S,JSON.parse(localStorage.ugw||'{}'))}catch(e){}
const save=()=>{try{localStorage.ugw=JSON.stringify(S)}catch(e){}};
const BADGES={first:'🎮 First game',p5:'🔥 5 plays',c100:'🪙 100 coins',s100:'🏆 Score 100',fav:'❤️ Favourite',daily:'🎁 Daily reward'};
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)};
function award(id){if(!S.badges.includes(id)){S.badges.push(id);toast('Badge unlocked: '+BADGES[id])}}
function addCoins(n){S.coins+=n;S.xp+=n;if(S.coins>=100)award('c100');save();ui()}
function ui(){
  $('#coinN').textContent=S.coins;$('#lvl').textContent=1+(S.xp/100|0);$('#xpn').textContent=S.xp%100;$('#xpb').style.width=S.xp%100+'%';
  $('#plays').textContent=S.plays;$('#nm').value=S.name;
  $('#badges').innerHTML=Object.entries(BADGES).map(([k,v])=>`<span class="${S.badges.includes(k)?'on':''}">${v}</span>`).join('');
  const rows=GAMES.filter(g=>S.hs[g.id]).map(g=>`<tr><td>${g.e} ${g.n}</td><td></td><td>${S.hs[g.id]}</td></tr>`);
  $('#lb').innerHTML=rows.length?rows.join(''):'<tr><td colspan="3">Play a game to set your first score.</td></tr>';
  $$('#lb tr td:nth-child(2)').forEach(td=>td.textContent=S.name);
  const today=new Date().toDateString();$('#daily').disabled=S.lastDaily===today;
  $('#daily').textContent=S.lastDaily===today?'🎁 Come back tomorrow':'🎁 Claim daily reward';
}
/* ===== Game catalogue ===== */
const GAMES=[
{id:'racer',n:'Neon Racer',c:'Racing',e:'🏎️',d:'Dodge traffic as speed climbs.',a:'#00e5ff',z:'#7c3aed',h:'Move: ◀ ▶ or A / D'},
{id:'shooter',n:'Star Blaster',c:'Shooting',e:'🚀',d:'Auto-fire at falling invaders.',a:'#ff2d55',z:'#7c3aed',h:'Move: ◀ ▶ or A / D. Ship fires automatically.'},
{id:'snake',n:'Neon Snake',c:'Arcade',e:'🐍',d:'Eat, grow and never crash.',a:'#22c55e',z:'#00e5ff',h:'Steer: arrow keys / WASD or pad'},
{id:'memory',n:'Memory Match',c:'Puzzle',e:'🧩',d:'Match all pairs in few moves.',a:'#f59e0b',z:'#ff2d55',h:'Tap two cards to match them'},
{id:'quest',n:'Neon Quest',c:'Adventure',e:'🗺️',d:'Grab coins, avoid red orbs.',a:'#7c3aed',z:'#00e5ff',h:'Move: arrows / WASD or pad'}];
const SEC={feat:['racer','shooter','quest'],pop:['snake','racer','memory'],new:['quest','memory','shooter'],trend:['shooter','snake','racer']};
const card=g=>`<article class="card" tabindex="0" style="--a:${g.a};--z:${g.z}"><div class="art" aria-hidden="true">${g.e}</div><h3>${g.n}</h3><p>${g.d}</p><span class="tag">${g.c}</span><div class="row"><button class="btn" data-play="${g.id}">▶ Play</button><button class="fav ${S.fav.includes(g.id)?'on':''}" data-fav="${g.id}" aria-label="Favourite ${g.n}">♥</button></div></article>`;
let cat='All';
function render(){
  for(const k in SEC)$('#g-'+k).innerHTML=SEC[k].map(id=>card(GAMES.find(g=>g.id==id))).join('');
  const q=$('#q').value.toLowerCase().trim();
  const list=GAMES.filter(g=>(cat=='All'||(cat=='Favourites'?S.fav.includes(g.id):g.c==cat))&&(g.n+g.c+g.d).toLowerCase().includes(q));
  let h='';list.forEach((g,i)=>{h+=card(g);if(i==1)h+='<div class="ad" data-slot="between" style="grid-column:1/-1"></div>'});
  $('#g-all').innerHTML=h||'<p>No games found. Try another search or category.</p>';
  initAds($('#g-all'));
}
$('#chips').innerHTML=['All','Favourites',...new Set(GAMES.map(g=>g.c))].map(c=>`<button class="${c=='All'?'on':''}">${c}</button>`).join('');
$('#chips').onclick=e=>{if(e.target.tagName!='BUTTON')return;cat=e.target.textContent;$$('#chips button').forEach(b=>b.classList.toggle('on',b==e.target));render()};
$('#q').oninput=render;
/* ===== Sound ===== */
let AC;const beep=(f=440,d=.08)=>{if(S.mute)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}};
/* ===== Input ===== */
const K={l:0,r:0,u:0,d:0},km={ArrowLeft:'l',a:'l',ArrowRight:'r',d:'r',ArrowUp:'u',w:'u',ArrowDown:'d',s:'d'};
addEventListener('keydown',e=>{if(km[e.key]){K[km[e.key]]=1;if(G)e.preventDefault()}});
addEventListener('keyup',e=>{if(km[e.key])K[km[e.key]]=0});
$$('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{K[k]=1;e.preventDefault()});['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>K[k]=0))});
/* ===== Games ===== */
const W=360,H=480,cv=$('#cv'),X=cv.getContext('2d'),R=Math.random;
const box=(x,y,w,h,c)=>{X.shadowColor=c;X.shadowBlur=14;X.fillStyle=c;X.fillRect(x-w/2,y-h/2,w,h);X.shadowBlur=0};
const dot=(x,y,r,c)=>{X.shadowColor=c;X.shadowBlur=14;X.fillStyle=c;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.shadowBlur=0};
const maker={
racer(){let x=180,cars=[],tm=0,sp=200,o={s:0,lv:1};
  o.t=dt=>{x=Math.max(25,Math.min(335,x+(K.r-K.l)*270*dt));sp+=8*dt;o.s+=sp*dt/40;o.lv=1+(o.s/100|0);tm-=dt;
    if(tm<=0){cars.push({x:25+R()*310,y:-40});tm=Math.max(.3,.9-o.lv*.06)}
    cars.forEach(c=>c.y+=sp*dt);cars=cars.filter(c=>c.y<H+50);
    if(cars.some(c=>Math.abs(c.x-x)<26&&Math.abs(c.y-410)<44)){o.over=1;beep(120,.3)}};
  o.d=()=>{X.fillStyle='#10101c';X.fillRect(10,0,340,H);X.fillStyle='#7c3aed';for(let i=0;i<8;i++)X.fillRect(178,((i*70+o.s*40)%560)-40,4,40);cars.forEach(c=>box(c.x,c.y,26,44,'#ff2d55'));box(x,410,26,44,'#00e5ff')};return o},
shooter(){let x=180,b=[],e=[],tm=0,ft=0,o={s:0,lv:1,lives:3};
  o.t=dt=>{x=Math.max(20,Math.min(340,x+(K.r-K.l)*300*dt));ft-=dt;if(ft<=0){b.push({x,y:430});ft=.25;beep(800,.03)}
    b.forEach(q=>q.y-=520*dt);b=b.filter(q=>q.y>-10);tm-=dt;o.lv=1+(o.s/150|0);
    if(tm<=0){e.push({x:20+R()*320,y:-20,v:70+o.lv*18});tm=Math.max(.35,1-o.lv*.08)}
    e.forEach(n=>n.y+=n.v*dt);
    e.forEach(n=>b.forEach(q=>{if(!n.dead&&!q.dead&&Math.abs(n.x-q.x)<18&&Math.abs(n.y-q.y)<18){n.dead=q.dead=1;o.s+=10;beep(300,.06)}}));
    e.forEach(n=>{if(n.y>H&&!n.dead){n.dead=1;o.lives--;beep(120,.2)}});
    e=e.filter(n=>!n.dead);b=b.filter(q=>!q.dead);if(o.lives<=0){o.over=1}};
  o.d=()=>{b.forEach(q=>box(q.x,q.y,4,14,'#00e5ff'));e.forEach(n=>box(n.x,n.y,26,22,'#ff2d55'));box(x,440,30,20,'#7c3aed');box(x,430,10,16,'#00e5ff')};return o},
snake(){let sn=[{x:9,y:12}],dr={x:1,y:0},f={x:5,y:5},tm=0,o={s:0,lv:1};
  o.t=dt=>{if(K.l&&!dr.x)dr={x:-1,y:0};if(K.r&&!dr.x)dr={x:1,y:0};if(K.u&&!dr.y)dr={x:0,y:-1};if(K.d&&!dr.y)dr={x:0,y:1};
    tm-=dt;if(tm>0)return;tm=Math.max(.06,.15-o.lv*.008);o.lv=1+(o.s/50|0);
    const h={x:sn[0].x+dr.x,y:sn[0].y+dr.y};
    if(h.x<0||h.y<0||h.x>=18||h.y>=24||sn.some(p=>p.x==h.x&&p.y==h.y)){o.over=1;beep(120,.3);return}
    sn.unshift(h);if(h.x==f.x&&h.y==f.y){o.s+=10;beep(660,.06);f={x:R()*18|0,y:R()*24|0}}else sn.pop()};
  o.d=()=>{sn.forEach((p,i)=>box(p.x*20+10,p.y*20+10,17,17,i?'#22c55e':'#00e5ff'));dot(f.x*20+10,f.y*20+10,8,'#ff2d55')};return o},
memory(){const em=[...'🚀👾🎮💎⚡🔥🎯👑'],cd=[...em,...em].sort(()=>R()-.5);let op=[],dn=new Set(),mv=0,lk=0,o={s:0,lv:1};
  const pos=i=>({x:8+(i%4)*88,y:60+(i/4|0)*88});
  o.c=(px,py)=>{if(lk||o.over)return;const i=(((py-60)/88)|0)*4+(((px-8)/88)|0);if(py<60||i<0||i>15||dn.has(i)||op.includes(i))return;
    op.push(i);beep(500,.05);if(op.length==2){mv++;if(cd[op[0]]==cd[op[1]]){op.forEach(j=>dn.add(j));op=[];o.s+=20;beep(900,.1);if(dn.size==16){o.s+=Math.max(0,100-mv*3);o.over=1}}else{lk=1;setTimeout(()=>{op=[];lk=0},600)}}};
  o.t=()=>{};
  o.d=()=>{X.font='15px system-ui';X.fillStyle='#fff';X.textAlign='left';X.fillText('Moves: '+mv,10,36);cd.forEach((c,i)=>{const p=pos(i),up=op.includes(i)||dn.has(i);X.fillStyle=dn.has(i)?'#12351f':up?'#2a1b5a':'#161630';X.strokeStyle=up?'#00e5ff':'#7c3aed';X.lineWidth=2;X.beginPath();X.roundRect(p.x,p.y,80,80,12);X.fill();X.stroke();if(up){X.font='38px serif';X.textAlign='center';X.fillText(c,p.x+40,p.y+54)}})};return o},
quest(){let p={x:180,y:240},co=[],en=[],o={s:0,lv:1};
  const mk=()=>{co=Array.from({length:3+o.lv},()=>({x:20+R()*320,y:20+R()*440}));en=Array.from({length:1+o.lv},()=>{const a=R()*6.28;return{x:R()<.5?20:340,y:R()*480,vx:Math.cos(a)*(70+o.lv*12),vy:Math.sin(a)*(70+o.lv*12)}})};mk();
  o.t=dt=>{p.x=Math.max(10,Math.min(350,p.x+(K.r-K.l)*200*dt));p.y=Math.max(10,Math.min(470,p.y+(K.d-K.u)*200*dt));
    co=co.filter(c=>{if(Math.hypot(c.x-p.x,c.y-p.y)<20){o.s+=10;beep(880,.06);return 0}return 1});
    en.forEach(n=>{n.x+=n.vx*dt;n.y+=n.vy*dt;if(n.x<8||n.x>352)n.vx*=-1;if(n.y<8||n.y>472)n.vy*=-1;if(Math.hypot(n.x-p.x,n.y-p.y)<19){o.over=1;beep(120,.3)}});
    if(!co.length){o.lv++;o.s+=20;beep(1100,.15);p={x:180,y:240};mk()}};
  o.d=()=>{co.forEach(c=>dot(c.x,c.y,7,'#fbbf24'));en.forEach(n=>dot(n.x,n.y,10,'#ff2d55'));dot(p.x,p.y,10,'#00e5ff')};return o}};
/* ===== Game engine ===== */
let G=null,gid,raf,last=0,paused=false;
function openGame(id){gid=id;const g=GAMES.find(x=>x.id==id);$('#gt').textContent=g.n;$('#help').textContent=g.h;$('.pad').style.visibility=id=='memory'?'hidden':'';
  document.body.classList.add('playing');$('#gm').showModal();start()}
function start(){cancelAnimationFrame(raf);G=maker[gid]();paused=false;$('#pz').textContent='⏸';$('#ov').hidden=true;S.plays++;if(S.plays>=5)award('p5');award('first');save();ui();last=performance.now();raf=requestAnimationFrame(loop)}
function loop(ts){if(!G)return;const dt=Math.min(.05,(ts-last)/1000);last=ts;
  if(!paused&&!G.over)G.t(dt);
  X.textAlign='left';X.fillStyle='#07070d';X.fillRect(0,0,W,H);G.d();
  $('#hud').textContent=`Score ${G.s|0} · Lv ${G.lv}${G.lives!=null?' · ❤'+G.lives:''} · Best ${S.hs[gid]||0}`;
  if(paused){X.fillStyle='#000a';X.fillRect(0,0,W,H);X.fillStyle='#fff';X.font='28px Orbitron,system-ui';X.textAlign='center';X.fillText('PAUSED',180,240)}
  if(G.over&&!G.done){G.done=1;finish()}
  raf=requestAnimationFrame(loop)}
function finish(){const s=G.s|0,nb=s>(S.hs[gid]||0);if(nb)S.hs[gid]=s;if(s>=100)award('s100');const c=Math.floor(s/10);addCoins(c);
  $('#ov').innerHTML=`<h3>${G.lv&&gid=='memory'?'Cleared!':'Game over'}</h3><p>Score ${s}${nb?' · New high score!':''}</p><p>+${c} coins</p><button class="btn" id="again">Play again</button>`;$('#ov').hidden=false;$('#again').onclick=start;beep(nb?1000:200,.3)}
function closeGame(){G=null;cancelAnimationFrame(raf);$('#gm').close();document.body.classList.remove('playing');Object.keys(K).forEach(k=>K[k]=0)}
$('#cl').onclick=closeGame;$('#gm').addEventListener('cancel',e=>{e.preventDefault();closeGame()});
$('#rs').onclick=start;$('#pz').onclick=()=>{paused=!paused;$('#pz').textContent=paused?'▶':'⏸'};
$('#mu').onclick=()=>{S.mute=!S.mute;$('#mu').textContent=S.mute?'🔇':'🔊';save()};
cv.addEventListener('pointerdown',e=>{if(G&&G.c&&!paused){const r=cv.getBoundingClientRect();G.c((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)}});
addEventListener('blur',()=>{if(G&&!paused){paused=true;$('#pz').textContent='▶'}});
/* ===== Page events ===== */
document.addEventListener('click',e=>{
  const p=e.target.closest('[data-play]');if(p)return openGame(p.dataset.play);
  const f=e.target.closest('[data-fav]');if(f){const i=f.dataset.fav,k=S.fav.indexOf(i);k<0?(S.fav.push(i),award('fav')):S.fav.splice(k,1);save();return render()}
  const d=e.target.closest('[data-dlg]');if(d)return $('#'+d.dataset.dlg).showModal();
  if(e.target.closest('[data-close]'))e.target.closest('dialog').close()});
$('#nm').onchange=e=>{S.name=e.target.value.trim().slice(0,14)||'Player';save();ui()};
$('#daily').onclick=()=>{S.lastDaily=new Date().toDateString();award('daily');addCoins(50);toast('+50 coins')};
let rt;$('#rew').onclick=()=>{const d=$('#rwd');d.showModal();$('#rclaim').disabled=true;let n=5;$('#rt').textContent='Reward unlocks in '+n+'s';clearInterval(rt);
  rt=setInterval(()=>{n--;if(n<=0){clearInterval(rt);$('#rt').textContent='Ready to claim.';$('#rclaim').disabled=false}else $('#rt').textContent='Reward unlocks in '+n+'s'},1000)};
$('#rclaim').onclick=()=>{addCoins(25);toast('+25 coins');$('#rwd').close()};
$('#rwd').addEventListener('close',()=>clearInterval(rt));
/* ===== Hero background (lightweight canvas) ===== */
(function(){const c=$('#bg'),x=c.getContext('2d');let w,h,ps=[];const rs=()=>{w=c.width=c.offsetWidth;h=c.height=c.offsetHeight;ps=Array.from({length:Math.min(70,w/10|0)},()=>({x:R()*w,y:R()*h,vx:R()-.5,vy:R()-.5,c:['#00e5ff','#7c3aed','#ff2d55'][R()*3|0]}))};rs();addEventListener('resize',rs);
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  (function f(){x.clearRect(0,0,w,h);ps.forEach((p,i)=>{if(!reduce){p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+h)%h}x.fillStyle=p.c;x.globalAlpha=.8;x.fillRect(p.x,p.y,3,3);for(let j=i+1;j<ps.length;j++){const q=ps[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){x.strokeStyle=p.c;x.globalAlpha=.25*(1-d/110);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}}});requestAnimationFrame(f)})()})();
/* ===== Init ===== */
$('#yr').textContent=new Date().getFullYear();if(S.mute)$('#mu').textContent='🔇';
render();ui();initAds();
addEventListener('load',()=>setTimeout(()=>$('#load').classList.add('off'),500));
