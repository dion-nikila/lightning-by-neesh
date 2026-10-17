(() => {
  'use strict';

  function initialize() {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const instagram = 'https://www.instagram.com/lightningbyneesh/';
    const eventDialog = $('#event-dialog');
    const photoDialog = $('#photo-dialog');
    const menuButton = $('.menu-button');
    const mobileNav = $('#mobile-nav');
    const toastElement = $('.toast');
    const dialogTriggers = new WeakMap();
    const suppressFocusRestore = new WeakSet();
    let selectedEvent = null;
    let toastTimer;

    function notify(message) {
      const activeStatus = $('dialog[open] .dialog-status');
      if (activeStatus) {
        activeStatus.textContent = message;
        return;
      }
      if (!toastElement) return;
      clearTimeout(toastTimer);
      toastElement.textContent = message;
      toastElement.classList.add('show');
      toastTimer = setTimeout(() => toastElement.classList.remove('show'), 4000);
    }

    function isVisible(element) {
      return Boolean(element && element.isConnected && !element.closest('[hidden], [inert]') &&
        element.getClientRects().length);
    }

    function syncScrollLock() {
      const menuOpen = mobileNav && !mobileNav.hidden;
      document.body.classList.toggle('locked', Boolean(menuOpen || $('dialog[open]')));
    }

    function setText(selector, value, root = document) {
      const element = $(selector, root);
      if (element) element.textContent = value;
    }

    function httpURL(value) {
      if (typeof value !== 'string' || !value.trim()) return null;
      try {
        const url = new URL(value, document.baseURI);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    }

    function localDate() {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Colombo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
      return values.year + '-' + values.month + '-' + values.day;
    }

    const today = localDate();
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    function calendarDate(date) {
      return new Date(date + 'T12:00:00Z');
    }

    function validDate(value) {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = calendarDate(value);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function readEvents() {
      const data = $('#event-data');
      if (!data) return { ready: false, events: [] };
      try {
        const parsed = JSON.parse(data.textContent);
        if (!Array.isArray(parsed)) return { ready: false, events: [] };
        const ids = new Set();
        const events = parsed.filter(event => {
          if (!event || typeof event.id !== 'string' || !event.id.trim() ||
              !validDate(event.date) || typeof event.name !== 'string' ||
              !event.name.trim() || ids.has(event.id)) return false;
          ids.add(event.id);
          return true;
        }).map(event => ({
          id: event.id,
          date: event.date,
          name: event.name,
          region: typeof event.region === 'string' ? event.region : '',
          city: typeof event.city === 'string' ? event.city : '',
          venue: typeof event.venue === 'string' ? event.venue : '',
          registration: httpURL(event.registration),
          poster: httpURL(event.poster)
        })).sort((first, second) => first.date.localeCompare(second.date));
        return { ready: true, events };
      } catch {
        return { ready: false, events: [] };
      }
    }

    const eventData = readEvents();
    const events = eventData.events;
    const eventsById = new Map(events.map(event => [event.id, event]));
    const firstUpcoming = events.find(event => event.date >= today);
    const hasUpcoming = Boolean(firstUpcoming);
    const archiveMode = events.length > 0 && !hasUpcoming;
    const eventRows = $$('.event-row[data-event]');
    const activityButtons = $$('[data-activity-slot]');
    const detailsButtons = $$('[data-event-details]').filter(button =>
      !button.matches('[data-activity-slot]'));
    const calendarButtons = $$('[data-calendar]');
    const filterButtons = $$('[data-filter]');
    let activeFilter = 'all';

    function renderActivities() {
      const upcoming = events.filter(event => event.date >= today);
      let rave = upcoming.find(event => /run\s*&\s*rave/i.test(event.name));
      let club = upcoming.find(event => /run\s*club/i.test(event.name));
      if (club && club.id === rave?.id) club = null;
      if (!rave) rave = upcoming.find(event => event.id !== club?.id);
      if (!club) club = upcoming.find(event => event.id !== rave?.id);
      const activityDate = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC', day: 'numeric', month: 'short'
      });

      activityButtons.forEach(button => {
        const event = button.dataset.activitySlot === 'club' ? club : rave;
        button.disabled = false;
        button.removeAttribute('aria-disabled');
        if (!event) {
          delete button.dataset.eventDetails;
          setText('.activity-kind', 'New dates', button);
          setText('.activity-date', 'SOON', button);
          setText('.activity-place', 'On Instagram', button);
          setText('.activity-status', 'Updates', button);
          button.setAttribute('aria-label', 'New run dates — updates on Instagram');
          return;
        }
        button.dataset.eventDetails = event.id;
        setText('.activity-kind', event.name, button);
        setText('.activity-date', activityDate.format(calendarDate(event.date)).toUpperCase(), button);
        setText('.activity-place', [event.venue, event.city].filter(Boolean).join(' · '), button);
        setText('.activity-status', 'Upcoming', button);
        button.setAttribute('aria-label', event.name + ', ' +
          dateFormatter.format(calendarDate(event.date)) + ', ' + event.city + '. View run details');
      });
    }

    renderActivities();

    function renderCalendar() {
      if (!eventData.ready) return;
      let visibleCount = 0;

      eventRows.forEach(row => {
        const event = eventsById.get(row.dataset.event);
        const available = event && (archiveMode || event.date >= today);
        const matches = event && (activeFilter === 'all' || event.region === activeFilter);
        const isNext = Boolean(event && event.id === firstUpcoming?.id);
        row.classList.toggle('is-next', isNext);

        const titleLine = $('.event-title-line', row);
        let nextTag = titleLine && $('.next-tag', titleLine);
        if (isNext && titleLine && !nextTag) {
          nextTag = document.createElement('span');
          nextTag.className = 'next-tag';
          nextTag.textContent = 'Next up';
          titleLine.appendChild(nextTag);
        }
        $$('.next-tag', row).forEach(tag => {
          tag.hidden = !isNext || tag !== nextTag;
        });

        $$('.event-register', row).forEach(registration => {
          const active = Boolean(event && event.date >= today && event.registration);
          registration.hidden = !active;
          if (active) {
            registration.href = event.registration;
            registration.removeAttribute('aria-disabled');
          } else {
            registration.removeAttribute('href');
            registration.setAttribute('aria-disabled', 'true');
          }
        });

        row.hidden = !(available && matches);
        if (!row.hidden) visibleCount += 1;
      });

      filterButtons.forEach(button => {
        const active = button.dataset.filter === activeFilter;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
      });

      const noun = visibleCount === 1 ? 'run' : 'runs';
      const period = archiveMode ? 'past' : 'upcoming';
      const location = activeFilter === 'colombo' ? ' in Colombo' :
        activeFilter === 'south' ? ' down south' : '';
      $$('.events-status').forEach(status => {
        status.textContent = visibleCount + ' ' + period + ' ' + noun + location + '.';
      });
      $$('.empty-events').forEach(empty => { empty.hidden = visibleCount > 0; });

      if (archiveMode) {
        const heading = $('#calendar-title');
        if (heading) {
          const dot = $('.red-dot', heading);
          heading.replaceChildren(document.createTextNode('Past runs'));
          if (dot) heading.appendChild(dot);
        }
        const years = Array.from(new Set(events.map(event => event.date.slice(0, 4))));
        const yearLabel = years.length === 1 ? years[0] : years[0] + '–' + years[years.length - 1];
        $$('.calendar-period').forEach(label => {
          label.textContent = 'Past runs / ' + yearLabel;
        });
      }
    }

    if (eventData.ready) {
      $$('[data-filters]').forEach(container => { container.hidden = false; });
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filter = button.dataset.filter;
          activeFilter = ['all', 'colombo', 'south'].includes(filter) ? filter : 'all';
          renderCalendar();
        });
      });
      calendarButtons.forEach(button => {
        const event = eventsById.get(button.dataset.calendar);
        button.disabled = !event || event.date < today;
        if (event && event.date < today) button.title = 'This run has passed';
      });
      renderCalendar();
    }

    const backgroundState = new Map();

    function setMenuBackground(open) {
      const elements = [$('main'), $('.footer'), $('.header .brand'), $('.skip')];
      elements.filter(Boolean).forEach(element => {
        if (open) {
          if (!backgroundState.has(element)) backgroundState.set(element, element.inert);
          element.inert = true;
        } else if (backgroundState.has(element)) {
          element.inert = backgroundState.get(element);
          backgroundState.delete(element);
        }
      });
    }

    function closeMenu(restoreFocus = false) {
      if (!menuButton || !mobileNav) return;
      setMenuBackground(false);
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      syncScrollLock();
      if (restoreFocus && isVisible(menuButton)) menuButton.focus({ preventScroll: true });
    }

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', () => {
        if (!mobileNav.hidden) {
          closeMenu(true);
          return;
        }
        setMenuBackground(true);
        mobileNav.hidden = false;
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close menu');
        syncScrollLock();
      });

      $$('a[href]', mobileNav).forEach(link => {
        link.addEventListener('click', () => closeMenu(true));
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth <= 800 || mobileNav.hidden) return;
        const hadMenuFocus = mobileNav.contains(document.activeElement) ||
          document.activeElement === menuButton;
        closeMenu();
        const brand = $('.header .brand');
        if (hadMenuFocus && isVisible(brand)) brand.focus({ preventScroll: true });
      });
    }

    function showDialog(dialog, trigger) {
      if (!dialog) return false;
      if (mobileNav && !mobileNav.hidden) closeMenu();

      $$('dialog[open]').forEach(other => {
        if (other === dialog) return;
        suppressFocusRestore.add(other);
        other.close();
      });

      if (!dialog.open) {
        const opener = trigger || document.activeElement;
        if (opener && opener !== document.body) dialogTriggers.set(dialog, opener);
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      syncScrollLock();
      return true;
    }

    $$('dialog').forEach(dialog => {
      $$('.close-dialog', dialog).forEach(button => {
        button.addEventListener('click', () => dialog.close());
      });

      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) dialog.close();
      });

      dialog.addEventListener('close', () => {
        syncScrollLock();
        if (suppressFocusRestore.has(dialog)) {
          suppressFocusRestore.delete(dialog);
          return;
        }
        const trigger = dialogTriggers.get(dialog);
        dialogTriggers.delete(dialog);
        if (!$('dialog[open]') && isVisible(trigger)) trigger.focus({ preventScroll: true });
      });
    });

    function openEvent(id, trigger) {
      const event = eventsById.get(id);
      if (!event || !eventDialog) {
        notify('Run details are unavailable. Check Instagram for updates.');
        return;
      }

      selectedEvent = event;
      setText('.dialog-status', '', eventDialog);
      const past = event.date < today;
      setText('.dialog-date', dateFormatter.format(calendarDate(event.date)), eventDialog);
      setText('#event-title', event.name, eventDialog);
      setText('.dialog-venue', event.venue || 'Venue to be announced', eventDialog);
      setText('.dialog-city', event.city, eventDialog);
      setText('.dialog-time', 'Time to be announced', eventDialog);

      const registration = $('.registration-link', eventDialog);
      if (registration) {
        registration.href = !past && event.registration ? event.registration : instagram;
        registration.target = '_blank';
        registration.rel = 'noopener noreferrer';
        const label = !past && event.registration ? 'Register' : 'Event updates on Instagram';
        const icon = $('svg', registration);
        registration.replaceChildren(document.createTextNode(label + ' '));
        if (icon) registration.appendChild(icon);
      }

      const saveButton = $('.save-date', eventDialog);
      if (saveButton) saveButton.disabled = past;
      setText('.calendar-note', past ? 'This run has passed.' :
        'Saves a tentative all-day reminder.', eventDialog);

      const poster = $('.dialog-poster', eventDialog);
      const posterImage = poster && (poster.matches('img') ? poster : $('img', poster));
      if (poster) poster.hidden = !event.poster;
      if (posterImage && event.poster) {
        posterImage.src = event.poster;
        posterImage.alt = event.name + ' event poster, ' +
          dateFormatter.format(calendarDate(event.date));
      }

      const fallback = $('.share-fallback', eventDialog);
      if (fallback) fallback.hidden = true;
      showDialog(eventDialog, trigger);
    }

    detailsButtons.forEach(button => {
      button.addEventListener('click', () => {
        openEvent(button.dataset.eventDetails, button);
      });
    });

    activityButtons.forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.eventDetails;
        if (id && eventsById.has(id)) openEvent(id, button);
        else window.open(instagram, '_blank', 'noopener,noreferrer');
      });
    });

    function escapeCalendarText(value) {
      return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n')
        .replace(/;/g, '\\;').replace(/,/g, '\\,');
    }

    function foldCalendarLine(line) {
      const encoder = new TextEncoder();
      const parts = [];
      let part = '';
      let bytes = 0;
      for (const character of line) {
        const size = encoder.encode(character).length;
        if (bytes + size > 75) {
          parts.push(part);
          part = ' ';
          bytes = 1;
        }
        part += character;
        bytes += size;
      }
      parts.push(part);
      return parts.join('\r\n');
    }

    function downloadCalendar(event) {
      if (!event || event.date < today) {
        notify('This run has passed.');
        return;
      }

      const nextDay = calendarDate(event.date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Lightning by Neesh//Runs//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:lightning-' + event.id + '-' + event.date + '@lightningbyneesh',
        'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + event.date.replace(/-/g, ''),
        'DTEND;VALUE=DATE:' + nextDay.toISOString().slice(0, 10).replace(/-/g, ''),
        'SUMMARY:' + escapeCalendarText('Lightning — ' + event.name + ' · ' + event.city),
        'LOCATION:' + escapeCalendarText(event.venue || event.city),
        'DESCRIPTION:' + escapeCalendarText('Time to be announced. Latest details: ' + instagram),
        'URL:' + (event.registration || instagram),
        'STATUS:TENTATIVE',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
        'END:VCALENDAR'
      ];
      const content = lines.map(foldCalendarLine).join('\r\n') + '\r\n';
      const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lightning-' + event.date + '.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Date saved. Check Instagram for the time.');
    }

    calendarButtons.forEach(button => {
      button.addEventListener('click', () => {
        downloadCalendar(eventsById.get(button.dataset.calendar));
      });
    });
    const saveButton = eventDialog && $('.save-date', eventDialog);
    if (saveButton) saveButton.addEventListener('click', () => downloadCalendar(selectedEvent));

    function eventShareURL(event) {
      const url = new URL(window.location.pathname, window.location.origin);
      url.hash = 'run-' + event.id;
      return url.href;
    }

    function legacyCopy(text) {
      if (typeof document.execCommand !== 'function') return false;
      const input = document.createElement('textarea');
      input.value = text;
      input.readOnly = true;
      input.setAttribute('aria-hidden', 'true');
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      const parent = eventDialog && eventDialog.open ? eventDialog : document.body;
      parent.appendChild(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Offer a selectable link below. */ }
      input.remove();
      return copied;
    }

    function revealShareURL(url) {
      if (!eventDialog) return;
      let fallback = $('.share-fallback', eventDialog);
      if (!fallback) {
        fallback = document.createElement('label');
        fallback.className = 'share-fallback';
        fallback.textContent = 'Copy event link';
        const input = document.createElement('input');
        input.className = 'share-url';
        input.type = 'url';
        input.readOnly = true;
        input.setAttribute('aria-label', 'Event link');
        fallback.appendChild(input);
        eventDialog.appendChild(fallback);
      }
      const input = $('input', fallback);
      fallback.hidden = false;
      if (input) {
        input.value = url;
        input.focus();
        input.select();
      }
      notify('Select and copy the event link.');
    }

    const shareButton = eventDialog && $('.share-event', eventDialog);
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        if (!selectedEvent) return;
        const url = eventShareURL(selectedEvent);
        if (legacyCopy(url)) {
          shareButton.focus({ preventScroll: true });
          notify('Event link copied.');
          return;
        }
        // Always offer the selectable URL immediately, including in embedded browsers.
        revealShareURL(url);
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(url).then(() => {
            notify('Event link copied.');
          }).catch(() => { /* The selectable link remains available. */ });
        }
      });
    }

    const photoButtons = $$('[data-photo]');
    const photos = photoButtons.map(button => {
      const image = $('img', button);
      return {
        button,
        source: httpURL(button.dataset.photo),
        alt: image ? image.alt : 'Lightning community photograph',
        caption: button.dataset.caption || ''
      };
    }).filter(photo => photo.source);
    let photoIndex = 0;

    function renderPhoto() {
      if (!photoDialog || !photos.length) return;
      const photo = photos[photoIndex];
      const image = $('.photo-image', photoDialog) || $('img', photoDialog);
      if (image) {
        image.src = photo.source;
        image.alt = photo.alt;
      }
      const caption = $('.photo-caption', photoDialog);
      if (caption) {
        caption.textContent = photo.caption;
        caption.hidden = !photo.caption;
      }
      setText('.photo-count', (photoIndex + 1) + ' / ' + photos.length, photoDialog);
      $$('.photo-prev, .photo-next', photoDialog).forEach(button => {
        button.disabled = photos.length < 2;
      });
    }

    function changePhoto(direction) {
      if (!photoDialog || !photoDialog.open || photos.length < 2) return;
      photoIndex = (photoIndex + direction + photos.length) % photos.length;
      renderPhoto();
    }

    photos.forEach((photo, index) => {
      photo.button.addEventListener('click', () => {
        photoIndex = index;
        renderPhoto();
        showDialog(photoDialog, photo.button);
      });
    });
    if (photoDialog) {
      const previous = $('.photo-prev', photoDialog);
      const next = $('.photo-next', photoDialog);
      if (previous) previous.addEventListener('click', () => changePhoto(-1));
      if (next) next.addEventListener('click', () => changePhoto(1));
    }

    document.addEventListener('keydown', event => {
      if (photoDialog && photoDialog.open && !event.altKey && !event.ctrlKey && !event.metaKey) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }

      if (!menuButton || !mobileNav || mobileNav.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      } else if (event.key === 'Tab') {
        const links = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          mobileNav).filter(isVisible);
        const focusable = [menuButton, ...links].filter(isVisible);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;
        const outside = !focusable.includes(current);
        if (event.shiftKey && (current === first || outside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (current === last || outside)) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    function openLinkedEvent() {
      const match = /^#run-(.+)$/.exec(window.location.hash);
      if (!match) return;
      let id;
      try { id = decodeURIComponent(match[1]); } catch { return; }
      if (!eventsById.has(id)) {
        notify('That run is no longer listed. Check the calendar for new dates.');
        return;
      }
      const trigger = [...detailsButtons, ...activityButtons].find(button =>
        button.dataset.eventDetails === id && isVisible(button));
      openEvent(id, trigger);
    }

    window.addEventListener('hashchange', openLinkedEvent);
    openLinkedEvent();

    const revealElements = $$('.reveal, .route-art');
    const motionPreference = typeof window.matchMedia === 'function' ?
      window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let revealObserver;

    function revealAll() {
      revealElements.forEach(element => element.classList.add('is-visible'));
      if (revealObserver) revealObserver.disconnect();
    }

    if (!('IntersectionObserver' in window) || (motionPreference && motionPreference.matches)) {
      revealAll();
    } else {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      revealElements.forEach(element => revealObserver.observe(element));
    }

    if (motionPreference && typeof motionPreference.addEventListener === 'function') {
      motionPreference.addEventListener('change', event => {
        if (event.matches) revealAll();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

