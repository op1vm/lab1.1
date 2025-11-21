document.addEventListener('DOMContentLoaded', function(){
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if(navToggle && navMenu){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.style.display = expanded ? 'none' : 'block';
    });
  }

  // dropdown toggles
  document.querySelectorAll('.has-dropdown .drop-toggle').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const parent = btn.parentElement;
      const dd = parent.querySelector('.dropdown');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if(dd) dd.style.display = expanded ? 'none' : 'block';
    });
  });

  // simple responsive behavior: hide menu on resize > 800 to restore desktop layout
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 800){
      if(navMenu) navMenu.style.display = 'flex';
      document.querySelectorAll('.dropdown').forEach(d=> d.style.display = 'none');
      document.querySelectorAll('.drop-toggle').forEach(b=> b.setAttribute('aria-expanded','false'));
      if(navToggle) navToggle.setAttribute('aria-expanded','false');
    } else {
      if(navMenu) navMenu.style.display = 'none';
    }
  });
});