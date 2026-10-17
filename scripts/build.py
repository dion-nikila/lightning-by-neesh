"""Build Lightning's static pages. Run with Python 3; no dependencies required."""
import argparse
import json
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', default='/lightning-by-neesh/')
parser.add_argument('--origin', default='https://dion-nikila.github.io')
args = parser.parse_args()
BASE = '/' + args.base_path.strip('/') + '/' if args.base_path.strip('/') else '/'
ORIGIN = args.origin.rstrip('/')
IG = 'https://www.instagram.com/lightningbyneesh/'
SHOP = 'https://lightningbyneesh.netlify.app/'
TITANS = 'https://docs.google.com/forms/d/e/1FAIpQLSeQ7OkRUA-1Qrp-qaHRxYqwZ5GfH3_3MBHvfNDci7kBqn_byA/viewform?usp=send_form'
CALENDAR = 'https://www.instagram.com/p/DeeZkSfP3zt/'
EVENTS = json.loads((ROOT / 'content/events.json').read_text())
EXT = ' target="_blank" rel="noopener noreferrer"'


def url(path=''):
    return BASE + path.lstrip('/')


def icon(name='arrow', extra=''):
    return f'<svg aria-hidden="true" class="icon {extra}"><use href="#{name}"></use></svg>'


def link(text, target, kind='button', external=False):
    return f'<a class="{kind}" href="{target}"{EXT if external else ""}>{text}{icon()}</a>'


def image(name, alt, class_name='', lazy=True):
    return f'<img class="{class_name}" src="{url("assets/" + name)}" alt="{escape(alt, quote=True)}" width="480" height="640" {"loading=lazy" if lazy else "fetchpriority=high"}>'


def brand():
    return f'<img src="{url("assets/original-logo.jpg")}" width="150" height="150" alt=""><span>lightning<small>BY NEESH</small></span>'


DEFS = '''<svg class="svg-defs" aria-hidden="true"><defs>
<symbol id="arrow" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="diagonal" viewBox="0 0 24 24"><path d="m5 19 14-14M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="calendar" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 3v5m8-5v5M4 11h16m-12 4h2m4 0h2m-8 3h2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
<symbol id="bolt" viewBox="0 0 100 160"><path d="M54 0H98L61 61H91L6 160L38 83H8Z" fill="currentColor"/></symbol>
<symbol id="pin" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
</defs></svg>'''


def header(page):
    items = [('runs', 'Runs', url('#runs')), ('club', 'The club', url('club/')), ('faq', 'FAQ', url('faq/'))]
    links = ''.join(f'<a href="{target}"{" aria-current=page" if page == key else ""}>{text}</a>' for key, text, target in items)
    links += f'<a href="{SHOP}"{EXT}>Shop {icon("diagonal")}</a>'
    return f'''<header class="header"><a class="brand" href="{url()}" aria-label="Lightning by Neesh home">{brand()}</a>
<nav class="desktop-nav" aria-label="Main">{links}</nav>{link('Find a run', url('#runs'), 'header-cta')}
<button class="menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>{links}<a class="mobile-social" href="{IG}"{EXT}>Message the crew {icon('diagonal')}</a><p>Running & community.<br>Sri Lanka.</p></nav>'''


def footer():
    return f'''<footer class="footer"><div class="footer-top"><p>See you at the next one.</p><div>{link('Instagram', IG, 'footer-link', True)}{link('Shop', SHOP, 'footer-link', True)}{link('Become a Titan', TITANS, 'footer-link', True)}</div></div>
<a class="footer-wordmark" href="{url()}" aria-label="Lightning by Neesh home">lightning<span>{icon('bolt')}</span></a>
<div class="footer-bottom"><span>BY NEESH / SRI LANKA</span><span>© 2026 LIGHTNING</span><a href="{url('faq/')}">First run? Start here {icon()}</a></div></footer>'''


def event_rows(page):
    heading = 'h3' if page == 'home' else 'h2'
    rows = []
    for index, e in enumerate(EVENTS):
        d = date.fromisoformat(e['date'])
        registration = link('Register', e['registration'], 'event-register', True) if e.get('registration') else ''
        rows.append(f'''<article class="event-row{' is-next' if index == 0 else ''}" data-event="{e['id']}">
<div class="event-date"><span>{d.strftime('%a')}</span><time datetime="{e['date']}"><b>{d.day:02}</b><span>{d.strftime('%b')}</span></time></div>
<div class="event-main"><div class="event-title-line"><{heading}>{escape(e['name'])}</{heading}>{'<span class="next-tag">Next up</span>' if index == 0 else ''}</div><p>{escape(e['venue'])}<span>{escape(e['city'])} <i>·</i> Time TBA</span></p></div>
<div class="event-actions">{registration}<button class="event-details" data-event-details="{e['id']}" aria-label="Details for {escape(e['name'])}, {d.day} {d.strftime('%B')}">Details {icon()}</button></div></article>''')
    return '\n'.join(rows)


