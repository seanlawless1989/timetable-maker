/* Message templates for franchisees. Fills in fixed wording from the classes
   entered on the timetable page, then opens it in WhatsApp, email or the clipboard.
   Nothing is sent anywhere by this page: the franchisee presses send themselves. */

const TT_KEY = 'bs-timetable-v1';
const MSG_KEY = 'bs-messages-v1';

const tt = readJSON(TT_KEY) || { days: [], venue: '', timeFmt: 'ampm' };
const me = Object.assign({ name: '', area: '', phone: '', link: '', template: 'welcome' }, readJSON(MSG_KEY));
const form = { parent: '', parentPhone: '', cls: '0-0', classes: [], date: '', deadline: '', reason: '', extra: '' };

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function saveMe() {
  try { localStorage.setItem(MSG_KEY, JSON.stringify(me)); } catch { /* storage unavailable */ }
}

// ---- wording helpers -------------------------------------------------------

function time(t) {
  if (!t) return '';
  const [hS, m = '00'] = t.split(':');
  const h = Number(hS);
  if (tt.timeFmt === '24h') return `${String(h).padStart(2, '0')}:${m}`;
  const h12 = h % 12 || 12, suf = h < 12 ? 'am' : 'pm';
  return tt.timeFmt === 'short' && m === '00' ? `${h12}${suf}` : `${h12}:${m}${suf}`;
}
function age(c) {
  if (c.age === 'custom') return (c.custom || '').trim();
  return c.age || '';
}
function classList() {
  const out = [];
  (tt.days || []).forEach((d, di) => (d.classes || []).forEach((c, ci) => {
    const a = age(c);
    out.push({
      id: `${di}-${ci}`,
      day: d.day || '',
      start: time(c.start),
      label: `${d.day} ${time(c.start)}${a ? ` (${a})` : ''}`,
      short: `${d.day} ${time(c.start)} class${a ? ` (${a})` : ''}`,
      ageText: a ? ` (${a})` : '',
      sticker: c.sticker || '',
      place: (d.note || '').trim(),
    });
  }));
  return out;
}
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function niceDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return `${d.toLocaleDateString('en-GB', { weekday: 'long' })} ${ordinal(d.getDate())} ${d.toLocaleDateString('en-GB', { month: 'long' })}`;
}
// The next date that falls on a given weekday, so dates start sensible
function nextDay(dayName) {
  const idx = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName);
  const d = new Date();
  if (idx >= 0) d.setDate(d.getDate() + ((idx - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

const or = (v, fallback) => (v && String(v).trim()) || fallback;
const brand = () => or(me.area, 'Baby Sensory');
const hi = () => (form.parent.trim() ? `Hi ${form.parent.trim()}` : 'Hi');
const signOff = () => (me.name.trim() ? `\n\n${me.name.trim()}\n${brand()}` : `\n\n${brand()}`);
const venueOf = (c) => or(c && c.place, or(tt.venue, ''));
const at = (c) => (venueOf(c) ? ` at ${venueOf(c)}` : '');
const bookLine = (lead) => (me.link.trim() ? `\n\n${lead} ${me.link.trim()}` : '');
const phoneLine = () => (me.phone.trim() ? ` or call me on ${me.phone.trim()}` : '');

// ---- the templates ---------------------------------------------------------
// fields: which inputs each message needs. shortcut: suggested WhatsApp Business quick reply.

const TEMPLATES = [
  {
    id: 'welcome', name: 'Welcome, booking confirmed', shortcut: 'welcome', subject: 'Your Baby Sensory booking',
    fields: ['parent', 'cls', 'date'],
    text: (c) => `${hi()}, and welcome to ${brand()}! 🎉\n\nYou're booked onto the ${c.short}${at(c)}, starting ${or(niceDate(form.date), 'soon')}.\n\nPlease arrive a few minutes early on your first week so you and your baby can settle in. If you have any questions, just reply to this message${phoneLine()}.\n\nWe can't wait to meet you both!${signOff()}`,
  },
  {
    id: 'reminder', name: 'Class reminder', shortcut: 'reminder', subject: 'Class reminder',
    fields: ['parent', 'cls', 'date'],
    text: (c) => `${hi()}, just a friendly reminder that your class${c.ageText} is on ${or(niceDate(form.date), c.day)} at ${c.start}${at(c)}. 😊\n\nIf you can't make it, please let me know so I can offer the space to someone on the waiting list.\n\nSee you soon!${signOff()}`,
  },
  {
    id: 'cancelled', name: 'Class cancelled', shortcut: 'cancel', subject: 'Class cancelled',
    fields: ['parent', 'cls', 'date', 'reason', 'extra'],
    extraLabel: 'What happens instead (optional)', extraPlaceholder: 'e.g. A catch-up class will be added at the end of term',
    text: (c) => `${hi()}, I'm really sorry but the ${c.start} class${c.ageText} on ${or(niceDate(form.date), c.day)}${at(c)} is cancelled${form.reason.trim() ? ` ${form.reason.trim()}` : ''}.${form.extra.trim() ? `\n\n${form.extra.trim()}` : ''}\n\nI'm sorry for any inconvenience, and thank you for understanding.${signOff()}`,
  },
  {
    id: 'spaces', name: 'Spaces available', shortcut: 'spaces', subject: 'Baby Sensory spaces available',
    fields: ['classes'],
    text: () => {
      const all = classList().filter((c) => form.classes.includes(c.id));
      const lines = all.map((c) => `• ${c.label}${c.sticker === 'last' ? ' – last space!' : c.sticker === 'few' ? ' – last few spaces' : ''}`);
      return `✨ Spaces available at ${brand()}! ✨\n\n${lines.length ? lines.join('\n') : '• (tick the classes with spaces above)'}${tt.venue ? `\n\n📍 ${tt.venue}` : ''}${bookLine('Book your place here:')}\n\nAny questions, just send me a message${phoneLine()}.${signOff()}`;
    },
  },
  {
    id: 'waitlist', name: 'Space from the waiting list', shortcut: 'waitlist', subject: 'A space has come up',
    fields: ['parent', 'cls', 'date', 'deadline'],
    text: (c) => `${hi()}, good news! 🎉 A space has come up in the ${c.short}${at(c)}${form.date ? `, starting ${niceDate(form.date)}` : ''}.\n\nWould you like it? Please let me know${form.deadline ? ` by ${niceDate(form.deadline)}` : ' as soon as you can'}, as I'll then offer it to the next family on the list.${bookLine('You can book here:')}${signOff()}`,
  },
  {
    id: 'rebook', name: 'Rebook for next term', shortcut: 'rebook', subject: 'Rebooking for next term',
    fields: ['parent', 'cls', 'date', 'deadline'],
    dateLabel: 'Next term starts',
    text: (c) => `${hi()}, I hope you're both enjoying class! 😊\n\nNext term starts ${or(niceDate(form.date), 'soon')}. To keep your place in the ${c.short}, please rebook ${form.deadline ? `by ${niceDate(form.deadline)}. After that, I'll offer any spaces to the waiting list.` : 'as soon as you can, as spaces will then be offered to the waiting list.'}${bookLine('Rebook here:')}${signOff()}`,
  },
  {
    id: 'missed', name: 'We missed you', shortcut: 'missed', subject: 'We missed you today',
    fields: ['parent', 'cls', 'date'],
    text: (c) => `${hi()}, we missed you at the ${c.start} class${form.date ? ` on ${niceDate(form.date)}` : ' today'}. I hope you're both OK! 💛\n\nJust let me know if anything has changed with your booking.${signOff()}`,
  },
  {
    id: 'endterm', name: 'End of term thank you', shortcut: 'thanks', subject: 'Thank you for a lovely term',
    fields: ['parent', 'date'],
    dateLabel: 'Next term starts (optional)',
    text: () => `${hi()}, thank you so much for a wonderful term at ${brand()}! 💚💛 It's been lovely watching your little one grow and discover new things each week.${form.date ? `\n\nNext term starts ${niceDate(form.date)}, and I'd love to see you there.` : ''}${bookLine('Book next term here:')}${signOff()}`,
  },
];

// ---- page ------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
let edited = false;

function current() { return TEMPLATES.find((t) => t.id === me.template) || TEMPLATES[0]; }
function chosenClass() {
  const list = classList();
  return list.find((c) => c.id === form.cls) || list[0] || { id: '', day: '', start: '', label: 'class', short: 'class', place: '' };
}

function renderTemplateButtons() {
  const box = $('templates');
  box.textContent = '';
  for (const t of TEMPLATES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme';
    b.textContent = t.name;
    b.setAttribute('aria-pressed', String(t.id === me.template));
    b.addEventListener('click', () => {
      me.template = t.id;
      saveMe();
      edited = false;
      setDefaultDate();
      renderTemplateButtons();
      renderFields();
      build();
    });
    box.appendChild(b);
  }
}

function renderFields() {
  const t = current();
  const show = (id, on) => { $(id).hidden = !on; };
  show('f-parent', t.fields.includes('parent'));
  show('f-cls', t.fields.includes('cls'));
  show('f-classes', t.fields.includes('classes'));
  show('f-date', t.fields.includes('date'));
  show('f-deadline', t.fields.includes('deadline'));
  show('f-reason', t.fields.includes('reason'));
  show('f-extra', t.fields.includes('extra'));
  $('dateLabel').textContent = t.dateLabel || 'Date';
  $('extraLabel').textContent = t.extraLabel || 'Anything else';
  $('extra').placeholder = t.extraPlaceholder || '';
  $('shortcut').textContent = `/${t.shortcut}`;
}

function renderClasses() {
  const list = classList();
  $('noClasses').hidden = list.length > 0;
  const sel = $('cls');
  sel.textContent = '';
  for (const c of list) {
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.label;
    sel.appendChild(o);
  }
  if (list.length) form.cls = list[0].id;
  // tick the classes already marked LAST SPACE or LAST FEW SPACES on the timetable
  form.classes = list.filter((c) => c.sticker === 'last' || c.sticker === 'few').map((c) => c.id);
  const box = $('classes');
  box.textContent = '';
  for (const c of list) {
    const l = document.createElement('label');
    l.className = 'check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = form.classes.includes(c.id);
    cb.disabled = c.sticker === 'sold';
    cb.addEventListener('change', () => {
      form.classes = cb.checked ? [...form.classes, c.id] : form.classes.filter((x) => x !== c.id);
      edited = false;
      build();
    });
    l.append(cb, ` ${c.label}${c.sticker === 'sold' ? ' (sold out)' : ''}`);
    box.appendChild(l);
  }
  setDefaultDate();
}

// class dates default to the next one; "next term starts" dates start empty
function setDefaultDate() {
  form.date = current().dateLabel ? '' : nextDay(chosenClass().day);
  $('date').value = form.date;
}

function build() {
  const t = current();
  if (!edited) $('out').value = t.text(chosenClass());
  const msg = $('out').value;
  const num = waNumber(form.parentPhone);
  $('wa').href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  $('mail').href = `mailto:?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(msg)}`;
  $('editedNote').hidden = !edited;
}

// UK mobile numbers typed as 07... become 447... for WhatsApp links
function waNumber(p) {
  let d = (p || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = `44${d.slice(1)}`;
  return d;
}

function bind() {
  for (const k of ['name', 'area', 'phone', 'link']) {
    $(k).value = me[k] || '';
    $(k).addEventListener('input', () => { me[k] = $(k).value; saveMe(); edited = false; build(); });
  }
  for (const k of ['parent', 'parentPhone', 'reason', 'extra']) {
    $(k).addEventListener('input', () => { form[k] = $(k).value; if (k !== 'parentPhone') edited = false; build(); });
  }
  $('cls').addEventListener('change', () => {
    form.cls = $('cls').value;
    setDefaultDate();
    edited = false;
    build();
  });
  for (const k of ['date', 'deadline']) {
    $(k).addEventListener('input', () => { form[k] = $(k).value; edited = false; build(); });
  }
  $('out').addEventListener('input', () => { edited = true; build(); });
  $('resetText').addEventListener('click', () => { edited = false; build(); });
  $('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('out').value);
      $('status').textContent = 'Copied. Paste it into WhatsApp, Facebook or an email.';
    } catch {
      $('out').select();
      $('status').textContent = 'Press Ctrl+C (or Copy on your phone) to copy the selected message.';
    }
  });
}

renderTemplateButtons();
renderClasses();
renderFields();
bind();
build();
