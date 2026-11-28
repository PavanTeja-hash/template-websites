(function(){
var WHATSAPP_NUMBER='919820456789';
var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
var dt0=document.getElementById('bk-date');if(dt0)dt0.min=new Date().toISOString().slice(0,10);
var nav=document.getElementById('nav');
if(!nav){clearTimeout(window.pcFallback);return;}
window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>60)},{passive:true});
var ham=document.getElementById('hamburger'),mob=document.getElementById('mobileMenu');
ham.addEventListener('click',function(){ham.classList.toggle('active');mob.classList.toggle('open');var o=mob.classList.contains('open');ham.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';});
mob.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){ham.classList.remove('active');mob.classList.remove('open');ham.setAttribute('aria-expanded','false');document.body.style.overflow='';});});

if('IntersectionObserver' in window){
var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});}
clearTimeout(window.pcFallback);

var overlay=document.getElementById('drawerOverlay'),drawer=document.getElementById('drawer'),closeBtn=document.getElementById('drawerClose');
var lastFocus=null;
function openD(){lastFocus=document.activeElement;overlay.classList.add('open');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(function(){document.getElementById('bk-name').focus();},50);}
function closeD(){overlay.classList.remove('open');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
document.addEventListener('keydown',function(e){if(!drawer.classList.contains('open'))return;if(e.key==='Escape'){closeD();return;}if(e.key==='Tab'){var f=drawer.querySelectorAll('button,input,select,textarea');var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
document.querySelectorAll('.book-trigger').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openD();});});
closeBtn.addEventListener('click',closeD);
overlay.addEventListener('click',closeD);

document.getElementById('bookingForm').addEventListener('submit',function(e){
e.preventDefault();
var nm=document.getElementById('bk-name').value,ph=document.getElementById('bk-phone').value,ev=document.getElementById('bk-event').value,gs=document.getElementById('bk-guests').value;
var err=document.getElementById('bk-error');nm=nm.trim();var digits=ph.replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,'');
if(!nm||!ev||!gs){err.textContent='Please fill in your name, event type and guest count.';return;}
if(!/^[6-9]\d{9}$/.test(digits)){err.textContent='Please enter a valid 10-digit mobile number.';document.getElementById('bk-phone').focus();return;}
err.textContent='';ph='+91 '+digits;
var msg='Hi NEXEVENT, I need help with an event:\n\nName: '+nm+'\nPhone: '+ph;
var co=document.getElementById('bk-company').value;if(co)msg+='\nCompany: '+co;
msg+='\nEvent: '+ev+'\nGuests: '+gs;
var ci=document.getElementById('bk-city').value;if(ci)msg+='\nCity: '+ci;
var dt=document.getElementById('bk-date').value;if(dt)msg+='\nDate: '+dt;
var nt=document.getElementById('bk-notes').value;if(nt)msg+='\nBrief: '+nt;
window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener');
closeD();
});

document.querySelectorAll('a[href^="#"]').forEach(function(a){
a.addEventListener('click',function(e){
var h=this.getAttribute('href');if(h.length<2)return;var t=document.getElementById(h.slice(1));
if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
});
});
})();
