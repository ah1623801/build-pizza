export function initApp() {
  if (typeof window === 'undefined') return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Lenis = window.Lenis;

  if (!gsap || !ScrollTrigger || !Lenis) {
    // إعادة المحاولة في حال لم يتم تحميل السكربتات الخارجية بعد
    setTimeout(initApp, 100);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ================= بداية كود الـ Vanilla JS الأصلي بالملي =================
  function setAppHeight(){
    document.documentElement.style.setProperty('--apph',window.innerHeight+'px');
  }
  setAppHeight();
  window.addEventListener('resize',setAppHeight);
  window.addEventListener('orientationchange',()=>setTimeout(setAppHeight,150));
  /* ================= HELPERS ================= */
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const rand=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[(Math.random()*a.length)|0];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);};
  const loadImg=u=>new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=rej;i.src=u;});
  let _uid=0; const nid=p=>p+(++_uid);
  /* ================= IMAGES (DOUGH ONLY) ================= */
  const P='https://image.qwenlm.ai/public_source/dc6c2b4d-a883-49e5-8fdc-ae104a79b739/';
  const IMG={
   doughClassic:P+'1bc611059-4b78-4fa5-a8e4-f7118cc86e72.png', doughThin:P+'1eea1066c-be41-47f7-abe3-aa268e4d37db.png',
   doughThick:P+'1e2412efa-95be-4821-99ab-c23e199c37d4.png', doughCheese:P+'13760ad57-767c-4c90-a5dd-71af6ff535f8.png',
   table:P+'110370452-bfec-426a-ab1a-a9bbc63881b3.png', fire:P+'1b4990fe0-1764-4ee3-983a-5650bfa908e9.png',
   pTruffle:P+'174f27d7e-c7df-4a9d-a694-ba944d7d0ad5.png', pBBQ:P+'186044168-cf4d-4b48-a2ad-a7302f181b81.png',
   pGreen:P+'1d09c168e-1f1c-4f6d-82d2-38857089ef6f.png', pMarg:P+'159cb951d-fd66-4b13-a24d-4bd5dc71c4e6.png',
   pOriginal:P+'1dc5fbcdf-abfc-4041-af24-57397c1bd986.png'
  };
  $('#burgerBtn').addEventListener('click',()=>{
    $('#mmSavedCount').textContent=saved.length;
    document.body.classList.add('mm-open');
  });
  $('#mMenuOverlay').addEventListener('click',()=>document.body.classList.remove('mm-open'));
  $$('#mMenu button[data-go]').forEach(b=>b.addEventListener('click',()=>{
    document.body.classList.remove('mm-open');
    if(lenis)lenis.scrollTo(b.dataset.go,{offset:-40});
  }));
  $('#mmSaved').addEventListener('click',()=>{
    document.body.classList.remove('mm-open');
    openSaved();
  });
  
  $('#mMenuClose').addEventListener('click',()=>document.body.classList.remove('mm-open'));
  let DOUGH_SRC={thin:IMG.doughThin,classic:IMG.doughClassic,thick:IMG.doughThick,cheese:IMG.doughCheese};
  /* black-background removal for the dough photos */
  async function cutout(url){
    try{
      const img=await loadImg(url);
      const W=img.naturalWidth,H=img.naturalHeight,N=W*H;
      const cv=document.createElement('canvas');cv.width=W;cv.height=H;
      const cx=cv.getContext('2d',{willReadFrequently:true});
      cx.drawImage(img,0,0);
      const d=cx.getImageData(0,0,W,H),px=d.data;
      const L=new Float32Array(N);
      for(let i=0,p=0;p<N;i+=4,p++)L[p]=.299*px[i]+.587*px[i+1]+.114*px[i+2];
      const Tbg=70,Tfr=115;
      const bg=new Uint8Array(N),st=[];
      const push=p=>{if(!bg[p]&&L[p]<Tbg){bg[p]=1;st.push(p);}};
      for(let x=0;x<W;x++){push(x);push((H-1)*W+x);}
      for(let y=0;y<H;y++){push(y*W);push(y*W+W-1);}
      while(st.length){
        const p=st.pop(),x=p%W;
        if(x>0){const q=p-1;if(!bg[q]&&L[q]<Tbg){bg[q]=1;st.push(q);}}
        if(x<W-1){const q=p+1;if(!bg[q]&&L[q]<Tbg){bg[q]=1;st.push(q);}}
        if(p>=W){const q=p-W;if(!bg[q]&&L[q]<Tbg){bg[q]=1;st.push(q);}}
        if(p<N-W){const q=p+W;if(!bg[q]&&L[q]<Tbg){bg[q]=1;st.push(q);}}
      }
      for(let pass=0;pass<3;pass++){
        const add=[];
        for(let y=0;y<H;y++)for(let x=0;x<W;x++){
          const p=y*W+x;
          if(bg[p]||L[p]>=Tfr)continue;
          if((x>0&&bg[p-1])||(x<W-1&&bg[p+1])||(y>0&&bg[p-W])||(y<H-1&&bg[p+W]))add.push(p);
        }
        if(!add.length)break;
        for(const p of add)bg[p]=1;
      }
      let al=new Float32Array(N);
      for(let p=0;p<N;p++)al[p]=bg[p]?0:1;
      const blur=src=>{
        const out=new Float32Array(N);
        for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
          const p=y*W+x;let s=0;
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)s+=src[p+dy*W+dx];
          out[p]=s/9;
        }
        for(let x=0;x<W;x++){out[x]=src[x];out[(H-1)*W+x]=src[(H-1)*W+x];}
        for(let y=0;y<H;y++){out[y*W]=src[y*W];out[y*W+W-1]=src[y*W+W-1];}
        return out;
      };
      al=blur(blur(al));
      for(let i=0,p=0;p<N;i+=4,p++)px[i+3]=Math.round(px[i+3]*al[p]);
      cx.putImageData(d,0,0);
      return cv.toDataURL('image/png');
    }catch(e){return url;}
  }
  /* ================= SVG GEOMETRY ================= */
  function wobbleCircle(cx,cy,r,pts,jag){
    pts=pts||14;jag=jag==null?.06:jag;
    const p=[];
    for(let i=0;i<pts;i++){const a=i/pts*Math.PI*2;const rr=r*(1-jag+rand(0,2*jag));p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    let d='';
    for(let i=0;i<pts;i++){
      const p0=p[(i-1+pts)%pts],p1=p[i],p2=p[(i+1)%pts],p3=p[(i+2)%pts];
      if(i===0)d+='M '+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' ';
      const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
      const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
      d+='C '+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' ';
    }
    return d+'Z';
  }
  function mkSVG(vb,body){
    const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
    s.setAttribute('viewBox','0 0 '+vb+' '+vb);
    s.innerHTML=body;
    return s;
  }
  function speckles(cx,cy,r,n,cmin,cmax,color,op){
    let out='';
    for(let i=0;i<n;i++){
      const a=Math.random()*6.283,rr=Math.sqrt(Math.random())*r;
      out+='<circle cx="'+(cx+Math.cos(a)*rr).toFixed(1)+'" cy="'+(cy+Math.sin(a)*rr).toFixed(1)+'" r="'+rand(cmin,cmax).toFixed(1)+'" fill="'+color+'" opacity="'+rand(op*.5,op).toFixed(2)+'"/>';
    }
    return out;
  }
  /* ================= SVG INGREDIENT FACTORIES ================= */
  function sauceSVG(type){
    const conf={tomato:{c1:'#e6452a',c2:'#b02412',c3:'#8a180b',herb:1},spicy:{c1:'#e23018',c2:'#a81708',c3:'#7e1006',herb:1,flakes:1},bbq:{c1:'#7a3413',c2:'#4a1c07',c3:'#2f1006',gloss:1},garlic:{c1:'#f4e8ca',c2:'#e2cda0',c3:'#c9ad76',herb:1}}[type];
    const gid=nid('sg'),gl=nid('gl'),fid=nid('sf');
    let body='<defs><radialGradient id="'+gid+'" cx="45%" cy="42%" r="68%">'
      +'<stop offset="0%" stop-color="'+conf.c1+'"/><stop offset="68%" stop-color="'+conf.c2+'"/><stop offset="100%" stop-color="'+conf.c3+'"/></radialGradient>'
      +'<radialGradient id="'+gl+'"><stop offset="0%" stop-color="rgba(255,255,255,.32)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>'
      +'<filter id="'+fid+'" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="'+((Math.random()*100)|0)+'" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter></defs>'
      +'<g filter="url(#'+fid+')">'
      +'<path d="'+wobbleCircle(100,100,78,16,.05)+'" fill="url(#'+gid+')"/>'
      +'<path d="'+wobbleCircle(100,100,78,16,.05)+'" fill="none" stroke="rgba(40,8,2,.35)" stroke-width="2.5"/>'
      +speckles(100,100,70,26,.8,2.4,type==='garlic'?'#b28a4a':'#5f1004',.3);
    if(conf.herb)body+=speckles(100,100,66,16,.7,1.6,'#3a6b2a',.55);
    if(conf.flakes)body+=speckles(100,100,66,12,1,2.2,'#8f1a0c',.8);
    body+='</g>';
    body+='<circle cx="76" cy="70" r="34" fill="url(#'+gl+')"/>';
    if(conf.gloss)body+='<circle cx="122" cy="118" r="24" fill="url(#'+gl+')" opacity=".7"/>';
    return mkSVG(200,body);
  }
  function mozSliceSVG(variant){
    const pal=[
      ['#fdfaf1','#f9f3e0','#f6eed3','#fffdf6'],
      ['#f9f1cf','#f4e8b8','#eddc9e','#fffbe6'],
      ['#efe0b4','#e3cf96','#d6bd82','#f7ecc9']
    ][variant||0];
    const rot=rand(0,360).toFixed(0);
    let out='';
    const n=4+((Math.random()*3)|0);
    for(let i=0;i<n;i++){
      const x=rand(18,82),y=rand(18,82),a=rand(0,6.283),len=rand(28,58);
      const x2=clamp(x+Math.cos(a)*len,6,94),y2=clamp(y+Math.sin(a)*len,6,94);
      const mx=(x+x2)/2+rand(-14,14),my=(y+y2)/2+rand(-14,14);
      const d='M '+x.toFixed(1)+' '+y.toFixed(1)+' Q '+mx.toFixed(1)+' '+my.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1);
      const w=rand(5,9),c=pick(pal);
      out+='<path d="'+d+'" fill="none" stroke="rgba(110,90,50,.28)" stroke-width="'+(w+1.6).toFixed(1)+'" stroke-linecap="round" transform="translate(0 1.4)"/>';
      out+='<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w.toFixed(1)+'" stroke-linecap="round"/>';
      out+='<path d="'+d+'" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="'+(w*.32).toFixed(1)+'" stroke-linecap="round" transform="translate(0 -'+(w*.2).toFixed(1)+')"/>';
    }
    return mkSVG(100,'<g transform="rotate('+rot+' 50 50)">'+out+'</g>');
  }
  function meltSVG(){
    const gid=nid('ml'),spot=nid('sp'),gl=nid('mg'),fid=nid('mf');
    let spots='';
    for(let i=0;i<22;i++){
      const a=Math.random()*6.283,r=Math.sqrt(Math.random())*66;
      spots+='<circle cx="'+(100+Math.cos(a)*r).toFixed(1)+'" cy="'+(100+Math.sin(a)*r).toFixed(1)+'" r="'+rand(3,9).toFixed(1)+'" fill="url(#'+spot+')" opacity="'+rand(.4,.85).toFixed(2)+'"/>';
    }
    let peeks='';
    for(let i=0;i<14;i++){
      const a=Math.random()*6.283,r=Math.sqrt(Math.random())*60;
      peeks+='<circle cx="'+(100+Math.cos(a)*r).toFixed(1)+'" cy="'+(100+Math.sin(a)*r).toFixed(1)+'" r="'+rand(3,6).toFixed(1)+'" fill="#9c1f0e" opacity=".3"/>';
    }
    let gloss='';
    for(let i=0;i<5;i++){
      const a=Math.random()*6.283,r=Math.sqrt(Math.random())*50;
      gloss+='<ellipse cx="'+(100+Math.cos(a)*r).toFixed(1)+'" cy="'+(100+Math.sin(a)*r).toFixed(1)+'" rx="'+rand(12,20).toFixed(1)+'" ry="'+rand(3,6).toFixed(1)+'" fill="url(#'+gl+')" transform="rotate('+rand(-60,60).toFixed(0)+' 100 100)"/>';
    }
    return mkSVG(200,
     '<defs>'
   +'<radialGradient id="'+gid+'" cx="46%" cy="42%" r="66%"><stop offset="0%" stop-color="#f9edbe"/><stop offset="45%" stop-color="#f0d795"/><stop offset="78%" stop-color="#e5c078"/><stop offset="100%" stop-color="#d3a355"/></radialGradient>'   +'<radialGradient id="'+spot+'"><stop offset="0%" stop-color="#8a3d12"/><stop offset="70%" stop-color="rgba(138,61,18,.5)"/><stop offset="100%" stop-color="rgba(138,61,18,0)"/></radialGradient>'
     +'<radialGradient id="'+gl+'"><stop offset="0%" stop-color="rgba(255,255,255,.34)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>'
     +'<filter id="'+fid+'" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="'+((Math.random()*100)|0)+'" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8"/></filter>'
     +'</defs>'
     +'<g filter="url(#'+fid+')">'
     +'<path d="'+wobbleCircle(100,100,68,18,.06)+'" fill="url(#'+gid+')"/>'
     +peeks+spots
     +'</g>'+gloss);
  }
  function pepperoniSVG(){
    const gid=nid('pe');
    const path=wobbleCircle(50,50,42,12,.06);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="44%" cy="40%" r="68%"><stop offset="0%" stop-color="#e0523a"/><stop offset="60%" stop-color="#b02a18"/><stop offset="100%" stop-color="#7e150c"/></radialGradient></defs>'
     +'<path d="'+path+'" fill="url(#'+gid+')"/>'
     +'<path d="'+path+'" fill="none" stroke="#641008" stroke-width="3" opacity=".85"/>'
     +speckles(50,50,30,8,2,3.6,'#f0b39c',.95)
     +speckles(50,50,34,4,1.2,2.2,'#5f0f06',.9)
     +'<ellipse cx="40" cy="36" rx="12" ry="6" fill="rgba(255,255,255,.13)" transform="rotate(-20 40 36)"/>');
  }
  function beefSVG(){
    const gid=nid('bf');
    const path=wobbleCircle(50,50,36,8,.22);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="40%" cy="36%" r="72%"><stop offset="0%" stop-color="#8a5230"/><stop offset="60%" stop-color="#5c2f16"/><stop offset="100%" stop-color="#421f0d"/></radialGradient></defs>'
     +'<path d="'+path+'" fill="url(#'+gid+')"/>'
     +'<path d="'+path+'" fill="none" stroke="rgba(30,12,4,.5)" stroke-width="2"/>'
     +'<path d="M 28 34 Q 44 24 62 30" fill="none" stroke="rgba(255,215,170,.3)" stroke-width="3" stroke-linecap="round"/>'
     +speckles(50,54,24,5,1,2,'#2e1305',.85));
  }
  function chickenSVG(){
    const gid=nid('ch'),cid=nid('chc');
    const path=wobbleCircle(50,50,38,9,.16);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#f0d2a0"/><stop offset="60%" stop-color="#d3a76b"/><stop offset="100%" stop-color="#b5814a"/></radialGradient>'
     +'<clipPath id="'+cid+'"><path d="'+path+'"/></clipPath></defs>'
     +'<path d="'+path+'" fill="url(#'+gid+')"/>'
     +'<g clip-path="url(#'+cid+')" transform="rotate(18 50 50)">'
     +'<line x1="20" y1="38" x2="82" y2="38" stroke="#7c4a20" stroke-width="4.5" opacity=".55" stroke-linecap="round"/>'
     +'<line x1="16" y1="52" x2="86" y2="52" stroke="#7c4a20" stroke-width="4.5" opacity=".55" stroke-linecap="round"/>'
     +'<line x1="20" y1="66" x2="80" y2="66" stroke="#7c4a20" stroke-width="4.5" opacity=".5" stroke-linecap="round"/>'
     +'</g>'
     +'<path d="'+path+'" fill="none" stroke="rgba(120,70,30,.4)" stroke-width="2"/>'
     +'<ellipse cx="40" cy="34" rx="11" ry="6" fill="rgba(255,255,255,.22)"/>');
  }
  function sausageSVG(){
    const gid=nid('sa');
    const path=wobbleCircle(50,50,40,11,.05);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#9a5a30"/><stop offset="62%" stop-color="#6e3519"/><stop offset="100%" stop-color="#4f2210"/></radialGradient></defs>'
     +'<path d="'+path+'" fill="url(#'+gid+')"/>'
     +'<path d="'+path+'" fill="none" stroke="#3e1a0a" stroke-width="2.4" opacity=".85"/>'
     +speckles(50,50,28,7,1.4,2.6,'#e6c08f',.9)
     +'<ellipse cx="40" cy="35" rx="11" ry="5.5" fill="rgba(255,235,200,.2)"/>');
  }
  function oliveSVG(){
    const gid=nid('ol');
    const outer=wobbleCircle(50,50,38,10,.05);
    const inner=wobbleCircle(50,50,14,8,.12);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="40%" cy="36%" r="70%"><stop offset="0%" stop-color="#4a3c34"/><stop offset="70%" stop-color="#241a14"/><stop offset="100%" stop-color="#150e0a"/></radialGradient></defs>'
     +'<path d="'+outer+' '+inner+'" fill="url(#'+gid+')" fill-rule="evenodd"/>'
     +'<circle cx="50" cy="50" r="14" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="2"/>'
     +'<path d="M 28 30 A 30 30 0 0 1 46 20" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/>');
  }
  function mushroomSVG(){
    const gid=nid('mu');
    return mkSVG(100,
     '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2e7d2"/><stop offset="70%" stop-color="#dcc9a6"/><stop offset="100%" stop-color="#c9b18a"/></linearGradient></defs>'
     +'<path d="M 15 54 Q 14 18 50 15 Q 86 18 85 54 L 64 54 L 63 77 Q 50 86 37 77 L 36 54 Z" fill="url(#'+gid+')"/>'
     +'<path d="M 15 54 Q 14 18 50 15 Q 86 18 85 54 L 64 54 L 63 77 Q 50 86 37 77 L 36 54 Z" fill="none" stroke="rgba(120,95,60,.35)" stroke-width="2"/>'
     +'<g stroke="#b0977a" stroke-width="2" opacity=".8" stroke-linecap="round">'
     +'<line x1="26" y1="52" x2="30" y2="42"/><line x1="36" y1="53" x2="38" y2="41"/><line x1="50" y1="53" x2="50" y2="40"/><line x1="64" y1="53" x2="62" y2="41"/><line x1="74" y1="52" x2="70" y2="42"/>'
     +'</g>');
  }
  function onionSVG(){
    const outer=wobbleCircle(50,50,40,10,.06);
    const inner=wobbleCircle(50,50,27,10,.07);
    return mkSVG(100,
     '<path d="'+outer+' '+inner+'" fill="rgba(226,190,220,.55)" fill-rule="evenodd" stroke="rgba(170,80,150,.55)" stroke-width="1.6"/>'
     +'<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.6"/>');
  }
  function greenPepperSVG(){
    const gid=nid('gp');
    return mkSVG(100,
     '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#57a84f"/><stop offset="100%" stop-color="#2f7a30"/></linearGradient></defs>'
     +'<circle cx="50" cy="50" r="33" fill="none" stroke="url(#'+gid+')" stroke-width="12" stroke-linecap="round" stroke-dasharray="72 26 64 45"/>'
     +'<circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="40 60 50 57"/>');
  }
  function jalapenoSVG(){
    const gid=nid('ja');
    const outer=wobbleCircle(50,50,36,10,.06);
    const inner=wobbleCircle(50,50,19,9,.1);
    let seeds='';
    for(let i=0;i<6;i++){
      const a=rand(0,6.283),rr=rand(23,29);
      seeds+='<circle cx="'+(50+Math.cos(a)*rr).toFixed(1)+'" cy="'+(50+Math.sin(a)*rr).toFixed(1)+'" r="'+rand(1.6,2.4).toFixed(1)+'" fill="#f4ecc0"/>';
    }
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="#62a442"/><stop offset="100%" stop-color="#3c7a26"/></radialGradient></defs>'
     +'<path d="'+outer+' '+inner+'" fill="url(#'+gid+')" fill-rule="evenodd" stroke="rgba(30,70,15,.5)" stroke-width="1.6"/>'
     +seeds
     +'<path d="M 30 26 A 28 28 0 0 1 48 18" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2.5" stroke-linecap="round"/>');
  }
  function cornSVG(){
    const gid=nid('co');
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="42%" cy="34%" r="75%"><stop offset="0%" stop-color="#ffdf6b"/><stop offset="70%" stop-color="#f2b93c"/><stop offset="100%" stop-color="#e0992a"/></radialGradient></defs>'
     +'<rect x="30" y="26" width="40" height="48" rx="15" fill="url(#'+gid+')" transform="rotate('+rand(-14,14).toFixed(0)+' 50 50)"/>'
     +'<ellipse cx="43" cy="38" rx="7" ry="5" fill="rgba(255,255,255,.5)"/>');
  }
  function basilSVG(){
    const gid=nid('ba');
    return mkSVG(100,
     '<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#46a04a"/><stop offset="100%" stop-color="#1e5c28"/></linearGradient></defs>'
     +'<path d="M 50 12 C 74 20 84 44 78 66 C 72 84 58 92 50 92 C 42 92 28 84 22 66 C 16 44 26 20 50 12 Z" fill="url(#'+gid+')"/>'
     +'<path d="M 50 16 L 50 88" stroke="#a8d5a0" stroke-width="2" opacity=".55"/>'
     +'<g stroke="#a8d5a0" stroke-width="1.4" opacity=".4" stroke-linecap="round">'
     +'<path d="M 50 34 Q 62 38 68 48" fill="none"/><path d="M 50 34 Q 38 38 32 48" fill="none"/>'
     +'<path d="M 50 54 Q 63 58 68 66" fill="none"/><path d="M 50 54 Q 37 58 32 66" fill="none"/></g>'
     +'<ellipse cx="42" cy="30" rx="9" ry="5" fill="rgba(255,255,255,.16)" transform="rotate(-24 42 30)"/>');
  }
  function chiliSVG(){
    const c=pick(['#c22915','#931a0a','#e04a20','#a82210']);
    const pts=[];
    for(let i=0;i<5;i++){const a=i/5*6.283+rand(-.4,.4);const r=rand(16,34);pts.push((50+Math.cos(a)*r).toFixed(1)+','+(50+Math.sin(a)*r).toFixed(1));}
    return mkSVG(100,'<polygon points="'+pts.join(' ')+'" fill="'+c+'" transform="rotate('+rand(0,360).toFixed(0)+' 50 50)"/>');
  }
  function garlicSVG(){
    const gid=nid('ga');
    const path=wobbleCircle(50,50,30,7,.3);
    return mkSVG(100,
     '<defs><radialGradient id="'+gid+'" cx="40%" cy="35%" r="75%"><stop offset="0%" stop-color="#f8efd2"/><stop offset="100%" stop-color="#dcc08e"/></radialGradient></defs>'
     +'<path d="'+path+'" fill="url(#'+gid+')" stroke="rgba(183,141,78,.45)" stroke-width="1.6"/>');
  }
  const SVGF={pepperoni:pepperoniSVG,beef:beefSVG,chicken:chickenSVG,sausage:sausageSVG,olives:oliveSVG,mushroom:mushroomSVG,onion:onionSVG,greenPepper:greenPepperSVG,jalapeno:jalapenoSVG,corn:cornSVG,basil:basilSVG,chili:chiliSVG,garlic:garlicSVG,extraCheese:()=>mozSliceSVG(0)};
  /* ================= CONFIG ================= */
  const DOUGH=[{id:'thin',name:'THIN CRUST',desc:'Light and crispy',price:0},{id:'classic',name:'CLASSIC',desc:'Our signature dough',price:0},{id:'thick',name:'THICK CRUST',desc:'Soft and fluffy',price:20},{id:'cheese',name:'CHEESE CRUST',desc:'Stuffed with mozzarella',price:35}];
  const SAUCE=[{id:'tomato',name:'TOMATO',desc:'Classic tomato sauce',price:0},{id:'spicy',name:'SPICY TOMATO',desc:'Tomato + chili',price:10},{id:'bbq',name:'BBQ',desc:'Smoky BBQ sauce',price:15},{id:'garlic',name:'GARLIC CREAM',desc:'Creamy garlic sauce',price:20}];
  const CHEESE=[{id:'mozzarella',name:'MOZZARELLA',desc:'Fresh slices, uncooked',price:25},{id:'extra',name:'EXTRA MOZZARELLA',desc:'Double the pull',price:40},{id:'four',name:'FOUR CHEESE',desc:'Mozz · cheddar · parm · gouda',price:55},{id:'smoked',name:'SMOKED CHEESE',desc:'Low & slow smoked',price:45}];
  const MEAT=[{id:'pepperoni',name:'PEPPERONI',price:45},{id:'beef',name:'BEEF',price:50},{id:'chicken',name:'CHICKEN',price:45},{id:'sausage',name:'SAUSAGE',price:40}];
  const VEG=[{id:'olives',name:'OLIVES',price:15},{id:'mushroom',name:'MUSHROOM',price:20},{id:'onion',name:'ONION',price:12},{id:'greenPepper',name:'GREEN PEPPER',price:15},{id:'jalapeno',name:'JALAPEÑO',price:18},{id:'corn',name:'CORN',price:12},{id:'basil',name:'BASIL',price:10}];
  const EXTRAS=[{id:'extraCheese',name:'EXTRA CHEESE',price:30},{id:'chili',name:'CHILI FLAKES',price:10},{id:'garlic',name:'GARLIC',price:10},{id:'truffle',name:'TRUFFLE OIL',price:35}];
  const DRIZZLES=['ketchup','bbqDrizzle','truffle'];
  const TOPCFG={
   pepperoni:{size:.145,kind:'meat',dist:'phy',counts:{less:8,normal:12,more:18},anim:{dur:.7,spin:160,bounce:true}},
   beef:{size:.10,kind:'meat',dist:'phy',counts:{less:10,normal:15,more:21},anim:{dur:.65,spin:90,bounce:true}},
   chicken:{size:.115,kind:'meat',dist:'phy',counts:{less:9,normal:13,more:19},anim:{dur:.7,spin:120}},
   sausage:{size:.12,kind:'meat',dist:'phy',counts:{less:8,normal:12,more:18},anim:{dur:.7,spin:100}},
   olives:{size:.07,kind:'veg',dist:'phy',fixed:8,anim:{dur:.55,roll:true}},
   mushroom:{size:.11,kind:'veg',dist:'phy',fixed:7,anim:{dur:.75,spin:60}},
   onion:{size:.12,kind:'veg',dist:'phy',fixed:6,anim:{dur:1.05,float:true}},
   greenPepper:{size:.115,kind:'veg',dist:'phy',fixed:7,anim:{dur:.7,spin:80}},
   jalapeno:{size:.09,kind:'veg',dist:'phy',fixed:8,anim:{dur:.6,spin:260,bounce:true}},
   corn:{size:.045,kind:'veg',fixed:22,shadow:false,anim:{dur:.4,spin:40,rapid:true}},
   basil:{size:.13,kind:'veg',dist:'phy',fixed:6,anim:{dur:1.35,float:true}},
   chili:{size:.035,kind:'veg',fixed:26,shadow:false,anim:{dur:.45,rapid:true}},
   garlic:{size:.05,kind:'veg',fixed:16,shadow:false,anim:{dur:.5}},
   extraCheese:{size:.17,kind:'cheese',dist:'phy',fixed:8,layer:'cheese',anim:{dur:.6,bounce:true}}
  };
  const CHEESE_CFG={mozzarella:{n:22,v:0},extra:{n:32,v:0},four:{n:26,v:1},smoked:{n:24,v:2}};
  const CHEESE_SIZE=.19;
  const F_RAW='sepia(0) saturate(1) brightness(1) contrast(1) hue-rotate(0deg)';
  const F_DOUGH_C='sepia(0.65) saturate(1.55) brightness(0.92) contrast(1.22) hue-rotate(-8deg)';
  const F_TOP_C='sepia(0.3) saturate(1.15) brightness(0.82) contrast(1.12) hue-rotate(0deg)';
  const F_VEG_C='sepia(0.2) saturate(0.95) brightness(0.85) contrast(1.08) hue-rotate(0deg)';
  const F_SAUCE_C='sepia(0.2) saturate(1.35) brightness(0.78) contrast(1.05) hue-rotate(-6deg)';
  
  /* ================= DISTRIBUTION (real scatter) ================= */
  function scatterPoints(n,o){
    o=o||{};
    const rMax=o.rMax!=null?o.rMax:.72, minD=o.minD!=null?o.minD:.12, rMin=o.rMin!=null?o.rMin:.05;
    const occ=o.occ||[];
    const pts=[];
    for(let i=0;i<n;i++){
      let best=null,bestND=-1;
      for(let t=0;t<64;t++){
        const a=Math.random()*Math.PI*2;
        const r=rMin+Math.sqrt(Math.random())*(rMax-rMin);
        const x=Math.cos(a)*r,y=Math.sin(a)*r;
        let nd=Infinity;
        const all=occ.concat(pts);
        for(const p of all){const dx=p.x-x,dy=p.y-y;const d2=dx*dx+dy*dy;if(d2<nd)nd=d2;}
        if(nd>=minD){best={x,y};break;}
        if(nd>bestND){bestND=nd;best={x,y};}
      }
      pts.push(best);
    }
    for(let pass=0;pass<3;pass++){
      for(const p of pts){
        for(const q of pts){
          if(p===q)continue;
          const dx=p.x-q.x,dy=p.y-q.y;
          const d=Math.hypot(dx,dy)||.001;
          const want=minD*.72;
          if(d<want){const f=(want-d)/d*.5;p.x+=dx*f;p.y+=dy*f;}
        }
        const r=Math.hypot(p.x,p.y);
        if(r>rMax){p.x*=rMax/r;p.y*=rMax/r;}
        if(r<rMin&&r>0){p.x*=rMin/r;p.y*=rMin/r;}
      }
    }
    return pts.map(p=>({x:p.x,y:p.y,rot:rand(-170,170),s:rand(.85,1.2)}));
  }
  
  const GOLDEN=Math.PI*(3-Math.sqrt(5));
  function phyPoints(n,o){
    o=o||{};
    const rMax=o.rMax!=null?o.rMax:.66;
    const rot0=rand(0,6.283),jA=.26,jR=.045;
    const pts=[];
    for(let i=0;i<n;i++){
      const r=rMax*Math.sqrt((i+.5)/n);
      const a=rot0+i*GOLDEN+rand(-jA,jA);
      const rr=Math.max(.02,r+rand(-jR,jR)*rMax);
      pts.push({x:Math.cos(a)*rr,y:Math.sin(a)*rr});
    }
    return pts;
  }
  function resolvePts(raw,o){
    const minD=o.minD||.12,occ=o.occ||[],rB=o.rBound||.74;
    const placed=[],out=[];
    for(const p of raw){
      let best=null,bestNd=-1;
      for(let k=0;k<12;k++){
        const c=k===0?{x:p.x,y:p.y}:{x:p.x+Math.cos(rand(0,6.283))*rand(.02,minD*1.5),y:p.y+Math.sin(rand(0,6.283))*rand(.02,minD*1.5)};
        let nd=Infinity;
        for(const q of occ){const d=Math.hypot(q.x-c.x,q.y-c.y);if(d<nd)nd=d;}
        for(const q of placed){const d=Math.hypot(q.x-c.x,q.y-c.y);if(d<nd)nd=d;}
        const r=Math.hypot(c.x,c.y);
        if(r>rB)nd-=(r-rB)*2;
        if(k===0)nd+=.015;
        if(nd>bestNd){bestNd=nd;best=c;}
      }
      const r=Math.hypot(best.x,best.y);
      if(r>rB)best={x:best.x*rB/r,y:best.y*rB/r};
      placed.push(best);
      out.push({x:best.x,y:best.y,rot:rand(-170,170),s:rand(.85,1.2)});
    }
    return out;
  }
  
  function wavyPath(){
    let y=rand(16,84);let d='M -4 '+y.toFixed(1);
    const seg=5,step=108/seg;
    for(let i=1;i<=seg;i++){
      const nx=-4+step*i, ny=clamp(y+rand(-14,14),8,92);
      d+=' Q '+(-4+step*(i-.5)).toFixed(1)+' '+(y+rand(-10,10)).toFixed(1)+' '+nx.toFixed(1)+' '+ny.toFixed(1);
      y=ny;
    }
    return d;
  }
  function dropPiece(st,el,p,cfg,speed,idx){
     const a=(window.innerWidth<=980)?{dur:.62,bounce:true}:(cfg.anim||{});
    const H=st.el.clientHeight||420;
    gsap.set(el,{xPercent:-50,yPercent:-50});
    if(speed<=0){gsap.set(el,{rotation:p.rot});return;}
    const dur=(a.dur||.7)*(0.8+Math.random()*.6)*speed;
    const tl=gsap.timeline({delay:((idx||0)*(a.rapid?.03:.055)+Math.random()*.12)*speed});
    tl.fromTo(el,{y:-H*(0.75+Math.random()*.5),x:rand(-.1,.1)*H,rotation:p.rot+(a.spin||120)*(Math.random()<.5?-2:2),scale:1.06},
      {y:0,x:0,rotation:p.rot,scale:1,duration:dur,ease:a.float?'sine.in':'power2.in'});
    if(a.float)tl.to(el,{rotation:p.rot+rand(-14,14),duration:.4,ease:'sine.inOut'},0);
    if(a.bounce)tl.to(el,{y:-H*.035,duration:.12,ease:'power1.out'}).to(el,{y:0,duration:.16,ease:'power2.in'});
    if(a.roll)tl.to(el,{x:rand(-9,9),rotation:'+='+rand(-25,25),duration:.3,ease:'power2.out'},'>-0.02');
  }
  /* ================= PIZZA STAGE ================= */
  class PizzaStage{
  constructor(host,opts){
    opts=opts||{};
    this.mini=!!opts.mini;this.groups={};this.occupied=[];this.drzEls={};this.cooked=false;
    this.uid=Math.random().toString(36).slice(2,7);
    this.state={dough:null,sauce:null,cheese:null,meats:{},vegs:[],extras:[]};
    host.innerHTML='';
    const root=document.createElement('div');root.className='pz'+(this.mini?' mini':'');
    root.innerHTML=
    '<div class="pz-scale"><div class="pz-rot">'+
    '<div class="ly l-dough"><img data-d="thin" src="'+DOUGH_SRC.thin+'" alt=""><img data-d="classic" src="'+DOUGH_SRC.classic+'" alt=""><img data-d="thick" src="'+DOUGH_SRC.thick+'" alt=""><img data-d="cheese" src="'+DOUGH_SRC.cheese+'" alt=""></div>'+
    '<div class="ly l-sauce"><div class="sauce-mask"></div></div>'+
    '<div class="sauce-ring"></div>'+
    '<div class="ly l-cheese"></div>'+
    '<div class="ly l-cooked"></div>'+
    '<div class="ly l-tops"></div>'+
    '<div class="ly l-drz"><svg class="drz-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="gTruf'+this.uid+'"><stop offset="0%" stop-color="rgba(255,226,150,.95)"/><stop offset="60%" stop-color="rgba(190,140,60,.5)"/><stop offset="100%" stop-color="rgba(190,140,60,0)"/></radialGradient></defs><g class="drz-clip"></g></svg></div>'+
    '<div class="ly l-char"></div><div class="ly l-fx"></div></div></div>';
    host.appendChild(root);
    this.el=root;this.q=s=>root.querySelector(s);
    this.doughImgs=[...root.querySelectorAll('.l-dough img')];
    this.mask=this.q('.sauce-mask');this.ring=this.q('.sauce-ring');
    this.cheeseL=this.q('.l-cheese');this.cookedWrap=this.q('.l-cooked');
    this.cookedWrap.appendChild(meltSVG());
    this.topsL=this.q('.l-tops');this.drzG=this.q('.drz-clip');
    this.charL=this.q('.l-char');this.fxL=this.q('.l-fx');
    this.doughImgs.forEach((im,i)=>{im.style.filter=F_RAW;im.style.opacity=i===1?1:0;});
    this.mask.style.filter=F_RAW;
    for(let k=0;k<11;k++){const d=document.createElement('i');d.className='char';
      const a=Math.random()*6.283,r=rand(.8,.94),s=rand(3,7.5);
      d.style.width=s+'%';d.style.height=s+'%';
      d.style.left=(50+Math.cos(a)*r*50-s/2)+'%';d.style.top=(50+Math.sin(a)*r*50-s/2)+'%';
      this.charL.appendChild(d);}
    this.charSpots=[...this.charL.children];
   if(!this.mini)gsap.to(this.q('.pz-rot'),{rotation:360,duration:50,repeat:-1,ease:'none'});
  }
  setDough(id,speed){
    speed=speed==null?1:speed;
    this.state.dough=id;
    const map={thin:0,classic:1,thick:2,cheese:3};
    this.doughImgs.forEach((im,i)=>gsap.to(im,{opacity:i===map[id]?1:0,duration:speed>0?.8:0,ease:'power2.inOut'}));
    const sc={thin:.96,classic:1,thick:1.05,cheese:1.02}[id];
    gsap.to(this.q('.pz-scale'),{scale:sc,duration:speed>0?1:0,ease:'elastic.out(1,.55)'});
  }
  setSauce(id,speed){
    speed=speed==null?1:speed;
    const prev=this.state.sauce;this.state.sauce=id;
    this.mask.innerHTML='';this.mask.appendChild(sauceSVG(id));
    if(!prev||speed<=0){gsap.fromTo(this.mask,{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(73% at 50% 50%)',duration:speed>0?1.1:0,ease:'power3.out'});}
    else{gsap.to(this.mask,{clipPath:'circle(12% at 50% 50%)',duration:.3,ease:'power2.in',onComplete:()=>gsap.to(this.mask,{clipPath:'circle(73% at 50% 50%)',duration:.9,ease:'power3.out'})});}
  }
  setCheese(id,speed){
    speed=speed==null?1:speed;
    this.state.cheese=id;
    this.clearGroup('cheese',speed);
    const cfg=CHEESE_CFG[id];
    const fl=id==='four'?'sepia(.18) saturate(1.12)':id==='smoked'?'sepia(.35) saturate(.95) brightness(.97)':'none';
    this.cheeseL.style.filter=fl;this.cookedWrap.style.filter=fl;
    const pts=resolvePts(phyPoints(cfg.n,{rMax:.6}),{minD:.14,occ:this.occupied,rBound:.68});
    if(!this.groups.cheese)this.groups.cheese=[];
    pts.forEach((p,i)=>{
      const el=document.createElement('i');el.className='top';
      el.style.width=(CHEESE_SIZE*100*p.s)+'%';
      el.style.left=(50+p.x*46)+'%';el.style.top=(50+p.y*46)+'%';
      el.style.zIndex=1+((Math.random()*14)|0);
      const sv=mozSliceSVG(cfg.v);sv.dataset.kind='cheese';
      el.appendChild(sv);
      this.cheeseL.appendChild(el);
      const occ={x:p.x,y:p.y};
      this.occupied.push(occ);
      this.groups.cheese.push({el,occ});
      dropPiece(this,el,p,{anim:{dur:.62,bounce:true}},speed,i);
    });
  }
  sprinkle(id,count,cfg,speed){
    const minD=cfg.size*0.92;
    const rMax=cfg.size>.12?.66:cfg.size>.08?.7:.74;
    let pts;
    if(cfg.dist==='phy')pts=resolvePts(phyPoints(count,{rMax}),{minD,occ:this.occupied,rBound:rMax+.06});
    else pts=scatterPoints(count,{rMax,minD,occ:this.occupied});
    if(!this.groups[id])this.groups[id]=[];
    pts.forEach((p,i)=>{
      const el=document.createElement('i');
      el.className='top'+(cfg.shadow===false?' ns':'');
      el.style.width=(cfg.size*100*p.s)+'%';
      el.style.left=(50+p.x*46)+'%';el.style.top=(50+p.y*46)+'%';
      el.style.zIndex=2+((Math.random()*20)|0);
      const sv=SVGF[id]();sv.dataset.kind=cfg.kind||'top';
      el.appendChild(sv);
      (cfg.layer==='cheese'?this.cheeseL:this.topsL).appendChild(el);
      const occ={x:p.x,y:p.y};
      this.occupied.push(occ);
      this.groups[id].push({el,occ});
      dropPiece(this,el,p,cfg,speed,i);
    });
  }
  setTopping(id,count,speed){
    speed=speed==null?1:speed;
    const cfg=TOPCFG[id];if(!this.groups[id])this.groups[id]=[];
    const g=this.groups[id],cur=g.length;
    if(count>cur)this.sprinkle(id,count-cur,cfg,speed);
    else if(count<cur){
      const rm=g.splice(count);const H=this.el.clientHeight||420;
      rm.forEach((e,i)=>{
        if(e.occ){const oi=this.occupied.indexOf(e.occ);if(oi>-1)this.occupied.splice(oi,1);}
        gsap.to(e.el,{y:-H*.85,x:'+='+rand(-44,44),rotation:'+=150',opacity:0,duration:speed>0?.55:0,delay:i*.03,ease:'power2.in',onComplete:()=>e.el.remove()});
      });
    }
  }
  setExtra(id,on,speed){
    speed=speed==null?1:speed;
    if(DRIZZLES.includes(id))this.setDrizzle(id,on,speed);
    else if(on)this.sprinkle(id,TOPCFG[id].fixed,TOPCFG[id],speed);
    else this.clearGroup(id,speed);
  }
  clearGroup(id,speed){this.setTopping(id,0,speed==null?1:speed);}
  setDrizzle(id,on,speed){
    speed=speed==null?1:speed;
    if(!on){const g=this.drzEls[id];if(g){gsap.to(g,{opacity:0,duration:speed>0?.4:0,onComplete:()=>g.remove()});delete this.drzEls[id];}return;}
    const ns='http://www.w3.org/2000/svg';
    const g=document.createElementNS(ns,'g');
    g.setAttribute('transform','rotate('+rand(-35,35).toFixed(1)+' 50 50)');
    if(id==='truffle'){
      for(let i=0;i<12;i++){const c=document.createElementNS(ns,'circle');
        const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.7;
        c.setAttribute('cx',(50+Math.cos(a)*r*50).toFixed(1));c.setAttribute('cy',(50+Math.sin(a)*r*50).toFixed(1));
        c.setAttribute('r',rand(1.1,2.4).toFixed(1));c.setAttribute('fill','url(#gTruf'+this.uid+')');c.style.opacity=0;
        g.appendChild(c);}
    }else{
      const cols={ketchup:['#a81810','#ff6a55'],bbqDrizzle:['#1c0a03','#9a6a33']}[id];
      for(let i=0;i<5;i++){
        const d=wavyPath();
        const p1=document.createElementNS(ns,'path');p1.setAttribute('d',d);p1.setAttribute('fill','none');
        p1.setAttribute('stroke',cols[0]);p1.setAttribute('stroke-width',rand(1.6,2.6).toFixed(1));p1.setAttribute('stroke-linecap','round');
        const p2=document.createElementNS(ns,'path');p2.setAttribute('d',d);p2.setAttribute('fill','none');
        p2.setAttribute('stroke',cols[1]);p2.setAttribute('stroke-width','.6');p2.setAttribute('transform','translate(0 -0.5)');p2.style.opacity=0;
        g.appendChild(p1);g.appendChild(p2);
      }
    }
    this.drzG.appendChild(g);this.drzEls[id]=g;
    const paths=[...g.querySelectorAll('path')];
    paths.forEach((p,i)=>{const len=p.getTotalLength();
      if(speed>0){p.style.strokeDasharray=len;p.style.strokeDashoffset=len;
        gsap.to(p,{strokeDashoffset:0,duration:.6,delay:i*.09,ease:'power2.out'});}
      else p.style.strokeDashoffset=0;});
    [...g.children].forEach((c,i)=>{if(c.tagName==='circle'){if(speed>0)gsap.to(c,{opacity:.9,duration:.4,delay:i*.06});else c.style.opacity=.9;}});
    paths.forEach(p=>{if(p.getAttribute('stroke-width')==='.6'){if(speed>0)gsap.to(p,{opacity:.75,duration:.3,delay:.5});else p.style.opacity=.75;}});
  }
  addOil(instant){
    this.topsL.querySelectorAll('.top').forEach(t=>{
      const sv=t.querySelector('svg');if(!sv||sv.dataset.kind!=='meat')return;
      for(let k=0;k<2;k++){const d=document.createElement('b');d.className='oil';
        d.style.left=rand(15,60)+'%';d.style.top=rand(15,60)+'%';
        const s=rand(14,26)+'%';d.style.width=s;d.style.height=s;
        t.appendChild(d);
        if(instant)d.style.opacity=.7;else gsap.fromTo(d,{opacity:0},{opacity:.7,duration:.8,delay:Math.random()*.8});
      }
    });
  }
  cookifyInstant(){
    this.cooked=true;
      this.el.classList.add('cooked');
    this.doughImgs.forEach(i=>i.style.filter=F_DOUGH_C);
    this.mask.style.filter=F_SAUCE_C;
    this.cheeseL.style.opacity=0;
    this.cookedWrap.style.opacity=1;
    this.ring.style.opacity=.65;
  this.charSpots.forEach(c=>c.style.opacity=0);
    this.topsL.querySelectorAll('svg').forEach(sv=>sv.style.filter=sv.dataset.kind==='veg'?F_VEG_C:F_TOP_C);
    this.addOil(true);
  }
  applySnapshot(snap,speed){
    this.reset();
    if(snap.dough)this.setDough(snap.dough,speed);
    if(snap.sauce)this.setSauce(snap.sauce,speed);
    if(snap.cheese)this.setCheese(snap.cheese,speed);
    for(const[m,q]of Object.entries(snap.meats||{}))this.setTopping(m,(TOPCFG[m].counts||{})[q]||12,speed);
    for(const v of (snap.vegs||[]))this.setTopping(v,TOPCFG[v].fixed,speed);
    for(const e of (snap.extras||[]))this.setExtra(e,true,speed);
    this.state={dough:snap.dough,sauce:snap.sauce,cheese:snap.cheese,meats:{...(snap.meats||{})},vegs:[...(snap.vegs||[])],extras:[...(snap.extras||[])]};
  }
  reset(){
    this.cheeseL.innerHTML='';this.topsL.innerHTML='';this.drzG.innerHTML='';this.fxL.innerHTML='';
    this.groups={};this.occupied=[];this.drzEls={};this.cooked=false;
    this.cheeseL.style.opacity=1;this.cheeseL.style.filter='none';
    this.cookedWrap.style.opacity=0;this.cookedWrap.style.filter='none';
    this.ring.style.opacity=0;
    this.mask.style.clipPath='circle(0% at 50% 50%)';this.mask.style.filter=F_RAW;this.mask.innerHTML='';
    this.doughImgs.forEach((im,i)=>{im.style.filter=F_RAW;im.style.opacity=i===1?1:0;});
    this.charSpots.forEach(c=>c.style.opacity=0);
    gsap.to(this.q('.pz-scale'),{scale:1,duration:.5});
    this.state={dough:null,sauce:null,cheese:null,meats:{},vegs:[],extras:[]};
  }
  }
  /* ================= STATE / PRICING ================= */
  let state={dough:null,sauce:null,cheese:null,meats:{},vegs:[],extras:[]};
  let orderQty=1,curStep=0,maxReached=0,stage=null,lenis=null;
  const freshState=()=>({dough:null,sauce:null,cheese:null,meats:{},vegs:[],extras:[]});
  
  /* ================= COMBO PRICING (locked base) ================= */
  let combo=null;
  const QORDER=['less','normal','more'];
  function priceOf(arr,id){const o=arr.find(x=>x.id===id);return o?o.price:0;}
  function baseHas(cat,id){
    if(!combo)return false;
    const b=combo.snap;
    if(cat==='meat')return id in b.meats;
    if(cat==='veg')return b.vegs.includes(id);
    if(cat==='extras')return b.extras.includes(id);
    return false;
  }
  function comboDelta(){
    if(!combo)return 0;
    const b=combo.snap;let d=0;
    if(state.dough!==b.dough)d+=Math.max(0,priceOf(DOUGH,state.dough)-priceOf(DOUGH,b.dough));
    if(state.sauce!==b.sauce)d+=Math.max(0,priceOf(SAUCE,state.sauce)-priceOf(SAUCE,b.sauce));
    if(state.cheese!==b.cheese)d+=Math.max(0,priceOf(CHEESE,state.cheese)-priceOf(CHEESE,b.cheese));
    for(const[id,q]of Object.entries(state.meats)){
      if(id in b.meats)d+=Math.max(0,meatPrice(id,q)-meatPrice(id,b.meats[id]));
      else d+=meatPrice(id,q);
    }
    for(const v of state.vegs)if(!b.vegs.includes(v))d+=priceOf(VEG,v);
    for(const e of state.extras)if(!b.extras.includes(e))d+=priceOf(EXTRAS,e);
    return d;
  }
  function effectiveUnit(){return combo?combo.basePrice+comboDelta():unitPrice(state);}
  function meatPrice(id,q){const b=MEAT.find(m=>m.id===id).price;const m={less:.7,normal:1,more:1.4}[q]||1;return Math.round(b*m/5)*5;}
  function unitPrice(s){
    let p=0;
    if(s.dough)p+=DOUGH.find(d=>d.id===s.dough).price;
    if(s.sauce)p+=SAUCE.find(d=>d.id===s.sauce).price;
    if(s.cheese)p+=CHEESE.find(d=>d.id===s.cheese).price;
    for(const[id,q]of Object.entries(s.meats))p+=meatPrice(id,q);
    for(const v of s.vegs)p+=VEG.find(x=>x.id===v).price;
    for(const e of s.extras)p+=EXTRAS.find(x=>x.id===e).price;
    return p;
  }
  /* ================= STEPS UI ================= */
  const STEPS=[
   {id:'dough',label:'DOUGH',title:'01 — CHOOSE YOUR DOUGH',single:true},
   {id:'sauce',label:'SAUCE',title:'02 — CHOOSE YOUR SAUCE',single:true},
   {id:'cheese',label:'CHEESE',title:'03 — CHOOSE YOUR CHEESE',single:true},
   {id:'meat',label:'MEAT',title:'04 — ADD YOUR MEAT',multi:true},
   {id:'veg',label:'VEGGIES',title:'05 — MAKE IT FRESH',multi:true},
   {id:'extras',label:'EXTRAS',title:'06 — ONE MORE THING.',multi:true},
   {id:'bake',label:'BAKE',title:'07 — YOUR PIZZA',summary:true}
  ];
  let advTimer=null;
  function buildRail(){
    $('#rail').innerHTML=STEPS.map((s,i)=>'<button data-i="'+i+'"><b>0'+(i+1)+'</b><span>'+s.label+'</span></button>').join('');
    $$('#rail button').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.i;
         if(i<=maxReached&&(i<6||(state.dough&&state.sauce&&state.cheese))){goStep(i);if(window.innerWidth<=980)document.body.classList.add('drawer-open');}
    }));
  }
  function paintRail(){
    $$('#rail button').forEach((b,i)=>{b.classList.toggle('cur',i===curStep);b.classList.toggle('done',i<curStep||(i<=maxReached&&i!==curStep));});
  }
  function goStep(i){
    curStep=i;maxReached=Math.max(maxReached,i);
    paintRail();
    const s=STEPS[i];
    $('#pStepNo').textContent='0'+(i+1)+' / 07';
    $('#pBack').style.visibility=i>0&&!s.summary?'visible':'hidden';
    $('#pNext').style.visibility=s.multi?'visible':'hidden';
    renderPanel();
    gsap.fromTo('#panelBody',{autoAlpha:0,x:46},{autoAlpha:1,x:0,duration:.55,ease:'power3.out'});
  }
  function renderPanel(){
    const s=STEPS[curStep],body=$('#panelBody');
    if(s.summary){renderSummary();return;}
    const data={dough:DOUGH,sauce:SAUCE,cheese:CHEESE,meat:MEAT,veg:VEG,extras:EXTRAS}[s.id];
    const isOn=id=>{
      if(s.id==='dough')return state.dough===id;
      if(s.id==='sauce')return state.sauce===id;
      if(s.id==='cheese')return state.cheese===id;
      if(s.id==='meat')return id in state.meats;
      if(s.id==='veg')return state.vegs.includes(id);
      return state.extras.includes(id);
    };
    body.innerHTML='<h3 class="p-title">'+s.title+'</h3><p class="p-hint">'+(s.single?'Pick one — watch it change the pizza.':'Select as many as you like.')+(combo?' · 🔒 = included in '+combo.name:'')+'</p>'+
    '<div class="opts">'+data.map(o=>{
      const on=isOn(o.id),lk=baseHas(s.id,o.id);
      const bq=(combo&&s.id==='meat'&&combo.snap.meats[o.id])?combo.snap.meats[o.id]:null;
      return '<div class="opt'+(on?' on':'')+(lk?' locked':'')+'" data-id="'+o.id+'">'+
        '<span class="opt-name">'+o.name+(lk?' 🔒':'')+'</span>'+
        '<span class="opt-desc">'+(o.desc||'')+'</span>'+
        '<span class="opt-price">'+(lk?'INCLUDED':(o.price?'EGP '+o.price:'INCLUDED'))+'</span>'+
        (s.id==='meat'?'<span class="qty">'+['less','normal','more'].map(q=>'<button data-q="'+q+'" class="'+((state.meats[o.id]||'normal')===q?'on':'')+(bq&&QORDER.indexOf(q)<QORDER.indexOf(bq)?' lock':'')+'">'+q.toUpperCase()+'</button>').join('')+'</span>':'')+
        '</div>';
    }).join('')+'</div>';
    body.querySelectorAll('.opt').forEach(btn=>{
      btn.addEventListener('click',e=>{
        if(e.target.closest('.qty button'))return;
        const id=btn.dataset.id;
        if(s.single){
          body.querySelectorAll('.opt').forEach(b=>b.classList.remove('on'));
          btn.classList.add('on');
          if(s.id==='dough'){state.dough=id;stage.setDough(id,1);}
          if(s.id==='sauce'){state.sauce=id;stage.setSauce(id,1);}
          if(s.id==='cheese'){state.cheese=id;stage.setCheese(id,1);}
          clearTimeout(advTimer);advTimer=setTimeout(()=>goStep(curStep+1),1000);
        }else{
          if(baseHas(s.id,id)){toast('INCLUDED IN '+combo.name+' 🔒');return;}
          const on=btn.classList.toggle('on');
          if(s.id==='meat'){
            if(on){state.meats[id]='normal';stage.setTopping(id,TOPCFG[id].counts.normal,1);}
            else{delete state.meats[id];stage.setTopping(id,0,1);}
          }
          if(s.id==='veg'){
            if(on){state.vegs.push(id);stage.setTopping(id,TOPCFG[id].fixed,1);}
            else{state.vegs=state.vegs.filter(v=>v!==id);stage.setTopping(id,0,1);}
          }
          if(s.id==='extras'){
            if(on){state.extras.push(id);stage.setExtra(id,true,1);}
            else{state.extras=state.extras.filter(v=>v!==id);stage.setExtra(id,false,1);}
          }
        }
      });
    });
    body.querySelectorAll('.qty button').forEach(qb=>{
      qb.addEventListener('click',()=>{
        const id=qb.closest('.opt').dataset.id,q=qb.dataset.q;
        const bq=combo&&combo.snap.meats[id]?combo.snap.meats[id]:null;
        if(bq&&QORDER.indexOf(q)<QORDER.indexOf(bq)){toast('COMBO INCLUDES '+bq.toUpperCase()+' 🔒');return;}
        state.meats[id]=q;stage.setTopping(id,TOPCFG[id].counts[q],1);
        qb.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===qb));
      });
    });
  }
  function renderSummary(){
    const rows=[];
    const b=combo?combo.snap:null;
    if(combo)rows.push({t:combo.name+' — COMBO',p:combo.basePrice,fix:true});
    const d=DOUGH.find(x=>x.id===state.dough);
    if(d){const inc=b&&b.dough===state.dough;rows.push({st:0,t:d.name,p:inc?0:(b?Math.max(0,priceOf(DOUGH,state.dough)-priceOf(DOUGH,b.dough)):d.price),inc:inc,sw:b&&!inc});}
    const sc=SAUCE.find(x=>x.id===state.sauce);
    if(sc){const inc=b&&b.sauce===state.sauce;rows.push({st:1,t:sc.name,p:inc?0:(b?Math.max(0,priceOf(SAUCE,state.sauce)-priceOf(SAUCE,b.sauce)):sc.price),inc:inc,sw:b&&!inc});}
    const ch=CHEESE.find(x=>x.id===state.cheese);
    if(ch){const inc=b&&b.cheese===state.cheese;rows.push({st:2,t:ch.name,p:inc?0:(b?Math.max(0,priceOf(CHEESE,state.cheese)-priceOf(CHEESE,b.cheese)):ch.price),inc:inc,sw:b&&!inc});}
    for(const[id,q]of Object.entries(state.meats)){
      const m=MEAT.find(x=>x.id===id);
      if(b&&(id in b.meats)){
        if(q===b.meats[id])rows.push({st:3,t:m.name+' × '+q,p:0,inc:true});
        else rows.push({st:3,t:m.name+' × '+q,p:Math.max(0,meatPrice(id,q)-meatPrice(id,b.meats[id])),sw:true});
      }else rows.push({st:3,t:m.name+' × '+TOPCFG[id].counts[q],p:meatPrice(id,q)});
    }
    for(const v of state.vegs){const m=VEG.find(x=>x.id===v);const inc=b&&b.vegs.includes(v);rows.push({st:4,t:m.name+' × '+TOPCFG[v].fixed,p:inc?0:m.price,inc:inc});}
    for(const e of state.extras){const m=EXTRAS.find(x=>x.id===e);const inc=b&&b.extras.includes(e);rows.push({st:5,t:m.name,p:inc?0:m.price,inc:inc});}
    const unit=effectiveUnit();
    $('#panelBody').innerHTML=
    '<h3 class="p-title">07 — YOUR PIZZA</h3><p class="p-hint">'+(combo?'Combo base locked — your changes are priced on top.':'Raw, assembled and waiting for the fire. Tap a line to edit it.')+'</p>'+
    '<div class="sum-card"><h4>YOUR PIZZA</h4>'+
    rows.map(r=>'<div class="sum-row" data-st="'+(r.st==null?'':r.st)+'"><span>'+r.t+'</span><span class="ed">'+(r.inc?'🔒':(r.st!=null?'EDIT':''))+'</span><span>'+(r.inc?'INCLUDED':(r.fix?'EGP '+r.p:(r.sw?'+ EGP '+r.p:'EGP '+r.p)))+'</span></div>').join('')+
    '<div class="qty-line"><b>QUANTITY</b><div class="stepper"><button id="qMinus">−</button><span id="sumQty">'+orderQty+'</span><button id="qPlus">+</button></div></div>'+
    '<div class="sum-total"><span>TOTAL</span><b id="sumTotal">EGP '+(unit*orderQty)+'</b></div></div>'+
    '<div class="sum-btns"><button class="btn ghost" id="btnEdit">EDIT PIZZA</button><button class="btn solid" id="btnBake">BAKE MY PIZZA</button></div>';
    $('#panelBody').querySelectorAll('.sum-row').forEach(r=>{if(!r.dataset.st)return;r.addEventListener('click',()=>goStep(+r.dataset.st));});
    $('#btnEdit').addEventListener('click',()=>goStep(0));
    $('#qMinus').addEventListener('click',()=>{orderQty=clamp(orderQty-1,1,9);syncSum();});
    $('#qPlus').addEventListener('click',()=>{orderQty=clamp(orderQty+1,1,9);syncSum();});
    $('#btnBake').addEventListener('click',startBake);
    function syncSum(){$('#sumQty').textContent=orderQty;gsap.fromTo('#sumTotal',{scale:1.15},{scale:1,duration:.4});$('#sumTotal').textContent='EGP '+(unit*orderQty);}
  }
  $('#pBack').addEventListener('click',()=>{if(curStep>0)goStep(curStep-1);});
  $('#pNext').addEventListener('click',()=>goStep(curStep+1));
  /* ================= OVEN / BAKE ================= */
  let ovenTL=null,ovenStage=null;
  let boxToggleReady=false;
  function setStatus(t){const el=$('#ovenStatus');el.textContent=t;gsap.fromTo(el,{y:8,autoAlpha:0},{y:0,autoAlpha:1,duration:.4});}
  function spawnSteamScene(burst){
    const host=$('.oven-steam');
    const n=burst?7:4;
    for(let i=0;i<n;i++){
      const s=document.createElement('i');s.className='stm';
      const sz=rand(60,140);s.style.width=sz+'px';s.style.height=sz+'px';
      s.style.left=rand(-120,120)+'px';s.style.top=rand(-20,40)+'px';
      host.appendChild(s);
      gsap.timeline({onComplete:()=>s.remove()})
        .fromTo(s,{opacity:0,scale:.5,y:0},{opacity:rand(.35,.6),scale:1.1,duration:.6,delay:i*.12})
        .to(s,{y:-rand(160,260),opacity:0,scale:1.7,duration:rand(1.4,2.2),ease:'power1.out'});
    }
  }
  function spawnBubbles(st){
    for(let i=0;i<14;i++){
      const b=document.createElement('i');b.className='bub';
      const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.62,s=rand(2,4.5);
      b.style.width=s+'%';b.style.height=s+'%';
      b.style.left=(50+Math.cos(a)*r*46-s/2)+'%';b.style.top=(50+Math.sin(a)*r*46-s/2)+'%';
      st.fxL.appendChild(b);
      gsap.timeline({delay:rand(0,2.6),repeat:2})
        .fromTo(b,{opacity:0,scale:.2},{opacity:.95,scale:1,duration:.5,ease:'back.out(2)'})
        .to(b,{opacity:0,scale:.4,duration:.5,delay:.3});
    }
  }
  function startBake(){
    try {
      if(!state.dough || !state.sauce || !state.cheese){
        toast('PLEASE SELECT DOUGH, SAUCE, AND CHEESE FIRST');
        goStep(0);
        return;
      }
      document.body.classList.remove('drawer-open');
      const scene=$('#ovenScene');
      const slot=$('#ovenSlot');slot.innerHTML='';
      $('#boxPizzaHost').innerHTML='';
      gsap.killTweensOf('#boxPizzaHost');
      gsap.set('.oven',{autoAlpha:1});
      gsap.set('.oven-mouth',{overflow:'hidden'});
      gsap.set('#boxScene',{autoAlpha:0,scale:1,y:0});
      gsap.set('#boxPizzaHost',{scale:1,y:0,rotation:0});
      $('#boxScene').classList.remove('closed');
      boxToggleReady=false;$('#boxScene').classList.remove('tapable');
      ovenStage=new PizzaStage(slot,{mini:true});
      ovenStage.applySnapshot(state,0);
      $('#revealBox').classList.remove('show');
      $('#ovenTimer').textContent='00:08';
      $('#ovenTimer').style.display='';
      $('#ovenTimer').classList.remove('ready-msg');
      scene.classList.add('on');document.body.classList.add('locked');
      if(lenis)lenis.stop();
      gsap.set(slot,{xPercent:-50,yPercent:-50,scale:1,y:0,rotation:0,opacity:1});
      gsap.fromTo(scene,{autoAlpha:0},{autoAlpha:1,duration:.6});
      gsap.to('.oven-glow',{opacity:1,duration:1.2,yoyo:true,repeat:15,ease:'sine.inOut'});
      const tl=ovenTL=gsap.timeline();
      tl.fromTo(slot,{scale:1.2,y:-40,opacity:0},{scale:1,y:0,opacity:1,duration:1.1,ease:'power3.out'})
        .fromTo('.oven-head',{y:-30,autoAlpha:0},{y:0,autoAlpha:1,duration:.5},'<')
        .call(()=>setStatus('SLIDING IN'))
        .to(slot,{scale:.62,y:34,duration:1.4,ease:'power2.inOut'},'+=0.2')
        .to('.oven-door',{y:'0%',duration:.9,ease:'power3.inOut'},'>-0.2')
        .call(()=>setStatus('BAKING'))
        .call(()=>spawnSteamScene(false))
        .add('cook','+=0.1');
      const t={v:8};
      tl.to(t,{v:0,duration:6.4,ease:'none',onUpdate:()=>{$('#ovenTimer').textContent='00:0'+Math.max(0,Math.ceil(t.v));}},'cook');
      tl.to(ovenStage.doughImgs,{filter:F_DOUGH_C,duration:2.4,ease:'sine.inOut'},'cook+=0.4')
        .to(ovenStage.mask,{filter:F_SAUCE_C,duration:2,ease:'sine.inOut'},'cook+=0.4')
        .call(()=>setStatus('MELTING'),null,'cook+=1.2')
        .call(()=>ovenStage.el.classList.add('cooked'),null,'cook+=0.4')
        .call(()=>{
          ovenStage.cheeseL.querySelectorAll('.top').forEach(p=>{
            gsap.to(p,{scale:rand(1.2,1.45),rotation:'+='+rand(-25,25),filter:'blur(3px) brightness(1.2)',duration:2.2,ease:'sine.in',delay:rand(0,.5)});
            gsap.to(p,{opacity:0,duration:1,delay:rand(1.7,2.5),ease:'power1.in'});
          });
        },null,'cook+=0.9')
        .fromTo(ovenStage.cookedWrap,{opacity:0,scale:.9},{opacity:.9,scale:.97,duration:2.4,ease:'sine.inOut'},'cook+=1.6')
        .to(ovenStage.ring,{opacity:.65,duration:1.5},'cook+=2.2')
        .call(()=>spawnBubbles(ovenStage),null,'cook+=2.2')
        .call(()=>setStatus('BROWNING'),null,'cook+=2.6')
        .to(ovenStage.topsL.querySelectorAll('svg'),{filter:(ix,el)=>el.dataset.kind==='veg'?F_VEG_C:F_TOP_C,duration:1.6,stagger:.015,ease:'sine.inOut'},'cook+=2.6')
        .set(ovenStage.charSpots,{opacity:0},'cook+=3')
        .call(()=>ovenStage.addOil(false),null,'cook+=3.2')
        .call(()=>spawnSteamScene(false),null,'cook+=3.4')
        .to(scene,{x:2,duration:.07,repeat:9,yoyo:true},'cook+=3.6')
        .to(scene,{x:0,duration:.1},'cook+=4.4')
        .call(()=>{
          setStatus('READY.');
          const tm=$('#ovenTimer');
          if(window.innerWidth<=980){tm.textContent='YOUR PIZZA IS READY.';tm.classList.add('ready-msg');}
          else{tm.style.display='none';}
        },null,'cook+=6.4')
        .to('.oven-door',{y:'-112%',duration:1,ease:'power3.inOut'},'cook+=6.5')
        .call(()=>gsap.set('.oven-mouth',{overflow:'visible'}),null,'cook+=6.5')
        .to(slot,{scale:1.4,y:110,duration:1.3,ease:'power2.out'},'cook+=6.9')
        .call(()=>setStatus('BOXING'),null,'cook+=7.8')
        .call(()=>{$('#boxPizzaHost').appendChild(ovenStage.el);},null,'cook+=8.2')
        .to('.oven',{autoAlpha:0,duration:.8,ease:'power2.in'},'cook+=8.2')
        .fromTo('#boxScene',{autoAlpha:0,scale:.7,y:60},{autoAlpha:1,scale:1,y:0,duration:.9,ease:'back.out(1.2)'},'cook+=8.35')
        .fromTo('#boxPizzaHost',{scale:1.45,y:-80,rotation:-8},{scale:1,y:0,rotation:0,duration:1.1,ease:'bounce.out'},'cook+=8.7')
        .call(()=>spawnSteamScene(true),null,'cook+=9.5')
        .call(()=>setStatus('CLOSING'),null,'cook+=10')
        .call(()=>$('#boxScene').classList.add('closed'),null,'cook+=10.05')
        .call(()=>{boxToggleReady=true;$('#boxScene').classList.add('tapable');},null,'cook+=11.2')
        .call(()=>setStatus('BOXED.'),null,'cook+=11.1')
        .call(()=>{
          buildChips();
          $('#ovenPrice').textContent='EGP '+(effectiveUnit()*orderQty);
          $('#revealBox').classList.add('show');
          gsap.fromTo('#revealBox > *',{y:44,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.1,ease:'power3.out'});
        },null,'cook+=11.3');
    } catch (e) {
      console.error('Bake error:', e);
      toast('AN ERROR OCCURRED. PLEASE CHECK CONSOLE.');
    }
  }
  function closeOven(cb){
    if(lenis)lenis.start();
    $('#boxScene').classList.remove('closed');
    if(ovenTL)ovenTL.kill();
    gsap.killTweensOf(['#boxPizzaHost','.bx-lid','.bx']);
    gsap.to('#ovenScene',{autoAlpha:0,duration:.6,onComplete:()=>{
      $('#ovenScene').classList.remove('on');document.body.classList.remove('locked');
      $('#ovenSlot').innerHTML='';$('#boxPizzaHost').innerHTML='';
      gsap.set('.oven',{autoAlpha:1});
      gsap.set('#boxScene',{autoAlpha:0});
      gsap.set('#ovenScene',{x:0});
      ovenStage=null;
      if(cb)cb();
    }});
  }
  function buildChips(){
    const parts=[];
    const d=DOUGH.find(x=>x.id===state.dough);if(d)parts.push(d.name);
    const sc=SAUCE.find(x=>x.id===state.sauce);if(sc)parts.push(sc.name);
    const ch=CHEESE.find(x=>x.id===state.cheese);if(ch)parts.push(ch.name);
    for(const m of Object.keys(state.meats))parts.push(MEAT.find(x=>x.id===m).name);
    for(const v of state.vegs)parts.push(VEG.find(x=>x.id===v).name);
    for(const e of state.extras)parts.push(EXTRAS.find(x=>x.id===e).name);
    $('#ovenChips').innerHTML=parts.map(p=>'<span>'+p+'</span>').join('');
  }
  function resetBuilder(){
    state=freshState();orderQty=1;maxReached=0;combo=null;
    stage.applySnapshot(state,0);
    goStep(0);
  }
  $('#boxScene').addEventListener('click',()=>{
    if(!boxToggleReady)return;
    $('#boxScene').classList.toggle('closed');
  });
  $('#btnSave').addEventListener('click',()=>{
    saveCurrentPizza();
    toast('SAVED TO YOUR PIZZAS 🍕');
    closeOven(()=>{resetBuilder();openSaved();});
  });
  $('#btnAnother').addEventListener('click',()=>closeOven(()=>{resetBuilder();if(lenis)lenis.scrollTo('#builder',{offset:-40});}));
  $('#btnCartAdd').addEventListener('click',()=>{
    cart.push({uid:Date.now(),kind:'pizza',name:'CUSTOM PIZZA',snap:JSON.parse(JSON.stringify(state)),unit:effectiveUnit(),qty:orderQty});
    renderCart();popBadge();
    closeOven(()=>{resetBuilder();openCart();});
    toast('ADDED TO CART');
  });
  /* ================= SAVED PIZZAS ================= */
  let saved=[];
  try{saved=JSON.parse(localStorage.getItem('forno_saved')||'[]')}catch(e){saved=[]}
  function persistSaved(){localStorage.setItem('forno_saved',JSON.stringify(saved));$('#savedCount').textContent=saved.length;renderSaved();}
  function openSaved(){renderSaved();document.body.classList.add('saved-open');}
  function closeSaved(){document.body.classList.remove('saved-open');}
  function saveCurrentPizza(){
    saved.push({uid:Date.now(),name:'MY PIZZA #'+(saved.length+1),snap:JSON.parse(JSON.stringify(state)),combo:combo?JSON.parse(JSON.stringify(combo)):null,unit:effectiveUnit(),qty:orderQty});
    persistSaved();
  }
  function renderSaved(){
    const host=$('#savedItems');if(!host)return;
    host.innerHTML='';
    if(!saved.length){host.innerHTML='<div class="cart-empty">NO SAVED PIZZAS YET.<br>BAKE ONE AND HIT SAVE.</div>';return;}
    saved.forEach(sv=>{
      const row=document.createElement('div');row.className='sv';
      const prev=document.createElement('div');prev.className='sv-pz';
      const st=new PizzaStage(prev,{mini:true});
      st.applySnapshot(sv.snap,0);st.cookifyInstant();
      row.appendChild(prev);
      const body=document.createElement('div');body.className='sv-body';
      body.innerHTML='<div class="sv-name">'+sv.name+' <em>✎</em></div><div class="sv-meta">'+summarize(sv.snap)+' × '+sv.qty+'</div>'+
        '<div class="sv-foot"><span class="sv-price">EGP '+(sv.unit*sv.qty)+'</span>'+
        '<span class="sv-acts"><button class="sv-order">ORDER</button><button class="sv-edit">EDIT</button><button class="sv-rm">✕</button></span></div>';
      row.appendChild(body);
      host.appendChild(row);
      body.querySelector('.sv-name').addEventListener('click',()=>{
        const n=prompt('PIZZA NAME:',sv.name);
        if(n&&n.trim()){sv.name=n.trim().toUpperCase();persistSaved();}
      });
      body.querySelector('.sv-order').addEventListener('click',()=>{
        cart.push({uid:Date.now(),kind:'pizza',name:sv.name,snap:JSON.parse(JSON.stringify(sv.snap)),unit:sv.unit,qty:sv.qty});
        renderCart();popBadge();closeSaved();openCart();toast(sv.name+' ADDED TO CART');
      });
      body.querySelector('.sv-edit').addEventListener('click',()=>{
        state=JSON.parse(JSON.stringify(sv.snap));
        combo=sv.combo?JSON.parse(JSON.stringify(sv.combo)):null;
        orderQty=sv.qty||1;
        stage.applySnapshot(state,1);
        maxReached=6;goStep(6);
        closeSaved();
        if(lenis)lenis.scrollTo('#builder',{offset:-40});
        toast('LOADED — EDIT & BAKE');
      });
      body.querySelector('.sv-rm').addEventListener('click',()=>{
        saved=saved.filter(s=>s.uid!==sv.uid);persistSaved();
      });
    });
  }
  $('#savedBtn').addEventListener('click',openSaved);
  $('#savedClose').addEventListener('click',closeSaved);
  $('#savedBuild').addEventListener('click',()=>{closeSaved();if(lenis)lenis.scrollTo('#builder',{offset:-40});});
  /* ================= CART ================= */
  let cart=[];
  function popBadge(){const b=$('#cartCount');b.textContent=cart.reduce((a,c)=>a+c.qty,0);gsap.fromTo(b,{scale:1.6},{scale:1,duration:.5,ease:'elastic.out(1,.4)'});}
  function openCart(){document.body.classList.add('cart-open');}
  function closeCart(){document.body.classList.remove('cart-open');}
  $('#cartBtn').addEventListener('click',openCart);
  $('#cartClose').addEventListener('click',closeCart);
  $('#cartOverlay').addEventListener('click',()=>{closeCart();closeSaved();});
  $('#continueBtn').addEventListener('click',()=>{closeCart();if(lenis)lenis.scrollTo('#builder',{offset:-40});});
  $('#doneClose').addEventListener('click',()=>{$('#cartDone').style.display='none';closeCart();});
  $('#checkoutBtn').addEventListener('click',()=>{
    if(!cart.length){toast('CART IS EMPTY');return;}
    $('#cartDone').style.display='flex';
    cart=[];popBadge();renderCart();
  });
  function renderCart(){
    const host=$('#cartItems');host.innerHTML='';
    if(!cart.length){host.innerHTML='<div class="cart-empty">YOUR CART IS EMPTY.<br>GO BUILD SOMETHING BEAUTIFUL.</div>';}
    cart.forEach(item=>{
      const row=document.createElement('div');row.className='ci';
      const prev=document.createElement('div');
      if(item.kind==='pizza'){
        prev.className='ci-pz';
        const st=new PizzaStage(prev,{mini:true});
        st.applySnapshot(item.snap,0);st.cookifyInstant();
      }else{
        prev.innerHTML='<img class="ci-img" src="'+item.img+'" alt="">';
      }
      row.appendChild(prev);
      const body=document.createElement('div');body.className='ci-body';
      const meta=item.kind==='pizza'?summarize(item.snap):item.meta;
      body.innerHTML='<div class="ci-name">'+item.name+'</div><div class="ci-meta">'+meta+'</div>'+
        '<div class="ci-foot"><div class="stepper"><button class="qm">−</button><span>'+item.qty+'</span><button class="qp">+</button></div><span class="ci-price">EGP '+(item.unit*item.qty)+'</span></div>';
      row.appendChild(body);
      const rm=document.createElement('button');rm.className='ci-rm';rm.textContent='✕';
      rm.addEventListener('click',()=>{cart=cart.filter(c=>c.uid!==item.uid);renderCart();popBadge();});
      row.appendChild(rm);
      body.querySelector('.qm').addEventListener('click',()=>{item.qty=clamp(item.qty-1,1,9);renderCart();popBadge();});
      body.querySelector('.qp').addEventListener('click',()=>{item.qty=clamp(item.qty+1,1,9);renderCart();popBadge();});
      host.appendChild(row);
    });
    $('#cartTotal').textContent='EGP '+cart.reduce((a,c)=>a+c.unit*c.qty,0);
  }
  function summarize(s){
    const parts=[];
    const d=DOUGH.find(x=>x.id===s.dough);if(d)parts.push(d.name);
    const sc=SAUCE.find(x=>x.id===s.sauce);if(sc)parts.push(sc.name);
    const ch=CHEESE.find(x=>x.id===s.cheese);if(ch)parts.push(ch.name);
    for(const m of Object.keys(s.meats))parts.push(MEAT.find(x=>x.id===m).name);
    for(const v of s.vegs)parts.push(VEG.find(x=>x.id===v).name);
    for(const e of s.extras)parts.push(EXTRAS.find(x=>x.id===e).name);
    return parts.join(' · ')||'—';
  }
