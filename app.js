/* Form handling for the timetable maker. Details are kept in this browser only. */

const STORE_KEY = 'bs-timetable-v1';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const AGES = [
  '0 - 13 months',
  '0 - 6 months',
  '7 - 13 months',
  '6 - 13 months',
  '4 - 13 months',
  HELLO_BABY,
  '13m - 2yrs 6m',
  '13m - 4yrs 11m',
  '2yrs - 4yrs 11m',
];

const EXAMPLE = {
  theme: 'spring',
  title: 'Spring Term',
  titleEdited: false,
  venue: '',
  size: 'post',
  timeFmt: 'ampm',
  brackets: true,
  decorations: true,
  days: [
    { day: 'Monday', note: '', classes: [{ start: '10:00', age: '0 - 13 months' }, { start: '11:30', age: '6 - 13 months' }, { start: '13:00', age: '0 - 6 months' }] },
    { day: 'Tuesday', note: '', classes: [{ start: '10:00', age: '0 - 13 months' }, { start: '11:30', age: '6 - 13 months' }, { start: '13:00', age: '0 - 6 months' }] },
    { day: 'Wednesday', note: '', classes: [{ start: '10:00', age: '6 - 13 months' }, { start: '11:30', age: '0 - 6 months' }, { start: '13:00', age: '0 - 13 months' }] },
    { day: 'Thursday', note: '', classes: [{ start: '09:45', age: '7 - 13 months' }, { start: '11:15', age: '0 - 6 months' }, { start: '13:00', age: HELLO_BABY }] },
  ],
};

const clone = (o) => JSON.parse(JSON.stringify(o));
let state = load() || clone(EXAMPLE);
const images = { logo: null, background: null };

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
}
function saveImage(key, dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(`${STORE_KEY}-${key}`, dataUrl);
    else localStorage.removeItem(`${STORE_KEY}-${key}`);
  } catch { /* too big or blocked: still works for this visit */ }
}
function loadImage(src) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const out = $('out');
const statusEl = $('status');

/* ---------- Drawing ---------- */
let drawTimer = 0;
function scheduleDraw() {
  clearTimeout(drawTimer);
  drawTimer = setTimeout(draw, 120);
}
function draw() {
  drawTimetable(canvas, state, images);
  out.src = canvas.toDataURL('image/png');
  save();
}

/* ---------- Building the form ---------- */
function renderThemes() {
  const box = $('themes');
  box.innerHTML = '';
  for (const [id, t] of Object.entries(THEMES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme';
    b.setAttribute('aria-pressed', String(state.theme === id));
    b.innerHTML = `<span class="sw" style="background:linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)"></span><span></span>`;
    b.lastChild.textContent = t.name;
    b.addEventListener('click', () => {
      state.theme = id;
      if (!state.titleEdited) {
        state.title = t.title;
        $('title').value = t.title;
      }
      renderThemes();
      scheduleDraw();
    });
    box.appendChild(b);
  }
}

function option(value, text, selected) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = text;
  if (selected) o.selected = true;
  return o;
}

