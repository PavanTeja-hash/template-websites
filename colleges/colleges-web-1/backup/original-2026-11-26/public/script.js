(function(){
  'use strict';
  const header=document.querySelector('.site-header');
  window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',window.scrollY>60)},{passive:true});

  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){
    toggle.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',open);
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }));
  }

  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els=document.querySelectorAll('.fade-in,.wipe-in');
  if(!prefersReduced&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
    },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
    els.forEach(el=>io.observe(el));
    setTimeout(()=>els.forEach(el=>el.classList.add('visible')),4000);
  }else{
    els.forEach(el=>el.classList.add('visible'));
  }
})();