def calendar(page='home'):
    heading = 'h2' if page == 'home' else 'h1'
    return f'''<section class="calendar-section section-wrap" id="runs" aria-labelledby="calendar-title">
<div class="section-heading"><div><p class="eyebrow calendar-period">THE CALENDAR / OCT—NOV 2026</p><{heading} id="calendar-title">Upcoming runs<span class="red-dot">.</span></{heading}></div></div>
<div class="calendar-toolbar"><div class="filters" data-filters role="group" aria-label="Filter runs by location" hidden><button data-filter="all" aria-pressed="true">All runs</button><button data-filter="colombo" aria-pressed="false">Colombo</button><button data-filter="south" aria-pressed="false">Down south</button></div><a href="{CALENDAR}" class="original-calendar"{EXT}>Original calendar {icon('diagonal')}</a></div>
<p class="events-status sr-only" aria-live="polite">5 events shown.</p><div class="event-list">{event_rows(page)}</div>
<p class="empty-events" hidden>No upcoming runs here yet. <a href="{IG}"{EXT}>Get updates on Instagram</a>.</p>
<div class="calendar-footnote"><p>{icon('calendar')} Times and final details are shared on Instagram.</p><a href="{IG}"{EXT}>Message the crew {icon('diagonal')}</a></div></section>'''


hero = f'''<section class="home-hero" aria-labelledby="hero-title"><div class="hero-photos">
<figure class="hero-shot shot-one">{image('the-community.jpg', 'The Lightning crew together after a run', lazy=False)}</figure>
<figure class="hero-shot shot-two">{image('neesh-running.jpg', 'Neesh with the community at a gathering', lazy=False)}</figure>
<figure class="hero-shot shot-three">{image('after-dark.jpg', 'The Lightning crew celebrating together in the evening', lazy=False)}</figure></div>
<div class="hero-content"><p class="hero-label">{icon('bolt')} RUNNING & COMMUNITY / SRI LANKA</p><div class="hero-message"><h1 id="hero-title">Real people.<br>Real energy.</h1><div class="hero-bottom"><p>Runs, raves and good company<br>in Sri Lanka.</p>{link('Find your next run', '#runs', 'button button-light')}</div></div></div>
<span class="hero-index" aria-hidden="true">LIGHTNING / THE CREW</span></section>'''

home_club = f'''<section class="club-preview section-wrap"><div class="club-preview-photo">{image('neesh.jpg', 'Neesh wearing his red Lightning cape')}<span>THE MAN BEHIND THE CAPE</span></div><div class="club-preview-copy"><p class="eyebrow">MEET LIGHTNING</p><blockquote>“I want it to be<br>everyone’s space.”</blockquote><p class="quote-credit">Neesh / Founder</p>{link('The story so far', url('club/'), 'text-link')}</div></section>'''

club = f'''<section class="club-intro-section section-wrap"><p class="eyebrow">LIGHTNING / BY NEESH</p><div><h1>Put yourself<br>out there<span class="red-dot">.</span></h1><p>A run club. A social community.<br>Started by Neesh in Sri Lanka.</p></div></section>
<section class="club-feature section-wrap"><figure>{image('neesh.jpg', 'Neesh in his red Lightning cape', lazy=False)}<figcaption>NEESH / THE PERSON BEHIND LIGHTNING</figcaption></figure><div><p class="eyebrow">HOW IT STARTED</p><h2>From London<br>to Sri Lanka.</h2><p>Inspired by the running communities he found in London, Neesh brought the idea home to Sri Lanka. Lightning brings people together through runs, raves and everything in between.</p><blockquote>“I want it to be everyone’s space.”</blockquote><p class="quote-credit">— Neesh, <a href="https://www.themorning.lk/articles/TgufPVGjrTzKrhkP7uJA"{EXT}>in conversation with The Morning {icon('diagonal')}</a></p>{link('Find a run', url('#runs'), 'button button-blue')}</div></section>
<section class="crew-section section-wrap" id="photos"><div class="section-heading"><div><p class="eyebrow">THE PEOPLE MAKE IT</p><h2>The crew<span class="red-dot">.</span></h2></div>{link('More on Instagram', IG, 'text-link', True)}</div><div class="crew-gallery">'''+''.join(f'''<button class="gallery-item" data-photo="{url('assets/' + file)}" data-caption="{caption}" aria-label="Enlarge photo: {alt}">{image(file, alt)}<span>{caption}{icon('diagonal')}</span></button>''' for file, alt, caption in [('the-community.jpg','the Lightning crew after a run','After the run'),('neesh-running.jpg','Neesh and friends at a gathering','With the crew'),('after-dark.jpg','the Lightning crew celebrating','When the run is over')])+f'''</div></section>'''

