/* === Dakshin Yatra Tours: script.js === */
(function(){
  'use strict';

  /* Settings: change these before going live */
  var WHATSAPP_NUMBER='919876543210'; /* country code + number, no + or spaces */

  var root=document.documentElement;
  if(window.dyFallback) clearTimeout(window.dyFallback);

  /* --- Header scroll --- */
  var header=document.querySelector('.site-header');
  if(header){
    var onScroll=function(){header.classList.toggle('scrolled',window.scrollY>60);};
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  /* --- Mobile nav toggle --- */
  var toggle=document.querySelector('.nav-toggle');
  var nav=document.querySelector('.main-nav');
  if(toggle&&nav){
    var close=function(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
    toggle.addEventListener('click',function(){
      toggle.setAttribute('aria-expanded',String(nav.classList.toggle('open')));
    });
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  }

  /* --- Reveal animations (only when html has .js) --- */
  var els=document.querySelectorAll('.fade-in,.reveal-mask,.wipe-in');
  var showAll=function(){els.forEach(function(el){el.classList.add('visible');});};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
    showAll();
  }else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}
      });
    },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el);});
    setTimeout(showAll,4000);
  }

  /* --- Footer year --- */
  var yr=document.getElementById('year');
  if(yr) yr.textContent=new Date().getFullYear();

  /* --- Form --- */
  var form=document.getElementById('enquiryForm');
  if(!form) return;

  var dateInput=form.querySelector('#tdate');
  if(dateInput){
    var d=new Date();
    dateInput.min=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  /* Book buttons preselect the trip chip */
  document.querySelectorAll('[data-service]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      var svc=btn.getAttribute('data-service');
      var chip=form.querySelector('input[name="service"][value="'+svc+'"]')||
               (/day trip/i.test(svc)?form.querySelector('input[name="service"][value="Day trip"]'):null);
      if(chip) chip.checked=true;
      if(/day trip/i.test(svc)){
        var notes=form.querySelector('#notes');
        if(notes&&!notes.value) notes.value=svc;
      }
      document.getElementById('enquiry').scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(function(){form.querySelector('#fname').focus({preventScroll:true});},500);
    });
  });

  var name=form.querySelector('#fname');
  var phone=form.querySelector('#phone');
  [name,phone].forEach(function(f){
    f.addEventListener('input',function(){
      if(f.classList.contains('invalid')&&f.value.trim()&&f.checkValidity()){
        f.classList.remove('invalid');f.removeAttribute('aria-invalid');
      }
    });
  });

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(form.querySelector('[name="honeypot"]').value) return;

    phone.value=phone.value.replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,'');
    var first=null;
    [name,phone].forEach(function(f){
      var bad=!f.value.trim()||!f.checkValidity();
      f.classList.toggle('invalid',bad);
      if(bad){f.setAttribute('aria-invalid','true');first=first||f;}
      else f.removeAttribute('aria-invalid');
    });
    if(first){first.focus();return;}

    var svcEl=form.querySelector('input[name="service"]:checked');
    var lines=[
      'Hi Dakshin Yatra, I would like to enquire.',
      'Name: '+name.value.trim(),
      'Phone: '+phone.value,
      'Trip: '+(svcEl?svcEl.value:'Not selected'),
      'People: '+(form.querySelector('#travelers').value||'Not specified'),
      'Date: '+(dateInput.value||'Flexible'),
      'Notes: '+(form.querySelector('#notes').value.trim()||'None')
    ];
    var url='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));
    var w=window.open(url,'_blank');
    if(w) w.opener=null; else window.location.href=url;
  });
})();