/* ================= MENU ================= */
  let MENU_ITEMS=[
   {id:'fire',cat:['signature','spicy'],name:'THE FIRE',price:285,img:IMG.fire,ing:['Tomato','Mozzarella','Pepperoni','Jalapeño','Chili Oil'],preset:{dough:'classic',sauce:'tomato',cheese:'mozzarella',meats:{pepperoni:'more'},vegs:['jalapeno'],extras:['chili']}},
   {id:'truffle',cat:['signature','vegetarian'],name:'THE TRUFFLE',price:320,img:IMG.pTruffle,ing:['Truffle Cream','Mozzarella','Mushroom','Parmesan'],preset:{dough:'cheese',sauce:'garlic',cheese:'four',meats:{},vegs:['mushroom'],extras:['truffle','extraCheese']}},
   {id:'bbq',cat:['signature'],name:'THE BBQ',price:275,img:IMG.pBBQ,ing:['BBQ','Mozzarella','Chicken','Smoked Cheese','Onion'],preset:{dough:'classic',sauce:'bbq',cheese:'smoked',meats:{chicken:'normal'},vegs:['onion'],extras:['bbqDrizzle']}},
   {id:'green',cat:['signature','vegetarian'],name:'THE GREEN',price:240,img:IMG.pGreen,ing:['Mozzarella','Mushroom','Olives','Green Pepper','Basil'],preset:{dough:'classic',sauce:'tomato',cheese:'mozzarella',meats:{},vegs:['mushroom','olives','greenPepper','basil'],extras:[]}},
   {id:'marg',cat:['classic','vegetarian'],name:'MARGHERITA',price:190,img:IMG.pMarg,ing:['Tomato','Mozzarella','Basil','Olive Oil'],preset:{dough:'thin',sauce:'tomato',cheese:'mozzarella',meats:{},vegs:['basil'],extras:[]}},
   {id:'original',cat:['classic'],name:'THE ORIGINAL',price:230,img:IMG.pOriginal,ing:['Tomato','Mozzarella','Double Pepperoni'],preset:{dough:'classic',sauce:'tomato',cheese:'extra',meats:{pepperoni:'more'},vegs:[],extras:[]}},
   {id:'diablo',cat:['spicy'],name:'DIABLO',price:295,img:IMG.pOriginal,imgF:'saturate(1.35) hue-rotate(-10deg) brightness(.95)',ing:['Spicy Tomato','Beef','Jalapeño','Chili Flakes'],preset:{dough:'thin',sauce:'spicy',cheese:'mozzarella',meats:{beef:'normal'},vegs:['jalapeno'],extras:['chili']}},
   {id:'bread',cat:['sides'],name:'GARLIC BUTTER BREAD',price:60,simple:true,ing:['Wood-Oven','Garlic','Herbs','Butter']},
   {id:'cola',cat:['drinks'],name:'CRAFT COLA',price:35,simple:true,ing:['Ice Cold','House Syrup','Citrus']},
   {id:'lava',cat:['desserts'],name:'CHOCOLATE LAVA',price:75,simple:true,ing:['Molten Center','Sea Salt','Vanilla']}
  ];
  let CATS=['signature','classic','spicy','vegetarian','sides','drinks','desserts'];
  let menuCat='signature';

