(function(){
  'use strict';
  clearTimeout(window.vsFallback);
  var $=function(id){return document.getElementById(id)};

  var header=document.querySelector('.site-header');
  if(header) window.addEventListener('scroll',function(){header.classList.toggle('scrolled',window.scrollY>60)},{passive:true});

  var toggle=document.querySelector('.nav-toggle');
  var nav=document.querySelector('.main-nav');
  if(toggle&&nav){
    toggle.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
    });
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    })});
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}
    });
  }

  var prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=document.querySelectorAll('.fade-in');
  if(!prefersReduced&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
    },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el)});
  }else{
    els.forEach(function(el){el.classList.add('visible')});
  }

  function say(el,text,err){if(!el)return;el.textContent=text;el.classList.toggle('err',!!err);}

  /* Results lookup: not connected to a results system yet. */
  var rb=$('resultBtn');
  if(rb) rb.addEventListener('click',function(){
    var reg=($('regNo').value||'').trim().toUpperCase(), sem=$('semSelect').value, m=$('resultMsg');
    if(!/^[A-Z0-9]{6,12}$/.test(reg)) return say(m,'Enter a valid register number (letters and digits only).',true);
    if(!sem) return say(m,'Select a semester.',true);
    say(m,'Online results are not available yet. Please check the notice board or contact the examination section.');
  });

  /* Parent login: not connected to a student system yet. */
  var pl=$('parentLogin');
  if(pl) pl.addEventListener('click',function(e){
    e.preventDefault();
    say($('parentMsg'),'Online parent login is coming soon. For attendance or marks, please contact the office.');
  });

  /* Contact form: opens the visitor's email app with the message filled in. No data is stored on this site. */
  var CONTACT_EMAIL='info@vidyasagarcollege.edu.in';
  var cf=$('contactForm');
  if(cf) cf.addEventListener('submit',function(e){
    e.preventDefault();
    var m=$('cfMsg'), name=cf.elements.name.value.trim(), email=cf.elements.email.value.trim(), subj=cf.elements.subject.value||'General', msg=cf.elements.message.value.trim();
    if(name.length<2) return say(m,'Please enter your name.',true);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say(m,'Please enter a valid email address.',true);
    if(msg.length<5) return say(m,'Please write a short message.',true);
    var body='Name: '+name+'\nEmail: '+email+'\n\n'+msg;
    window.location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(subj+' - website enquiry')+'&body='+encodeURIComponent(body);
    say(m,'Opening your email app. If nothing happens, write to '+CONTACT_EMAIL+'.');
  });
})();
