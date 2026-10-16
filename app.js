(() => {
  'use strict';
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const instagram='https://www.instagram.com/lightningbyneesh/';
  const events=[
    {id:'oct25',day:'25',month:'OCT',date:'2026-10-25',name:'RUN & RAVE',region:'colombo',city:'Colombo',venue:'Kai Havelock',registration:'https://forms.gle/YMSQNW1HVaTymotc6'},
    {id:'nov08',day:'08',month:'NOV',date:'2026-11-08',name:'RUN & RAVE',region:'colombo',city:'Colombo',venue:'Venue to be announced'},
    {id:'nov14',day:'14',month:'NOV',date:'2026-11-14',name:'RUN & RAVE',region:'south',city:'Weligama',venue:'Kai Weligama'},
    {id:'nov21',day:'21',month:'NOV',date:'2026-11-21',name:'RUN & RAVE',region:'south',city:'Ahangama',venue:'Kai Ahangama'},
    {id:'nov22',day:'22',month:'NOV',date:'2026-11-22',name:'RUN CLUB',region:'colombo',city:'Colombo',venue:'Meeting point to be announced'}
  ];
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const upcoming=events.filter(e=>e.date>=today), visibleEvents=upcoming.length?upcoming:events;
  const arrow='<svg aria-hidden="true"><use href="#arrow"/lightning-by-neesh/></svg>';
  let selectedEvent, lastTrigger;
  const list=$('#event-list');
  function render(region='all'){
    if(!list)return;
    const filtered=visibleEvents.filter(e=>region==='all'||e.region===region);
    const heading=document.body.classList.contains('page-home')?'h3':'h2';
    list.innerHTML=filtered.length?filtered.map(e=>`<article data-event="${e.id}" class="event-row ${e.id===upcoming[0]?.id?'next':''}"><p class="event-date">${e.day}<small>${e.month}</small></p><${heading} class="event-name">${e.name}</${heading}><p class="event-venue">${e.venue}<span>${e.city}${e.date<today?' · Archive':''}</span></p><button class="view-event" data-event="${e.id}" aria-label="View ${e.name.toLowerCase()}, ${e.city}, ${e.day} ${e.month}">${arrow}</button></article>`).join(''):`<p class="empty-events">No upcoming runs here yet. <a href="${instagram}" target="_blank" rel="noopener noreferrer">Get updates ↗</a></p>`;
    $('.events-status').textContent=`${filtered.length} events shown.`;
    $$('.event-row',list).forEach(row=>row.addEventListener('click',()=>openEvent(row.dataset.event,$('.view-event',row))));
  }
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{$$('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});render(button.dataset.filter);}));
  function showDialog(dialog,trigger){lastTrigger=trigger;dialog.showModal();document.body.classList.add('locked');}
  function openEvent(id,trigger){
    selectedEvent=events.find(e=>e.id===id);const e=selectedEvent,dialog=$('#event-dialog');
    $('.dialog-date',dialog).textContent=`${e.day} ${e.month} 2026 · ${e.city.toUpperCase()}`;
    $('#event-title').textContent=e.name;
    $('.dialog-venue',dialog).textContent=e.venue;
    $('.save-date',dialog).hidden=e.date<today;
    $('.calendar-note',dialog).hidden=e.date<today;
    const registration=$('.registration-link',dialog);
    registration.href=e.date>=today?(e.registration||instagram):instagram;
    registration.innerHTML=(e.registration&&e.date>=today?'Register':'Event updates')+' '+arrow;
    showDialog(dialog,trigger);
  }
  const firstChoice=upcoming.find(e=>e.name==='RUN & RAVE')||upcoming[0];
  const remainingChoices=upcoming.filter(e=>e.id!==firstChoice?.id);
  const heroChoices=[firstChoice,remainingChoices.find(e=>e.name==='RUN CLUB')||remainingChoices[0]];
  $$('[data-open-event]').forEach((button,index)=>{
    const e=heroChoices[index];
    if(e){button.dataset.openEvent=e.id;button.setAttribute('aria-label',`View ${e.name.toLowerCase()}, ${e.city}, ${e.day} ${e.month}`);button.innerHTML=`<span class="activity-label"><svg aria-hidden="true"><use href="#runner"/lightning-by-neesh/></svg> ${e.name==='RUN CLUB'?'Run Club':'Run & Rave'} ${arrow}</span><strong>${e.day}<span>${e.month}</span></strong><span class="activity-place">${e.venue==='Meeting point to be announced'?e.city:e.venue+' · '+e.city}</span>`;}
    else{button.dataset.openEvent='';button.setAttribute('aria-label','Get new run dates on Instagram');button.innerHTML=`<span class="activity-label">Upcoming runs ${arrow}</span><strong class="soon">SOON</strong><span class="activity-place">New dates on Instagram</span>`;}
    button.addEventListener('click',()=>{if(button.dataset.openEvent)openEvent(button.dataset.openEvent,button);else window.open(instagram,'_blank','noopener,noreferrer');});
  });
  $$('dialog').forEach(dialog=>{
    $('.close-dialog',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{document.body.classList.remove('locked');lastTrigger?.focus({preventScroll:true});});
  });
  $$('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const dialog=$('#photo-dialog');$('img',dialog).src=button.dataset.photo;$('img',dialog).alt=$('img',button).alt;showDialog(dialog,button);}));
  $('.save-date')?.addEventListener('click',()=>{
    const e=selectedEvent;if(!e)return;
    const nextDay=new Date(e.date+'T00:00:00Z');nextDay.setUTCDate(nextDay.getUTCDate()+1);
    const esc=s=>s.replaceAll('\\','\\\\').replaceAll(';','\\;').replaceAll(',','\\,').replaceAll('\n','\\n');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lightning by Neesh//Runs//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:lightning-${e.id}-2026@lightningbyneesh`,`DTSTAMP:${new Date().toISOString().replaceAll(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${e.date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${nextDay.toISOString().slice(0,10).replaceAll('-','')}`,`SUMMARY:${esc('Lightning — '+e.name+' · '+e.city)}`,`LOCATION:${esc(e.venue)}`,`DESCRIPTION:${esc('Time to be announced. Check '+instagram)}`,'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`lightning-${e.date}.ics`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);const toast=$('.toast');toast.textContent='Date saved. Check Instagram for the time.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3500);
  });
  const menu=$('.menu-button'), mobile=$('#mobile-nav');
  const menuBackground=[$('main'),$('.footer'),$('.header .brand'),$('.skip')];
  function setMenuBackground(open){menuBackground.forEach(element=>{if(element)element.inert=open;});}
  function closeMenu(){setMenuBackground(false);mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');document.body.classList.remove('locked');}
  menu.addEventListener('click',()=>{const opening=mobile.hidden;setMenuBackground(opening);mobile.hidden=!opening;menu.setAttribute('aria-expanded',String(opening));menu.setAttribute('aria-label',opening?'Close menu':'Open menu');document.body.classList.toggle('locked',opening);});
  $$('a',mobile).forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){closeMenu();menu.focus();}if(e.key==='Tab'&&!mobile.hidden){const links=$$('a',mobile);if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();menu.focus();}else if(e.shiftKey&&document.activeElement===menu){e.preventDefault();links.at(-1).focus();}}});
  addEventListener('resize',()=>{if(innerWidth>700&&!mobile.hidden)closeMenu();});
  render();
  const route=$('.route-trace');if(route){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){route.classList.add('is-visible');observer.disconnect();}},{threshold:.25});observer.observe(route);}
  if(list&&!upcoming.length){const label=$('.calendar-head .label');if(label)label.textContent='PAST RUNS / OCT—NOV 2026';const title=$('.calendar-head h1,.calendar-head h2');if(title)title.innerHTML='PAST<br><em>RUNS.</em>';}
  const legacy={'#moments':'/lightning-by-neesh/club/#photos','#the-club':'/lightning-by-neesh/club/','#events':'/lightning-by-neesh/#runs','#faq':'/lightning-by-neesh/faq/'};
  if(location.pathname==='/lightning-by-neesh/'&&legacy[location.hash])location.replace(legacy[location.hash]);
})();