function renderDays() {
  const box = $('days');
  box.innerHTML = '';
  state.days.forEach((d, di) => {
    const card = document.createElement('div');
    card.className = 'day';

    const head = document.createElement('div');
    head.className = 'day-head';
    const dayLabel = document.createElement('label');
    dayLabel.textContent = `Day ${di + 1}`;
    const daySel = document.createElement('select');
    daySel.id = `day-${di}`;
    DAYS.forEach((name) => daySel.appendChild(option(name, name, d.day === name)));
    daySel.addEventListener('change', () => { d.day = daySel.value; scheduleDraw(); });
    dayLabel.appendChild(daySel);
    const noteLabel = document.createElement('label');
    noteLabel.textContent = 'Date or place (optional)';
    const note = document.createElement('input');
    note.type = 'text';
    note.id = `note-${di}`;
    note.maxLength = 40;
    note.placeholder = 'e.g. 20th October';
    note.value = d.note || '';
    note.addEventListener('input', () => { d.note = note.value; scheduleDraw(); });
    noteLabel.appendChild(note);
    head.append(dayLabel, noteLabel);
    card.appendChild(head);

    d.classes.forEach((cls, ci) => {
      const row = document.createElement('div');
      row.className = 'cls';
      const startL = document.createElement('label');
      startL.textContent = 'Start';
      const start = document.createElement('input');
      start.type = 'time';
      start.id = `start-${di}-${ci}`;
      start.value = cls.start || '';
      start.addEventListener('input', () => { cls.start = start.value; scheduleDraw(); });
      startL.appendChild(start);

      const endL = document.createElement('label');
      endL.textContent = 'Finish';
      const end = document.createElement('input');
      end.type = 'time';
      end.id = `end-${di}-${ci}`;
      end.value = cls.end || '';
      end.addEventListener('input', () => { cls.end = end.value; scheduleDraw(); });
      endL.appendChild(end);

      const ageL = document.createElement('label');
      ageL.className = 'age';
      ageL.textContent = 'Age group';
      const age = document.createElement('select');
      age.id = `age-${di}-${ci}`;
      AGES.forEach((a) => age.appendChild(option(a, a, cls.age === a)));
      age.appendChild(option('custom', 'Something else…', cls.age === 'custom'));
      ageL.appendChild(age);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'x';
      del.title = 'Remove this class';
      del.setAttribute('aria-label', `Remove ${formatTime(cls.start, 'ampm') || 'this'} class`);
      del.textContent = '×';
      del.addEventListener('click', () => { d.classes.splice(ci, 1); renderDays(); scheduleDraw(); });

      row.append(startL, endL, ageL, del);

      if (cls.age === 'custom') {
        const cl = document.createElement('label');
        cl.className = 'custom';
        cl.textContent = 'Type the age group or class name';
        const ci2 = document.createElement('input');
        ci2.type = 'text';
        ci2.id = `custom-${di}-${ci}`;
        ci2.maxLength = 40;
        ci2.placeholder = 'e.g. 3 - 9 months';
        ci2.value = cls.custom || '';
        ci2.addEventListener('input', () => { cls.custom = ci2.value; scheduleDraw(); });
        cl.appendChild(ci2);
        row.appendChild(cl);
      }
      age.addEventListener('change', () => {
        const wasCustom = cls.age === 'custom';
        cls.age = age.value;
        if (wasCustom !== (cls.age === 'custom')) renderDays();
        scheduleDraw();
      });
      card.appendChild(row);
    });

    const btns = document.createElement('div');
    btns.className = 'btns';
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'link';
    add.textContent = '+ Add a class';
    add.addEventListener('click', () => {
      const last = d.classes[d.classes.length - 1];
      d.classes.push({ start: last ? addMinutes(last.start, 90) : '10:00', age: '0 - 13 months' });
      renderDays();
      scheduleDraw();
    });
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'link quiet';
    copy.textContent = 'Copy to next day';
    copy.disabled = state.days.length >= 6;
    copy.addEventListener('click', () => {
      const next = clone(d);
      next.day = DAYS[(DAYS.indexOf(d.day) + 1) % 7];
      state.days.splice(di + 1, 0, next);
      renderDays();
      scheduleDraw();
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'link quiet';
    remove.textContent = 'Remove day';
    remove.addEventListener('click', () => { state.days.splice(di, 1); renderDays(); scheduleDraw(); });
    btns.append(add, copy, remove);
    card.appendChild(btns);
    box.appendChild(card);
  });
  $('addDay').disabled = state.days.length >= 6;
}

function addMinutes(t, mins) {
  if (!t) return '10:00';
  const [h, m] = t.split(':').map(Number);
  const total = Math.min(h * 60 + m + mins, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function bindTopFields() {
  const title = $('title');
  title.value = state.title;
  title.addEventListener('input', () => { state.title = title.value; state.titleEdited = true; scheduleDraw(); });
  const venue = $('venue');
  venue.value = state.venue || '';
  venue.addEventListener('input', () => { state.venue = venue.value; scheduleDraw(); });

  const size = $('size');
  for (const [id, sz] of Object.entries(SIZES)) size.appendChild(option(id, sz.label, state.size === id));
  size.addEventListener('change', () => { state.size = size.value; scheduleDraw(); });
  const fmt = $('timeFmt');
  fmt.value = state.timeFmt;
  fmt.addEventListener('change', () => { state.timeFmt = fmt.value; scheduleDraw(); });
  const br = $('brackets');
  br.checked = state.brackets !== false;
  br.addEventListener('change', () => { state.brackets = br.checked; scheduleDraw(); });
  const dec = $('decorations');
  dec.checked = state.decorations !== false;
  dec.addEventListener('change', () => { state.decorations = dec.checked; scheduleDraw(); });

  $('addDay').addEventListener('click', () => {
    const last = state.days[state.days.length - 1];
    const day = last ? DAYS[(DAYS.indexOf(last.day) + 1) % 7] : 'Monday';
    state.days.push({ day, note: '', classes: [{ start: '10:00', age: '0 - 13 months' }] });
    renderDays();
    scheduleDraw();
  });

  for (const [inputId, key] of [['logoFile', 'logo'], ['bgFile', 'background']]) {
    $(inputId).addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        images[key] = await loadImage(reader.result);
        saveImage(key, reader.result);
        draw();
      };
      reader.readAsDataURL(file);
    });
  }
  $('clearImages').addEventListener('click', () => {
    images.logo = images.background = null;
    saveImage('logo', null);
    saveImage('background', null);
    $('logoFile').value = '';
    $('bgFile').value = '';
    draw();
  });

  // Start again, with a confirm step inside the page
  $('reset').addEventListener('click', () => {
    const row = $('resetRow');
    row.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'confirm';
    box.innerHTML = '<span>Clear all your days and times?</span>';
    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'link';
    yes.textContent = 'Yes, start again';
    yes.addEventListener('click', () => {
      try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
      location.reload();
    });
    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'link quiet';
    no.textContent = 'Keep my details';
    no.addEventListener('click', () => location.reload());
    box.append(yes, no);
    row.appendChild(box);
  });
}

function fileName() {
  const slug = (state.title || 'timetable').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug || 'timetable'}-${state.size}.png`;
}

$('download').addEventListener('click', () => {
  draw();
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    statusEl.textContent = `Saved ${fileName()} to your downloads.`;
  }, 'image/png');
});

$('copy').addEventListener('click', async () => {
  draw();
  try {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    statusEl.textContent = 'Copied. Paste it into Facebook, WhatsApp or Canva.';
  } catch {
    statusEl.textContent = 'Your browser would not copy the image. Use Download instead.';
  }
});

$('form').addEventListener('submit', (e) => e.preventDefault());

(async function start() {
  try {
    for (const key of ['logo', 'background']) {
      const src = localStorage.getItem(`${STORE_KEY}-${key}`);
      if (src) images[key] = await loadImage(src);
    }
  } catch { /* ignore */ }
  renderThemes();
  bindTopFields();
  renderDays();
  try { await document.fonts.load(`700 30px Andika`); await document.fonts.load(`400 30px Andika`); } catch { /* fallback font */ }
  draw();
})();
