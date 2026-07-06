// Render questionnaire feedback outside index.html to keep the document lightweight.
const voicesContent = document.getElementById("voices-content");
if (voicesContent && window.VOICE_FEEDBACK_HTML) {
  voicesContent.innerHTML = window.VOICE_FEEDBACK_HTML;
}

// bars
const bars=[
 {qn:"Q6",name:"講師講解清晰易懂",v:4.92,tag:"best"},
 {qn:"Q2",name:"課後·適應症認識",v:4.85},
 {qn:"Q3",name:"解剖標誌與切開位置",v:4.77},
 {qn:"Q7",name:"模擬教具輔助練習",v:4.77},
 {qn:"Q8",name:"情境模擬貼近實務",v:4.69},
 {qn:"Q9",name:"講授與實作時間比例",v:4.69},
 {qn:"Q10",name:"整體達成學習目標",v:4.69},
 {qn:"Q5",name:"CICO 處置流程掌握",v:4.38},
 {qn:"Q1",name:"課前·適應症認識",v:4.15},
 {qn:"Q4",name:"獨立執行此術式的信心",v:4.08,tag:"low"},
];
const MIN=4.0,MAX=5.0;
function col(v,tag){ if(tag==="low")return"var(--accent)"; if(v>=4.8)return"var(--teal)"; if(v>=4.55)return"var(--blue)"; return"#5E79A6"; }
const bc=document.getElementById("barchart"),axis=bc.querySelector(".axis");
bars.forEach(b=>{
  const w=((b.v-MIN)/(MAX-MIN))*100;
  const chip=b.tag==="best"?'<span class="chip best">最高</span>':(b.tag==="low"?'<span class="chip low">最低</span>':'');
  const row=document.createElement("div"); row.className="barrow";
  row.innerHTML=`<div class="qname"><span class="qn">${b.qn}</span>${b.name}${chip}</div>
   <div class="btrack"><div class="bfill" data-w="${w.toFixed(1)}%" style="background:${col(b.v,b.tag)}"></div></div>
   <div class="bscore num" style="color:${col(b.v,b.tag)}">${b.v.toFixed(2)}</div>`;
  bc.insertBefore(row,axis);
});

// role comparison
const cmp=[
 {qn:"Q4",name:"獨立執行信心",res:3.88,att:4.40,gap:+0.53},
 {qn:"Q5",name:"CICO 處置流程",res:4.25,att:4.60,gap:+0.35},
 {qn:"Q1",name:"課前適應症認識",res:4.25,att:4.00,gap:-0.25},
 {qn:"Q8",name:"情境貼近實務",res:4.62,att:4.80,gap:+0.18},
 {qn:"Q6",name:"講師講解",res:4.88,att:5.00,gap:+0.12},
 {qn:"Q2",name:"課後適應症認識",res:4.88,att:4.80,gap:-0.08},
];
const cc=document.getElementById("cmpchart");
function cmpWidth(v){
  const scaled=((v-MIN)/(MAX-MIN))*100;
  return Math.max(8, Math.min(100, scaled));
}
cmp.forEach(c=>{
  const wr=cmpWidth(c.res), wa=cmpWidth(c.att);
  const gt=c.gap>0?`<span class="gaptag pos">主治高 +${c.gap.toFixed(2)}</span>`:`<span class="gaptag neg">住院高 +${Math.abs(c.gap).toFixed(2)}</span>`;
  const row=document.createElement("div"); row.className="cmprow";
  row.innerHTML=`<div class="cl"><span class="qn">${c.qn}</span>${c.name}${gt}</div>
   <div class="cbar r"><div class="ct"><div class="cf res" data-w="${wr.toFixed(1)}%"></div></div><div class="cv res num">${c.res.toFixed(2)}</div></div>
   <div class="cbar a"><div class="ct"><div class="cf att" data-w="${wa.toFixed(1)}%"></div></div><div class="cv att num">${c.att.toFixed(2)}</div></div>`;
  cc.appendChild(row);
});

// filter
const chips=document.querySelectorAll(".fchip"), themes=document.querySelectorAll(".theme");
chips.forEach(ch=>ch.addEventListener("click",()=>{
  chips.forEach(x=>x.classList.remove("on")); ch.classList.add("on");
  const f=ch.dataset.f;
  themes.forEach(t=>t.classList.toggle("hide", f!=="all" && t.dataset.cat!==f));

  // On small screens the sticky filter can leave the user looking at empty space
  // after cards are hidden. Move the first visible card back into view.
  if (window.matchMedia("(max-width: 860px)").matches) {
    const target = f === "all" ? document.getElementById("voices-content") : document.querySelector(`.theme[data-cat="${f}"]`);
    target?.scrollIntoView({behavior:"smooth", block:"start"});
  }
}));

// count up
function countUp(el){
  const t=parseFloat(el.dataset.count), dec=(el.dataset.count.split(".")[1]||"").length;
  const pre=el.dataset.prefix||"", suf=el.dataset.suffix||""; let s=null,D=1100;
  function step(ts){ if(!s)s=ts; const p=Math.min((ts-s)/D,1), e=1-Math.pow(1-p,3);
    el.textContent=pre+(t*e).toFixed(dec)+suf; if(p<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
}

// reveal + fills
function revealBlock(el){
  el.classList.add("in");
  el.querySelectorAll("[data-w]").forEach(f=>f.style.width=f.dataset.w);
}
if ("IntersectionObserver" in window) {
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){
    revealBlock(en.target);
    io.unobserve(en.target);}}),{threshold:.12});
  document.querySelectorAll(".rv").forEach(el=>io.observe(el));
} else {
  document.querySelectorAll(".rv").forEach(revealBlock);
}

// scrollspy
const secIds=["top","growth","scores","finding","voices"];
const navlinks=document.getElementById("navlinks");
const navmap={}; document.querySelectorAll(".nav a").forEach(a=>navmap[a.dataset.sec]=a);
function setActiveNav(id){
  const active=navmap[id];
  if(!active || active.classList.contains("active")) return;
  Object.values(navmap).forEach(a=>a.classList.remove("active"));
  active.classList.add("active");
  if(navlinks){
    const left=active.offsetLeft-(navlinks.clientWidth-active.offsetWidth)/2;
    navlinks.scrollTo({left:Math.max(0,left),behavior:"smooth"});
  }
}
const spy=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){
  setActiveNav(en.target.id==="top"?"top":en.target.id);
}}),{rootMargin:"-45% 0px -50% 0px"});
secIds.forEach(id=>{const e=document.getElementById(id); if(e)spy.observe(e);});

window.addEventListener("load",()=>{
  document.querySelectorAll(".kpi .kv").forEach(countUp);
  setTimeout(()=>document.querySelectorAll(".hero [data-w]").forEach(f=>f.style.width=f.dataset.w),250);

  // Mobile browsers can occasionally miss the first IntersectionObserver callback
  // after dynamic content is injected, which leaves sections at opacity:0.
  // Reveal any remaining blocks as a safety net so feedback never appears blank.
  setTimeout(()=>document.querySelectorAll(".rv:not(.in)").forEach(revealBlock),900);
});
