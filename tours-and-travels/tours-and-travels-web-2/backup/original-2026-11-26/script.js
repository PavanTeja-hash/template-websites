/* === Dakshin Yatra Tours — script.js === */
(function(){
  'use strict';

  /* --- Header scroll --- */
  const header=document.querySelector('.site-header');
  let lastY=0;
  window.addEventListener('scroll',()=>{
    header.classList.toggle('scrolled',window.scrollY>60);
    lastY=window.scrollY;
  },{passive:true});

  /* --- Mobile nav toggle --- */
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

  /* --- IntersectionObserver animations --- */
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!prefersReduced){
    const els=document.querySelectorAll('.fade-in,.reveal-mask,.wipe-in');
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
      els.forEach(el=>io.observe(el));
    }
    /* 4-second fallback */
    setTimeout(()=>els.forEach(el=>el.classList.add('visible')),4000);
  }else{
    document.querySelectorAll('.fade-in,.reveal-mask,.wipe-in').forEach(el=>el.classList.add('visible'));
  }

  /* --- Book button preselect service chip --- */
  document.querySelectorAll('[data-service]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const svc=btn.getAttribute('data-service');
      const chip=document.querySelector('#svc-'+svc.toLowerCase().replace(/\s+/g,'-'));
      if(chip) chip.checked=true;
      const form=document.getElementById('enquiry-form');
      if(form) form.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  /* --- Form validation & WhatsApp submit --- */
  const form=document.getElementById('enquiry-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      /* Honeypot */
      if(form.querySelector('[name="website"]').value) return;

      let valid=true;
      const name=form.querySelector('#f-name');
      const phone=form.querySelector('#f-phone');

      [name,phone].forEach(f=>{
        f.classList.remove('invalid');
        if(!f.value.trim()||!f.checkValidity()){f.classList.add('invalid');valid=false;}
      });
      if(!valid) return;

      const svcEl=form.querySelector('input[name="service"]:checked');
      const svc=svcEl?svcEl.value:'Not selected';
      const travelers=form.querySelector('#f-travelers').value||'Not specified';
      const date=form.querySelector('#f-date').value||'Flexible';
      const notes=form.querySelector('#f-notes').value||'None';

      const msg=
        `Hi Dakshin Yatra! I'd like to enquire:%0A`+
        `Name: ${encodeURIComponent(name.value.trim())}%0A`+
        `Phone: ${encodeURIComponent(phone.value.trim())}%0A`+
        `Service: ${encodeURIComponent(svc)}%0A`+
        `Travelers: ${encodeURIComponent(travelers)}%0A`+
        `Date: ${encodeURIComponent(date)}%0A`+
        `Notes: ${encodeURIComponent(notes)}`;

      window.open('https://wa.me/919876543210?text='+msg,'_blank');
    });
  }
})();