questions = [
 ('What is Lightning?', 'A running and social community started by Neesh in Sri Lanka. We get together for runs, Run & Rave events, and good company.'),
 ('New to running. Where do I start?', f'<a href="{IG}"{EXT}>Message the crew</a> before your first session. Tell us a little about your experience and ask about the run’s distance and pace groups.'),
 ('Where and when do you meet?', f'The <a href="{url("#runs")}">calendar</a> lists announced dates and venues. Meeting points and times are shared on <a href="{IG}"{EXT}>Instagram</a> before each event.'),
 ('How do I register?', f'The 25 October Run & Rave has an <a href="https://forms.gle/YMSQNW1HVaTymotc6"{EXT}>official registration form</a>. For other dates, check the crew’s latest announcement. Entry details and availability are set by the organisers.'),
 ('What should I bring?', 'Running shoes, water, and anything listed in the event announcement.'),
 ('Where can I get Lightning merch?', f'Browse the <a href="{SHOP}"{EXT}>official shop</a>, or message the crew about availability.')
]
faq = f'''<section class="faq-section section-wrap"><div class="faq-intro"><p class="eyebrow">BEFORE YOU JOIN</p><h1>Good<br>questions<span class="red-dot">.</span></h1><p>First run? You’re in the right place.</p>{link('Ask the crew', IG, 'text-link', True)}</div><div class="faq-list">'''+''.join(f'''<details{' open' if i == 0 else ''}><summary><span class="question-number">{i+1:02}</span><span>{q}</span><i aria-hidden="true"></i></summary><div class="faq-answer"><p>{answer}</p></div></details>''' for i,(q,answer) in enumerate(questions))+'''</div></section>'''


def dialogs():
    return f'''<dialog class="event-dialog" id="event-dialog" aria-labelledby="event-title"><button class="close-dialog" aria-label="Close event details">×</button>
<div class="dialog-copy"><p class="eyebrow dialog-date"></p><h2 id="event-title"></h2><div class="dialog-location">{icon('pin')}<div><p class="dialog-venue"></p><p class="dialog-city"></p></div></div><p class="dialog-time">Time to be announced</p><p class="dialog-help">Check the crew’s latest announcement before heading out.</p><a class="registration-link button button-blue" href="{IG}"{EXT}>Event updates {icon()}</a><div class="dialog-tools"><button class="save-date">{icon('calendar')} Save the date</button><button class="share-event">Copy link {icon('diagonal')}</button></div><p class="calendar-note">Adds a tentative all-day calendar reminder.</p><p class="dialog-status" role="status" aria-live="polite"></p></div><img class="dialog-poster" src="{url('assets/run-and-rave.jpg')}" alt="Lightning’s official Run & Rave announcement" hidden></dialog>
<dialog class="photo-dialog" id="photo-dialog" aria-label="Lightning community photo"><button class="close-dialog" aria-label="Close photo">×</button><img class="photo-image" src="{url('assets/the-community.jpg')}" alt=""><div class="photo-controls"><button class="photo-prev" aria-label="Previous photo">←</button><p class="photo-caption"></p><button class="photo-next" aria-label="Next photo">→</button></div></dialog><div class="toast" role="status" aria-live="polite"></div>'''


def page(name, title, description, content):
    path = '' if name == 'home' else name + '/'
    event_data = json.dumps([{**e, **({'poster': url(e['poster'])} if e.get('poster') else {})} for e in EVENTS]).replace('<', '\\u003c')
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f3ec"><meta name="description" content="{escape(description, quote=True)}"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:type" content="website"><meta property="og:url" content="{ORIGIN}{url(path)}"><meta property="og:image" content="{ORIGIN}{url('assets/the-community.jpg')}"><link rel="canonical" href="{ORIGIN}{url(path)}"><link rel="icon" href="{url('assets/original-logo.jpg')}"><link rel="preload" href="{url('assets/archivo-900.ttf')}" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="{url('style.css')}?v=20261017"><script id="event-data" type="application/json">{event_data}</script><script src="{url('app.js')}?v=20261017" defer></script><title>{title}</title></head>
<body class="page-{name}">{DEFS}<a class="skip" href="#main">Skip to content</a><div class="site-shell">{header(name)}<main id="main">{content}</main>{footer()}</div>{dialogs()}</body></html>'''
    target = ROOT / path / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)


page('home', 'Lightning by Neesh — Runs, raves & good company', 'Runs, raves and good company in Sri Lanka. Find your next run with Lightning by Neesh.', hero + calendar() + home_club)
page('runs', 'The runs — Lightning by Neesh', 'Announced Lightning runs in Colombo, Weligama and Ahangama.', calendar('runs'))
page('club', 'The club — Lightning by Neesh', 'Meet Neesh and the people who make Lightning.', club)
page('faq', 'Before you join — Lightning by Neesh', 'Practical answers for your first Lightning run.', faq)
print('Built 4 Lightning pages.')