// جلب البيانات مع حماية كاملة
  async function syncMenuFromServer() {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) return;
      const data = await res.json();

      if (data.categories && data.categories.length > 0) {
        CATS = data.categories.map(c => c.id);
        if (!CATS.includes(menuCat)) menuCat = CATS[0];
      }

      if (data.items && data.items.length > 0) {
        MENU_ITEMS = data.items.map(it => ({
          id: it.item_id || 'item-' + it.id,
          cat: Array.isArray(it.categories) && it.categories.length > 0 ? it.categories : ['signature'],
          name: it.name || 'PIZZA',
          price: Number(it.price) || 0,
          img: it.image_url || IMG.pOriginal,
          ing: Array.isArray(it.ingredients) ? it.ingredients : [],
          simple: !!it.is_simple,
          preset: it.preset || { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: [], extras: [] }
        }));
      }
    } catch (err) {
      console.warn('Menu fetch fallback:', err);
    }
  }

  function renderMenu(){
    const items = MENU_ITEMS.filter(i => Array.isArray(i.cat) && i.cat.includes(menuCat));
    const track = $('#menuTrack');
    if (!track) return;

    if (items.length === 0) {
      track.innerHTML = '<div style="padding: 40px 6vw; color: var(--mut); font-size: 14px; letter-spacing: 2px;">NO PRODUCTS IN THIS CATEGORY YET.</div>';
      return;
    }

    track.innerHTML = items.map((it, n) =>
     '<article class="mcard" data-id="'+it.id+'">'+
     (it.img ? '<div class="mimg"><img loading="lazy" src="'+it.img+'" style="'+(it.imgF ? 'filter:'+it.imgF : '')+'" alt="'+it.name+'"></div>' : '<div class="mnum">0'+(n+1)+'</div>')+
     '<span class="mcat">'+(it.cat[0] || 'FORNO').toUpperCase()+'</span><h3>'+it.name+'</h3>'+
     '<ul class="mings">'+(it.ing || []).map(x => '<li>'+x+'</li>').join('')+'</ul>'+
     '<div class="mrow"><span class="mprice" data-p="'+it.price+'">EGP '+it.price+'</span>'+
     '<button class="mbtn">'+(it.simple ? 'ADD TO CART' : 'CUSTOMIZE')+'</button></div></article>'
    ).join('');

    $$('#menuTrack .mcard').forEach(card => {
      const it = MENU_ITEMS.find(x => x.id === card.dataset.id);
      if (!it) return;
      const pr = card.querySelector('.mprice');
      card.addEventListener('mouseenter', () => {
        const o = { v: 0 };
        gsap.to(o, { v: it.price, duration: .7, ease: 'power2.out', onUpdate: () => pr.textContent = 'EGP ' + Math.round(o.v) });
      });
      card.querySelector('.mbtn').addEventListener('click', () => {
        if (it.simple) {
          cart.push({ uid: Date.now(), kind: 'simple', name: it.name, img: it.img, meta: (it.ing || []).join(' · '), unit: it.price, qty: 1 });
          renderCart(); popBadge(); openCart(); toast('ADDED TO CART');
        } else {
          applyPreset(it);
        }
      });
    });

    gsap.set('#menuTrack', { x: 0 });
    gsap.fromTo('#menuTrack .mcard', { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .07, ease: 'power3.out' });
    $$('#menuTrack .mprice').forEach((p, i) => {
      const tg = +p.dataset.p, o = { v: 0 };
      gsap.to(o, { v: tg, duration: .9, delay: .15 + i * .06, ease: 'power2.out', onUpdate: () => p.textContent = 'EGP ' + Math.round(o.v) });
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }


    function buildTabs(){
    $('#menuTabs').innerHTML=CATS.map(c=>'<button data-c="'+c+'" class="'+(c===menuCat?'on':'')+'">'+c.toUpperCase()+'</button>').join('');
    $$('#menuTabs button').forEach(b=>b.addEventListener('click',()=>{menuCat=b.dataset.c;buildTabs();renderMenu();}));
  }

  function applyPreset(it){
    const p=it.preset;
    state={dough:p.dough||'classic',sauce:p.sauce||'tomato',cheese:p.cheese||'mozzarella',meats:{...(p.meats||{})},vegs:[...(p.vegs||[])],extras:[...(p.extras||[])]};
    combo={name:it.name,basePrice:it.price,snap:JSON.parse(JSON.stringify(state))};
    stage.applySnapshot(state,.5);
    maxReached=6;goStep(6);
    if(lenis)lenis.scrollTo('#builder',{offset:-40});
    toast(it.name+' — COMBO PRICE EGP '+it.price);
  }
  /* ================= CONTACT ================= */
  $$('#topics button').forEach(b=>b.addEventListener('click',()=>{$$('#topics button').forEach(x=>x.classList.remove('on'));b.classList.add('on');}));
  $('#cForm').addEventListener('submit',e=>{
    e.preventDefault();
    if(!$('#fName').value.trim()||!$('#fEmail').value.trim()||!$('#fMsg').value.trim()){toast('FILL NAME, EMAIL & MESSAGE');return;}
    gsap.to('#cForm',{autoAlpha:0,y:-30,duration:.6,onComplete:()=>{
      $('#cForm').style.display='none';
      const t=$('#cThanks');t.style.display='flex';
      gsap.fromTo(t.children,{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.15});
    }});
  });
  /* ================= TOAST ================= */
  let toastT=null;
  function toast(msg){
    const t=$('#toast');
    t.classList.remove('show');void t.offsetWidth;
    t.textContent=msg;t.classList.add('show');
    clearTimeout(toastT);
    toastT=setTimeout(()=>t.classList.remove('show'),2300);
  }
  /* ================= SCROLL / REVEALS ================= */
  function setupScroll(){
    ScrollTrigger.create({
      trigger:'#builder',
      start:'top top',
      end:'+=115%',
      pin:true,
      anticipatePin:1
    });
    function goBuilder(){
      const el=document.getElementById('builder');
      const st=ScrollTrigger.getAll().find(t=>t.trigger===el);
      const y=st?st.start:el.offsetTop;
      if(lenis)lenis.scrollTo(y,{offset:0,duration:1.6});
      else window.scrollTo({top:y,behavior:'smooth'});
    }
    lenis=new Lenis({lerp:.09});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
    $$('.nav-links button').forEach(b=>b.addEventListener('click',()=>lenis.scrollTo(b.dataset.go,{offset:-40})));
    $('#ctaBuild').addEventListener('click',goBuilder);
    $('#ctaMenu').addEventListener('click',()=>lenis.scrollTo('#menu'));
    window.addEventListener('scroll',()=>$('#nav').classList.toggle('scrolled',window.scrollY>40),{passive:true});
    gsap.to('#hero',{backgroundPosition:'0 0',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top'}});
    gsap.to('.hero-grid',{y:-60,autoAlpha:.2,scrollTrigger:{trigger:'#hero',start:'40% top',end:'bottom top',scrub:true}});
    gsap.utils.toArray('[data-rev]').forEach(el=>{
      gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%'}});
    });
    const track=$('#menuTrack');
    gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-window.innerWidth+40),ease:'none',
      scrollTrigger:{trigger:'#menu',start:'top top',end:()=>'+='+Math.max(600,track.scrollWidth-window.innerWidth+40),scrub:1,pin:true,invalidateOnRefresh:true,
        onUpdate:self=>$('#menuBar').style.width=(self.progress*100)+'%'}});
  }
  /* ================= HERO CINEMATICS ================= */
  function heroFX(){
    const dustH=$('#heroDust');
    for(let i=0;i<26;i++){
      const d=document.createElement('i');
      d.style.left=rand(0,100)+'%';d.style.top=rand(0,100)+'%';
      dustH.appendChild(d);
      gsap.to(d,{y:rand(-110,-50),x:rand(-40,40),opacity:rand(.15,.7),duration:rand(3,7),repeat:-1,yoyo:true,ease:'sine.inOut',delay:rand(0,3)});
    }
    gsap.to('#heroPizza img',{rotation:360,duration:30,repeat:-1,ease:'none'});
    gsap.to('#heroPizza',{scale:1.06,duration:6,repeat:-1,yoyo:true,ease:'sine.inOut'});
    $$('#heroSteam i').forEach((s,i)=>{
      gsap.timeline({repeat:-1,delay:i*1.1})
        .fromTo(s,{y:0,x:rand(-30,30),opacity:0,scale:.6},{opacity:.5,scale:1.2,duration:1.2,ease:'power1.out'})
        .to(s,{y:-160,opacity:0,x:'+='+rand(-30,30),duration:2,ease:'power1.inOut'});
    });
    const v=$('#heroVideo');
    let playing=false;
    v.addEventListener('playing',()=>{
      playing=true;
      document.getElementById('hero').classList.add('video-on');
      gsap.to(v,{opacity:1,duration:1.4,ease:'power2.out'});
    });
    const tryPlay=()=>{const p=v.play();if(p&&p.catch)p.catch(()=>{});};
    tryPlay();
    setTimeout(()=>{if(!playing)tryPlay();},1200);
    setTimeout(()=>{if(!playing){v.style.display='none';}},6000);
  }
  /* ================= DRAWER (mobile) ================= */
  function updateBadge(){
    const n=(state.dough?1:0)+(state.sauce?1:0)+(state.cheese?1:0)+Object.keys(state.meats).length+state.vegs.length+state.extras.length;
    const b=$('#dbBadge');if(b)b.textContent=n;
  }
  document.addEventListener('click',()=>setTimeout(updateBadge,0));
  $('#drawerBtn').addEventListener('click',()=>document.body.classList.add('drawer-open'));
  $('#drawerClose').addEventListener('click',()=>document.body.classList.remove('drawer-open'));
  $('#drawerOverlay').addEventListener('click',()=>document.body.classList.remove('drawer-open'));
  
  /* ================= INGREDIENT WHEEL ================= */
  (function(){
    const MQ=window.matchMedia('(max-width:980px)');
    const wrap=document.querySelector('.stage-wrap');
    if(!wrap)return;
    const ow=document.getElementById('ingWheel');if(ow)ow.remove();
    const ob=document.getElementById('wheelBake');if(ob)ob.remove();
    wrap.insertAdjacentHTML('beforeend','<div id="ingWheel"><div id="wheelRot"></div></div>');
    const wheel=document.getElementById('ingWheel'),rot=document.getElementById('wheelRot');
    document.getElementById('builder').insertAdjacentHTML('beforeend','<button id="wheelBake" class="btn solid">BAKE PIZZA</button>');
    const GR=(c1,c2,c3)=>{const id=nid('g');return[id,'<radialGradient id="'+id+'" cx="40%" cy="34%" r="74%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="62%" stop-color="'+c2+'"/><stop offset="100%" stop-color="'+c3+'"/></radialGradient>'];};
    function icoDough(v){
      if(v===2){const[g,d]=GR('#f4ead2','#e3d4af','#c6b287');return mkSVG(100,'<defs>'+d+'</defs><ellipse cx="50" cy="53" rx="36" ry="31" fill="url(#'+g+')"/><ellipse cx="41" cy="42" rx="12" ry="6" fill="rgba(255,255,255,.45)"/><path d="M32 44q6-6 12-2M56 40q7-4 12 1" fill="none" stroke="rgba(150,130,95,.45)" stroke-width="2" stroke-linecap="round"/>');}
      if(v===1){const[g,d]=GR('#e6d5b2','#c9ad82','#8f744c');return mkSVG(100,'<defs>'+d+'</defs><circle cx="50" cy="52" r="34" fill="url(#'+g+')"/>'+speckles(50,52,26,14,1,2.4,'#5d4326',.8)+'<ellipse cx="40" cy="40" rx="10" ry="6" fill="rgba(255,255,255,.35)"/>');}
      if(v===3){const[g,d]=GR('#f8e8ac','#eecf7e','#c99b45');return mkSVG(100,'<defs>'+d+'</defs><circle cx="50" cy="50" r="34" fill="#d9a75f"/><circle cx="50" cy="50" r="30" fill="#b3271a"/>'+speckles(50,50,29,8,3,5,'#b3271a',1)+'<path d="'+wobbleCircle(50,50,26,12,.12)+'" fill="url(#'+g+')"/>'+speckles(50,50,20,8,1.5,3,'#b06a1c',.85)+'<path d="M38 78q2 8 0 12M60 76q3 7 1 11" stroke="#f2dd94" stroke-width="3" fill="none" stroke-linecap="round"/>');}
      const[g,d]=GR('#ffffff','#f0e8d5','#c9bb9c');return mkSVG(100,'<defs>'+d+'</defs><circle cx="50" cy="52" r="34" fill="url(#'+g+')"/><ellipse cx="39" cy="40" rx="12" ry="7" fill="rgba(255,255,255,.7)"/><path d="M40 62q8 6 18 2" fill="none" stroke="rgba(160,145,110,.35)" stroke-width="2"/>');
    }
    function icoBowl(c,seed){const[g,d]=GR('#f6ecd6','#e2d0ac','#b49b72');let s='<defs>'+d+'</defs><circle cx="50" cy="52" r="34" fill="url(#'+g+')"/><circle cx="50" cy="52" r="26" fill="'+c+'"/><circle cx="50" cy="52" r="16" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/><circle cx="50" cy="52" r="8" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3"/><ellipse cx="41" cy="41" rx="8" ry="4" fill="rgba(255,255,255,.4)"/>';if(seed)s+=speckles(50,52,20,10,1,2,'#f6d5a0',.8);return mkSVG(100,s);}
    function icoTomato(){const[g,d]=GR('#ff6a4d','#d92c14','#8c1206');return mkSVG(100,'<defs>'+d+'</defs><circle cx="50" cy="56" r="31" fill="url(#'+g+')"/><path d="M50 26l4 8 9-5-3 9 10 1-8 6H38l-8-6 10-1-3-9 9 5z" fill="#3f7d2c"/><rect x="48" y="18" width="4" height="10" rx="2" fill="#4c8f36"/><ellipse cx="39" cy="46" rx="9" ry="5" fill="rgba(255,255,255,.4)"/>');}
    function icoShred(w){let s='';for(let i=0;i<16;i++){const x=rand(24,72),y=rand(38,72),a=rand(-50,50),l=rand(14,26);s+='<rect x="'+(x-l/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+l.toFixed(1)+'" height="4.6" rx="2.2" fill="'+pick(w?['#fdf6da','#f4e8b4','#efe0a2']:['#f4e8b4','#e9d78e','#dfc878'])+'" transform="rotate('+a.toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')"/>';}return mkSVG(100,'<ellipse cx="50" cy="70" rx="30" ry="8" fill="rgba(0,0,0,.35)"/>'+s);}
    function icoCube(){const[g,d]=GR('#ffe08a','#f2c243','#c98f1d');return mkSVG(100,'<defs>'+d+'</defs><path d="M26 34h48v34a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6z" fill="url(#'+g+')"/><path d="M26 34l10-12h40l-2 12z" fill="#fbe49c"/><circle cx="42" cy="52" r="6" fill="#d9a127"/><circle cx="60" cy="60" r="4.5" fill="#d9a127"/><circle cx="56" cy="44" r="3.5" fill="#d9a127"/>');}
    function icoBlock(){const[g,d]=GR('#e8c489','#c99b56','#96682f');return mkSVG(100,'<defs>'+d+'</defs><rect x="24" y="34" width="52" height="36" rx="8" fill="url(#'+g+')"/><rect x="24" y="34" width="52" height="10" rx="5" fill="#8a5a26" opacity=".55"/><path d="M32 52q10 4 18 0t18 2" fill="none" stroke="rgba(90,50,15,.4)" stroke-width="3" stroke-linecap="round"/>');}
    function icoPep(){const[g,d]=GR('#e0523a','#a82413','#6d0f07');let s='<defs>'+d+'</defs>';[[38,44],[58,40],[50,58]].forEach(p=>{s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="15" fill="url(#'+g+')"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="15" fill="none" stroke="#5c0d05" stroke-width="2"/>'+speckles(p[0],p[1],10,5,1,2,'#f0b39c',.9);});return mkSVG(100,s);}
    function icoBacon(){return mkSVG(100,'<g transform="rotate(-14 50 50)"><rect x="18" y="40" width="64" height="20" rx="8" fill="#a3341f"/><path d="M20 46q10-4 20 0t20 0 18 0M20 54q10-4 20 0t20 0 18 0" fill="none" stroke="#f2c7b0" stroke-width="4" stroke-linecap="round"/><rect x="18" y="40" width="64" height="20" rx="8" fill="none" stroke="#6d1a0c" stroke-width="2"/></g>');}
    function icoChick(){const[g,d]=GR('#f0d2a0','#d3a76b','#a9763f');return mkSVG(100,'<defs>'+d+'</defs><path d="'+wobbleCircle(50,52,30,10,.14)+'" fill="url(#'+g+')"/><path d="M32 44h36M30 54h40M34 64h32" stroke="#7c4a20" stroke-width="4" opacity=".5" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="9" ry="5" fill="rgba(255,255,255,.3)"/>');}
    function icoSaus(){const[g,d]=GR('#9a5a30','#6e3519','#471e0c');return mkSVG(100,'<defs>'+d+'</defs><g transform="rotate(24 50 50)"><rect x="20" y="40" width="60" height="20" rx="10" fill="url(#'+g+')"/><ellipse cx="34" cy="46" rx="9" ry="4" fill="rgba(255,220,180,.3)"/><path d="M78 44q6 6 0 12" fill="none" stroke="#3a1808" stroke-width="3"/></g>');}
    function icoOlives(){let s='';[[36,40],[58,36],[44,60],[64,58]].forEach(p=>{s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="12" fill="#241a14"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#0d0805"/><path d="M'+(p[0]-8)+' '+(p[1]-6)+'a10 10 0 0 1 6-5" stroke="rgba(255,255,255,.35)" stroke-width="2.5" fill="none" stroke-linecap="round"/>';});return mkSVG(100,s);}
    function icoOnion(){return mkSVG(100,'<circle cx="50" cy="50" r="32" fill="#c0487f"/><circle cx="50" cy="50" r="26" fill="#e79cc0"/><circle cx="50" cy="50" r="20" fill="#f6d7e6"/><circle cx="50" cy="50" r="13" fill="#e79cc0"/><circle cx="50" cy="50" r="7" fill="#f9e6ef"/><ellipse cx="40" cy="38" rx="9" ry="5" fill="rgba(255,255,255,.5)"/>');}
    function icoPepper(){const[g,d]=GR('#7cc46a','#3f8f2f','#1e5c17');return mkSVG(100,'<defs>'+d+'</defs><path d="M50 30c14 0 24 12 24 28 0 16-10 26-24 26S26 74 26 58c0-16 10-28 24-28z" fill="url(#'+g+')"/><path d="M38 34q-4 22 0 44M62 34q4 22 0 44" fill="none" stroke="rgba(20,70,10,.35)" stroke-width="4"/><path d="M50 30q2-10 10-12" fill="none" stroke="#4c8f36" stroke-width="6" stroke-linecap="round"/><ellipse cx="40" cy="44" rx="7" ry="12" fill="rgba(255,255,255,.25)"/>');}
    function icoBasil(){let s='';for(let i=0;i<4;i++){s+='<g transform="rotate('+(i*90+45)+' 50 50)"><path d="M50 12 C64 20 70 36 66 48 C62 58 54 62 50 62 C46 62 38 58 34 48 C30 36 36 20 50 12 Z" fill="url(#bg'+i+')"/></g>';s='<defs><linearGradient id="bg'+i+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4aa44e"/><stop offset="100%" stop-color="#1e5c28"/></linearGradient></defs>'+s;}return mkSVG(100,s+'<circle cx="50" cy="50" r="5" fill="#2c7a34"/>');}
    function icoFlakes(){let s='<circle cx="50" cy="52" r="32" fill="#f2efe6"/><circle cx="50" cy="52" r="25" fill="#8c1a0c"/>';for(let i=0;i<14;i++){s+='<rect x="'+rand(30,66).toFixed(1)+'" y="'+rand(32,68).toFixed(1)+'" width="5" height="4" rx="1" fill="'+pick(['#d84326','#e8632f','#b02210'])+'" transform="rotate('+rand(0,90).toFixed(0)+' 50 50)"/>';}return mkSVG(100,s+speckles(50,52,18,8,.8,1.6,'#f6d5a0',.9));}
    function icoBulb(){const[g,d]=GR('#f6efe2','#dcc9ae','#a98d68');return mkSVG(100,'<defs>'+d+'</defs><path d="M50 22c4 8 2 12 8 16 10 7 16 16 26 0 14-11 22-24 22S26 78 26 64c0-10 6-19 16-26 6-4 4-8 8-16z" fill="url(#'+g+')"/><path d="M40 44q-4 18 0 34M50 42v38M60 44q4 18 0 34" fill="none" stroke="rgba(150,120,80,.4)" stroke-width="2.5"/><path d="M46 22h8l-2-8h-4z" fill="#b49b72"/>');}
    function icoKetchup(){const[g,d]=GR('#ff6a4d','#c2180b','#7a0d04');return mkSVG(100,'<defs>'+d+'</defs><path d="M50 20c8 14 20 22 20 38a20 20 0 1 1-40 0c0-16 12-24 20-38z" fill="url(#'+g+')"/><path d="M22 44l-8-4M78 44l8-4M30 30l-6-8M70 30l6-8M50 12V4" stroke="#d92c14" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="52" rx="7" ry="11" fill="rgba(255,255,255,.3)"/>');}
    function icoTruffle(){let s='';[[40,44,14],[58,40,12],[52,58,15],[66,56,10],[34,58,10]].forEach(p=>{s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+p[2]+'" fill="#191110"/>'+speckles(p[0],p[1],p[2]-2,8,.8,1.8,'#4a382b',.9);});return mkSVG(100,s);}
    const ICON={
      thin:()=>icoDough(2),classic:()=>icoDough(0),thick:()=>icoDough(1),cheese:()=>icoDough(3),
      tomato:icoTomato,spicy:()=>icoBowl('#c22b12',1),bbq:()=>icoBowl('#38150a',0),'sauce:garlic':()=>icoBowl('#efe6cc',0),
      mozzarella:()=>icoShred(0),extra:()=>icoShred(1),four:icoCube,smoked:icoBlock,
      pepperoni:icoPep,beef:icoBacon,chicken:icoChick,sausage:icoSaus,
      olives:icoOlives,mushroom:mushroomSVG,onion:icoOnion,greenPepper:icoPepper,jalapeno:jalapenoSVG,basil:icoBasil,
      extraCheese:()=>icoShred(1),chili:icoFlakes,'extras:garlic':icoBulb,ketchup:icoKetchup,bbqDrizzle:()=>icoBowl('#4a2008',0),truffle:icoTruffle
    };
    const GROUPS=[
      {cat:'dough',label:'DOUGH',color:'#f3e9dc',ids:['thin','classic','thick','cheese']},
      {cat:'sauce',label:'SAUCE',color:'#e0492c',ids:['tomato','spicy','bbq','garlic']},
      {cat:'cheese',label:'CHEESE',color:'#e8b04b',ids:['mozzarella','extra','four','smoked']},
      {cat:'meat',label:'MEAT',color:'#c22b1a',ids:['pepperoni','beef','chicken','sausage']},
      {cat:'veg',label:'VEGGIES',color:'#57a84f',ids:['olives','mushroom','onion','greenPepper','jalapeno','basil']},
      {cat:'extras',label:'EXTRAS',color:'#9b6bd6',ids:['extraCheese','chili','garlic','truffle']}
    ];
    const total=GROUPS.reduce((a,g)=>a+g.ids.length,0),GAP=6,usable=360-GAP*GROUPS.length;
    let ang=-90;const icons=[];
    GROUPS.forEach(g=>{
      const span=usable*g.ids.length/total,start=ang,mid=start+span/2;
      const lab=document.createElement('div');lab.className='wg-label';lab.textContent=g.label;lab.style.color=g.color;
      const mr=mid*Math.PI/180;
      lab.style.left=(50+Math.cos(mr)*50.5)+'%';lab.style.top=(50+Math.sin(mr)*50.5)+'%';
      lab.style.transform='translate(-50%,-50%) rotate('+(mid+90)+'deg)';
      rot.appendChild(lab);
      g.ids.forEach((id,i)=>{
        const a=start+span*((i+.5)/g.ids.length),r=a*Math.PI/180;
        const el=document.createElement('div');el.className='wi';el.dataset.cat=g.cat;el.dataset.id=id;
        el.style.setProperty('--gc',g.color);
        el.style.left=(50+Math.cos(r)*44.3)+'%';el.style.top=(50+Math.sin(r)*44.3)+'%';
        const inn=document.createElement('div');inn.className='wi-in';
        const f=ICON[g.cat+':'+id]||ICON[id];
        if(f)inn.appendChild(f());
        el.appendChild(inn);rot.appendChild(el);icons.push(el);
      });
      ang=start+span+GAP;
    });
    function isOn(cat,id){
      if(cat==='dough')return state.dough===id;
      if(cat==='sauce')return state.sauce===id;
      if(cat==='cheese')return state.cheese===id;
      if(cat==='meat')return id in state.meats;
      if(cat==='veg')return state.vegs.includes(id);
      return state.extras.includes(id);
    }
    function paint(){icons.forEach(el=>el.classList.toggle('on',isOn(el.dataset.cat,el.dataset.id)));}
    function toggle(cat,id){
      if(baseHas(cat,id)){toast('INCLUDED IN COMBO 🔒');return;}
      if(cat==='dough'){state.dough=id;stage.setDough(id,1);}
      else if(cat==='sauce'){state.sauce=id;stage.setSauce(id,1);}
      else if(cat==='cheese'){state.cheese=id;stage.setCheese(id,1);}
      else if(cat==='meat'){if(state.meats[id]){delete state.meats[id];stage.setTopping(id,0,1);}else{state.meats[id]='normal';stage.setTopping(id,TOPCFG[id].counts.normal,1);}}
      else if(cat==='veg'){if(state.vegs.includes(id)){state.vegs=state.vegs.filter(v=>v!==id);stage.setTopping(id,0,1);}else{state.vegs.push(id);stage.setTopping(id,TOPCFG[id].fixed,1);}}
      else{if(state.extras.includes(id)){state.extras=state.extras.filter(v=>v!==id);stage.setExtra(id,false,1);}else{state.extras.push(id);stage.setExtra(id,true,1);}}
      paint();updateBadge();
    }
    let A=0,prevA=0,vel=0,drag=false,lastA=0,lastT=0,moved=0,downEl=null;
    const AUTO=-360/140;
    function center(){const r=wheel.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
    function angOf(e){const c=center();return Math.atan2(e.clientY-c.y,e.clientX-c.x)*180/Math.PI;}
    let axis=null,lastX=0,lastY=0;
    wrap.addEventListener('touchmove',e=>{if(axis==='x')e.preventDefault();},{passive:false});
    wrap.addEventListener('pointerdown',e=>{
      if(!MQ.matches)return;
      if($('#ovenScene').classList.contains('on'))return;
      drag=true;moved=0;vel=0;downEl=e.target.closest('.wi');
      axis=null;lastX=e.clientX;lastY=e.clientY;
      lastA=angOf(e);lastT=performance.now();
    });
    wrap.addEventListener('pointermove',e=>{
      if(!drag)return;
      if(axis===null&&moved>6)axis=Math.abs(e.clientX-lastX)>Math.abs(e.clientY-lastY)?'x':'y';
      lastX=e.clientX;lastY=e.clientY;
      const a=angOf(e);let d=a-lastA;if(d>180)d-=360;if(d<-180)d+=360;
      moved+=Math.abs(d);
      const t=performance.now(),dt=Math.max(8,t-lastT);
      vel=d/dt*1000;A+=d;lastA=a;lastT=t;
    });
    wrap.addEventListener('pointerup',()=>{
      if(!drag)return;drag=false;
      if(moved<7&&downEl)toggle(downEl.dataset.cat,downEl.dataset.id);
      downEl=null;
    });
    wrap.addEventListener('pointercancel',()=>{drag=false;downEl=null;});
    let AC=null,tickAcc=0,builderInView=false;
    new IntersectionObserver(en=>{builderInView=en[0].isIntersecting;},{threshold:.15}).observe(document.getElementById('builder'));
    function initAudio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}else if(AC.state==='suspended')AC.resume();}
    document.addEventListener('pointerdown',initAudio);
    document.addEventListener('touchstart',initAudio,{passive:true});
    function tick(){
      if(!builderInView)return;
      if($('#ovenScene').classList.contains('on'))return;
      if(!AC||AC.state!=='running')return;
      const t=AC.currentTime,o=AC.createOscillator(),gn=AC.createGain();
      o.type='triangle';o.frequency.setValueAtTime(1500+Math.random()*1000,t);
      gn.gain.setValueAtTime(.04,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.05);
      o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+.06);
    }
    let prevT=performance.now();
    function loop(t){
      requestAnimationFrame(loop);
      if(!MQ.matches)return;
      const dt=Math.min(.05,(t-prevT)/1000);prevT=t;
      if(!drag){vel*=Math.pow(.0025,dt);A+=(AUTO+vel)*dt;}
      rot.style.transform='rotate('+A+'deg)';
      for(const el of icons)el.firstChild.style.transform='rotate('+(-A)+'deg)';
      tickAcc+=Math.abs(A-prevA);prevA=A;
      if(tickAcc>5){tickAcc=0;tick();}
    }
    requestAnimationFrame(loop);
    function place(){
      const host=document.getElementById('stageHost');if(!host)return;
      const hr=host.getBoundingClientRect(),wr=wrap.getBoundingClientRect();
      const S=hr.width*1.3;
      wheel.style.width=S+'px';wheel.style.height=S+'px';
      wheel.style.left=(hr.left-wr.left+hr.width/2)+'px';
      wheel.style.top=(hr.top-wr.top+hr.height/2)+'px';
      wheel.style.transform='translate(-50%,-50%)';
    }
    window.addEventListener('resize',place);
    window.addEventListener('orientationchange',()=>setTimeout(place,300));
    window.addEventListener('load',()=>setTimeout(place,200));
    setTimeout(place,300);setTimeout(place,1200);
    document.getElementById('wheelBake').addEventListener('click',()=>{
      if(!state.dough||!state.sauce||!state.cheese){toast('PICK DOUGH, SAUCE & CHEESE FROM THE WHEEL FIRST');return;}
      startBake();
    });
    paint();
  })();
  
  /* ================= MOBILE LIVE PRICE ================= */
  (function(){
    const old=document.getElementById('mPrice');if(old)old.remove();
    document.getElementById('builder').insertAdjacentHTML('beforeend','<div id="mPrice"><span id="mPriceVal">EGP 0</span></div>');
    const pill=document.getElementById('mPrice'),val=document.getElementById('mPriceVal');
    let shown=0;
    function render(){
      const target=effectiveUnit()*orderQty;
      if(target===shown)return;
      const up=target>shown,o={v:shown};
      gsap.to(o,{v:target,duration:.55,ease:'power2.out',onUpdate:()=>{val.textContent='EGP '+Math.round(o.v);}});
      shown=target;
      gsap.fromTo(pill,{scale:1.16},{scale:1,duration:.5,ease:'elastic.out(1,.45)'});
      pill.classList.remove('up','down');void pill.offsetWidth;
      pill.classList.add(up?'up':'down');
      setTimeout(()=>pill.classList.remove('up','down'),700);
    }
    document.addEventListener('click',()=>setTimeout(render,0));
    document.addEventListener('pointerup',()=>setTimeout(render,0));
    window.addEventListener('load',()=>setTimeout(render,150));
    render();
  })();
  
  /* ================= LOADER / INIT ================= */
  async function boot(){
    let done=0;const tot=5;
    const tick=()=>{done++;const p=Math.round(done/tot*100);$('#loadBar').style.width=p+'%';$('#loadPct').textContent=p+'%';};
    const jobs=[
      cutout(IMG.doughThin).then(u=>{DOUGH_SRC.thin=u;tick();}),
      cutout(IMG.doughClassic).then(u=>{DOUGH_SRC.classic=u;tick();}),
      cutout(IMG.doughThick).then(u=>{DOUGH_SRC.thick=u;tick();}),
      cutout(IMG.doughCheese).then(u=>{DOUGH_SRC.cheese=u;tick();}),
      loadImg(IMG.fire).then(tick).catch(tick)
    ];
    await Promise.all(jobs);
    await syncMenuFromServer(); // ← جلب المنيو من السيرفر
    stage=new PizzaStage($('#stageHost'));
    buildRail();goStep(0);buildTabs();renderMenu();renderCart();persistSaved();
    setupScroll();heroFX();
    gsap.to('#loader',{autoAlpha:0,duration:.7,delay:.2,onComplete:()=>$('#loader').remove()});
    gsap.timeline({delay:.5})
      .fromTo('#heroPizza',{scale:.7,autoAlpha:0,rotation:-25},{scale:1,autoAlpha:1,rotation:0,duration:1.5,ease:'power3.out'})
      .fromTo('.h-line span',{yPercent:110},{yPercent:0,duration:1,stagger:.14,ease:'power4.out'},'-=.9')
      .fromTo('.h-sub,.h-cta',{y:26,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.1},'-=.4')
      .fromTo('.h-scroll',{autoAlpha:0},{autoAlpha:1,duration:.6},'-=.2');
    ScrollTrigger.refresh();
  }
  boot();
}