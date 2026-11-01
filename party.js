/* Party poster maker. A fixed A4 brand template, based on the Darlington parties
   poster, filled in with the franchisee's own packages, prices and contact details. */

const PARTY_KEY = 'bs-party-v1';
const partyMe = (() => { try { return JSON.parse(localStorage.getItem('bs-messages-v1')) || {}; } catch { return {}; } })();

const PARTY_DEFAULT = {
  quoteTop: 'Time and time again you just go WOW!',
  quoteBottom: "It's all so magical!",
  title: 'PARTIES',
  headline: 'Private party hire',
  subline: "Let us help you celebrate your baby's 1st birthday in style!",
  packages: [
    { name: '1.5 hour party', price: '170', desc: '45 minutes in the play area and 45 minutes of sensory activities' },
    { name: '2 hour party', price: '200', desc: 'As above, plus 30 minutes use of the party room for food' },
  ],
  available: 'Available to hire on Saturdays or Sundays',
  contactIntro: 'To book a party or to find out more:',
  contactName: partyMe.name || '',
  phone: partyMe.phone || '',
  email: '',
  bookings: true,
  bookingsText: 'Now taking bookings',
  award: true,
};
const party = Object.assign({}, PARTY_DEFAULT, readParty());
party.packages = (party.packages || []).slice(0, 4);

function readParty() {
  try { return JSON.parse(localStorage.getItem(PARTY_KEY)) || {}; } catch { return {}; }
}
function storeParty() {
  try { localStorage.setItem(PARTY_KEY, JSON.stringify(party)); } catch { /* storage unavailable */ }
}

const PW = 840, PH = 1188, PARTY_SCALE = 2;
const PURPLE = '#7E4E8F'; // from the brand "Say hello" bubble
const PARTY_PICS = ['friends-6', 'stars-green-1', 'shakers-1', 'beach-ball', 'frog', 'note-2'];
const pImages = { logo: null, photo: null, els: {} };

function priceText(p) {
  const a = String(p || '').trim().replace(/^£/, '');
  return a ? `£${a}` : '';
}

function fitFont(c, text, weight, size, family, maxW, min = 10) {
  let s = size;
  c.font = `${weight} ${s}px ${family}`;
  while (c.measureText(text).width > maxW && s > min) {
    s -= 1;
    c.font = `${weight} ${s}px ${family}`;
  }
  return s;
}
// Delius has one weight, so give headings a little extra body
function boldText(c, text, x, y, colour, px) {
  c.fillStyle = colour;
  c.strokeStyle = colour;
  c.lineWidth = px * 0.05;
  c.lineJoin = 'round';
  c.strokeText(text, x, y);
  c.fillText(text, x, y);
}

function drawStarShape(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
}

// Dashed-edge banner like the poster's ribbons, slightly tilted
function drawBanner(c, x, y, w, h, fill, edge, tilt) {
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.rotate(tilt);
  c.fillStyle = fill;
  c.fillRect(-w / 2, -h / 2, w, h);
  c.strokeStyle = edge;
  c.lineWidth = 2.5;
  c.setLineDash([7, 6]);
  c.beginPath();
  c.moveTo(-w / 2, -h / 2 + 9); c.lineTo(w / 2, -h / 2 + 9);
  c.moveTo(-w / 2, h / 2 - 9); c.lineTo(w / 2, h / 2 - 9);
  c.stroke();
  c.setLineDash([]);
  c.restore();
}

function drawRosette(c, cx, cy, r) {
  // yellow ribbon behind: one strip up to the top banner, two tails below
  c.fillStyle = BRAND.yellow;
  c.fillRect(cx - 42, 0, 84, cy);
  for (const dx of [-38, 38]) {
    c.beginPath();
    c.moveTo(cx + dx - 34, cy);
    c.lineTo(cx + dx + 34, cy);
    c.lineTo(cx + dx + 34, cy + r + 70);
    c.lineTo(cx + dx, cy + r + 48);
    c.lineTo(cx + dx - 34, cy + r + 70);
    c.closePath();
    c.fill();
  }
  // zigzag edge
  c.beginPath();
  const n = 64;
  for (let i = 0; i <= n * 2; i++) {
    const a = (i * Math.PI) / n;
    const rr = i % 2 ? r - 9 : r;
    c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  c.closePath();
  c.fillStyle = BRAND.white;
  c.fill();
  c.strokeStyle = BRAND.green;
  c.lineWidth = 3;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, r - 22, 0, Math.PI * 2);
  c.lineWidth = 2;
  c.stroke();

  c.textAlign = 'center';
  c.fillStyle = BRAND.green;
  c.font = `500 52px ${FONT}`;
  c.fillText('Baby', cx, cy - 48);
  c.fillText('Sensory', cx, cy + 6);
  const t = (party.title || '').trim();
  const s = fitFont(c, t, 900, 50, FONT, r * 1.36, 20);
  c.fillText(t, cx, cy + 22 + s);
}

function drawAward(c, cx, cy, r) {
  c.fillStyle = BRAND.white;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = BRAND.ink;
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, cy, r - 6, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = BRAND.ink;
  c.textAlign = 'center';
  c.font = `800 13px ${FONT}`;
  const ring = 'INTERNATIONAL AWARD WINNERS ★ ';
  const step = (Math.PI * 2) / ring.length;
  for (let i = 0; i < ring.length; i++) {
    const a = -Math.PI / 2 + (i - ring.length / 4) * step;
    c.save();
    c.translate(cx + Math.cos(a) * (r - 17), cy + Math.sin(a) * (r - 17));
    c.rotate(a + Math.PI / 2);
    c.fillText(ring[i], 0, 4);
    c.restore();
  }
  c.beginPath();
  c.arc(cx, cy, r - 28, 0, Math.PI * 2);
  c.stroke();
  c.font = `800 16px ${FONT}`;
  c.fillText('SINCE', cx, cy - 2);
  c.fillText('2008', cx, cy + 16);
}

function drawParty(canvas) {
  canvas.width = PW * PARTY_SCALE;
  canvas.height = PH * PARTY_SCALE;
  const c = canvas.getContext('2d');
  c.setTransform(PARTY_SCALE, 0, 0, PARTY_SCALE, 0, 0);
  const el = (id) => pImages.els[id];

  c.fillStyle = BRAND.white;
  c.fillRect(0, 0, PW, PH);

  // light scatter of stars and dots, the same every time
  const rnd = seeded(2008);
  c.fillStyle = BRAND.green;
  for (let i = 0; i < 46; i++) {
    const x = 20 + rnd() * (PW - 40), y = 110 + rnd() * (PH - 230);
    if (rnd() < 0.5) drawStarShape(c, x, y, 4 + rnd() * 5);
    else { c.beginPath(); c.arc(x, y, 2 + rnd() * 3, 0, Math.PI * 2); c.fill(); }
  }

  // top banner with quote
  c.fillStyle = BRAND.green;
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(PW, 0); c.lineTo(PW, 62); c.lineTo(0, 100); c.closePath();
  c.fill();

  drawRosette(c, 615, 255, 150);

  if (party.quoteTop.trim()) {
    const q = `“${party.quoteTop.trim()}”`;
    const qs = fitFont(c, q, 'italic 700', 21, FONT, 330, 12);
    c.fillStyle = BRAND.white;
    c.textAlign = 'left';
    c.fillText(q, 185, 44 + qs * 0.3);
  }

  // photo (their own, or brand friends picture) in a circle
  const pcx = 215, pcy = 300, pr = 172;
  c.save();
  c.beginPath();
  c.arc(pcx, pcy, pr, 0, Math.PI * 2);
  c.clip();
  if (pImages.photo) {
    const img = pImages.photo;
    const k = Math.max((pr * 2) / img.width, (pr * 2) / img.height);
    c.drawImage(img, pcx - (img.width * k) / 2, pcy - (img.height * k) / 2, img.width * k, img.height * k);
  } else {
    c.fillStyle = BRAND.greenTint;
    c.fillRect(pcx - pr, pcy - pr, pr * 2, pr * 2);
    drawPicture(c, el('friends-6'), pcx, pcy + 20, pr * 1.6, pr * 1.5);
  }
  c.restore();
  c.strokeStyle = BRAND.green;
  c.lineWidth = 8;
  c.beginPath();
  c.arc(pcx, pcy, pr, 0, Math.PI * 2);
  c.stroke();

  if (party.award) drawAward(c, 82, 92, 64);
  drawPicture(c, el('stars-green-1'), 745, 160, 70, 70);
  drawPicture(c, el('shakers-1'), 470, 478, 90, 90);

  // headline ribbon
  drawBanner(c, 250, 515, 610, 112, BRAND.green, BRAND.white, 0.025);
  c.save();
  c.translate(555, 571);
  c.rotate(0.025);
  c.textAlign = 'center';
  const hs = fitFont(c, party.headline.trim(), 400, 44, SUB_FONT, 540, 20);
  boldText(c, party.headline.trim(), 0, -2, BRAND.white, hs);
  if (party.subline.trim()) {
    fitFont(c, party.subline.trim(), 'italic 600', 19, FONT, 540, 11);
    c.fillStyle = BRAND.white;
    c.fillText(party.subline.trim(), 0, 32);
  }
  c.restore();

  // now taking bookings
  if (party.bookings && party.bookingsText.trim()) {
    c.fillStyle = PURPLE;
    c.beginPath();
    c.arc(150, 600, 92, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = BRAND.white;
    c.textAlign = 'center';
    c.font = `800 26px ${FONT}`;
    const lines = wrapText(c, party.bookingsText.trim(), 140).slice(0, 4);
    let y = 600 - ((lines.length - 1) * 30) / 2 + 9;
    for (const ln of lines) { c.fillText(ln, 150, y); y += 30; }
  }
  drawPicture(c, el('beach-ball'), 300, 690, 64, 64);

  // packages
  const pk = party.packages.filter((p) => p.name.trim() || p.price.trim());
  const top = 712, bottom = 985;
  const slot = pk.length ? Math.min(135, (bottom - top) / pk.length) : 0;
  pk.forEach((p, i) => {
    const green = i % 2 === 1;
    const y = top + i * slot;
    const h = slot - 16;
    const tilt = green ? 0.02 : 0.012;
    drawBanner(c, 330, y, 530, h, green ? BRAND.green : BRAND.yellow, green ? BRAND.white : BRAND.green, tilt);
    c.save();
    c.translate(330 + 265 - 20, y + h / 2);
    c.rotate(tilt);
    c.textAlign = 'center';
    const title = [p.name.trim(), priceText(p.price)].filter(Boolean).join(' ');
    const desc = (p.desc || '').trim();
    const ts = fitFont(c, title, 400, Math.min(44, h * 0.42), SUB_FONT, 450, 16);
    const ty = desc ? -h * 0.06 : ts * 0.35;
    boldText(c, title, 0, ty, green ? BRAND.white : BRAND.green, ts);
    if (desc) {
      fitFont(c, desc, 'italic 600', Math.min(17, h * 0.17), FONT, 450, 9);
      c.fillStyle = green ? BRAND.white : BRAND.green;
      c.fillText(desc, 0, ty + h * 0.3);
    }
    c.restore();
  });

  // availability box
  if (party.available.trim()) {
    c.fillStyle = BRAND.yellowTint;
    c.strokeStyle = BRAND.green;
    c.lineWidth = 4;
    c.beginPath();
    c.roundRect(40, 730, 255, 245, 8);
    c.fill();
    c.stroke();
    let fs = 40, lines;
    for (; fs > 16; fs -= 2) {
      c.font = `400 ${fs}px ${SUB_FONT}`;
      lines = wrapText(c, party.available.trim(), 225);
      if (lines.length * fs * 1.18 <= 220 && lines.every((l) => c.measureText(l).width <= 225)) break;
    }
    c.textAlign = 'center';
    let y = 852 - ((lines.length - 1) * fs * 1.18) / 2 + fs * 0.35;
    for (const ln of lines) { boldText(c, ln, 167, y, BRAND.green, fs); y += fs * 1.18; }
  }
  drawPicture(c, el('note-2'), 800, 672, 44, 54);

  // contact box
  const contactLines = [];
  if (party.contactIntro.trim()) contactLines.push({ t: party.contactIntro.trim(), w: 700, col: BRAND.ink });
  if (party.phone.trim()) contactLines.push({ t: `Call ${party.contactName.trim() ? `${party.contactName.trim()} on ` : ''}${party.phone.trim()}`, w: 800, col: BRAND.green });
  else if (party.contactName.trim()) contactLines.push({ t: `Ask for ${party.contactName.trim()}`, w: 800, col: BRAND.green });
  if (party.email.trim()) contactLines.push({ t: `Email: ${party.email.trim()}`, w: 800, col: BRAND.green });
  if (contactLines.length) {
    c.fillStyle = BRAND.white;
    c.strokeStyle = BRAND.yellow;
    c.lineWidth = 5;
    c.beginPath();
    c.roundRect(340, 994, 470, 108, 10);
    c.fill();
    c.stroke();
    c.textAlign = 'left';
    let y = 1048 - ((contactLines.length - 1) * 30) / 2 + 7;
    for (const l of contactLines) {
      fitFont(c, l.t, l.w, 21, FONT, 430, 11);
      c.fillStyle = l.col;
      c.fillText(l.t, 362, y);
      y += 30;
    }
  }

  // footer band with logo, frog and quote
  c.fillStyle = BRAND.green;
  c.beginPath();
  c.moveTo(0, PH - 44); c.lineTo(PW, PH - 66); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath();
  c.fill();
  c.fillStyle = BRAND.yellow;
  c.beginPath();
  c.moveTo(0, PH - 50); c.lineTo(PW, PH - 72); c.lineTo(PW, PH - 66); c.lineTo(0, PH - 44); c.closePath();
  c.fill();
  drawLogo(c, 150, PH - 118, 240, 1, pImages.logo);
  drawPicture(c, el('frog'), 310, PH - 92, 80, 80);
  if (party.quoteBottom.trim()) {
    const q = `“${party.quoteBottom.trim()}”`;
    fitFont(c, q, 'italic 700', 22, FONT, 300, 12);
    c.fillStyle = BRAND.yellow;
    c.textAlign = 'center';
    c.fillText(q, 670, PH - 20);
  }
}

function seeded(seed) {
  let x = seed;
  return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
}

// ---- page ------------------------------------------------------------------

const $p = (id) => document.getElementById(id);
const pCanvas = document.createElement('canvas');
let pPending = false;

function redrawParty() {
  if (pPending) return;
  pPending = true;
  requestAnimationFrame(() => {
    pPending = false;
    drawParty(pCanvas);
    $p('out').src = pCanvas.toDataURL('image/png');
    storeParty();
  });
}

function renderPackages() {
  const box = $p('packages');
  box.textContent = '';
  party.packages.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'day';
    const row = document.createElement('div');
    row.className = 'pkg';
    const mk = (label, key, ph, cls) => {
      const l = document.createElement('label');
      if (cls) l.className = cls;
      l.textContent = label;
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = p[key] || '';
      inp.placeholder = ph;
      inp.id = `pkg-${key}-${i}`;
      inp.maxLength = key === 'desc' ? 90 : 30;
      if (key === 'price') inp.inputMode = 'decimal';
      inp.addEventListener('input', () => { p[key] = inp.value; redrawParty(); });
      l.appendChild(inp);
      return l;
    };
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'x';
    del.textContent = '×';
    del.title = 'Remove this package';
    del.setAttribute('aria-label', `Remove package ${i + 1}`);
    del.addEventListener('click', () => { party.packages.splice(i, 1); renderPackages(); redrawParty(); });
    row.append(mk('Package', 'name', 'e.g. 2 hour party'), mk('Price (£)', 'price', 'e.g. 200'), del);
    card.append(row, mk("What's included", 'desc', 'e.g. 45 minutes of sensory activities', 'full'));
    box.appendChild(card);
  });
  $p('addPkg').disabled = party.packages.length >= 4;
}

function bindParty() {
  for (const k of ['title', 'quoteTop', 'quoteBottom', 'headline', 'subline', 'available', 'contactIntro', 'contactName', 'phone', 'email', 'bookingsText']) {
    const inp = $p(k);
    inp.value = party[k] || '';
    inp.addEventListener('input', () => { party[k] = inp.value; redrawParty(); });
  }
  for (const k of ['bookings', 'award']) {
    const cb = $p(k);
    cb.checked = !!party[k];
    cb.addEventListener('change', () => { party[k] = cb.checked; redrawParty(); });
  }
  $p('addPkg').addEventListener('click', () => {
    party.packages.push({ name: '', price: '', desc: '' });
    renderPackages();
    redrawParty();
    $p(`pkg-name-${party.packages.length - 1}`).focus();
  });
  $p('photo').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = await shrinkPhoto(f);
    pImages.photo = await loadPartyImage(url);
    try { localStorage.setItem(`${PARTY_KEY}-photo`, url); } catch { /* too big: keeps working for this visit */ }
    redrawParty();
  });
  $p('clearPhoto').addEventListener('click', () => {
    pImages.photo = null;
    $p('photo').value = '';
    try { localStorage.removeItem(`${PARTY_KEY}-photo`); } catch { /* ignore */ }
    redrawParty();
  });
  $p('download').addEventListener('click', () => {
    drawParty(pCanvas);
    pCanvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'party-poster.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      $p('status').textContent = 'Downloaded. Print it on A4, or share it on Facebook and Instagram.';
    }, 'image/png');
  });
  $p('print').addEventListener('click', () => window.print());
}

// Keep uploaded photos small enough to save on the device
function shrinkPhoto(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = async () => {
      const img = await loadPartyImage(r.result);
      if (!img) return res(r.result);
      const k = Math.min(1, 900 / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k);
      cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      res(cv.toDataURL('image/jpeg', 0.85));
    };
    r.readAsDataURL(file);
  });
}
function loadPartyImage(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

(async function startParty() {
  bindParty();
  renderPackages();
  const logoSrc = (typeof ASSET_DATA !== 'undefined' && ASSET_DATA.logo) || 'assets/logo.png';
  const byId = Object.fromEntries(ELEMENTS.map((e) => [e.id, e.src]));
  let savedPhoto = null;
  try { savedPhoto = localStorage.getItem(`${PARTY_KEY}-photo`); } catch { /* ignore */ }
  const [logo, photo, ...pics] = await Promise.all([loadPartyImage(logoSrc), savedPhoto ? loadPartyImage(savedPhoto) : null, ...PARTY_PICS.map((id) => loadPartyImage(byId[id]))]);
  pImages.logo = logo;
  pImages.photo = photo;
  PARTY_PICS.forEach((id, i) => { pImages.els[id] = pics[i]; });
  try {
    await Promise.all(['500 20px Nunito', '700 20px Nunito', '800 20px Nunito', '900 20px Nunito', 'italic 700 20px Nunito', '400 20px Delius', '400 20px Andika'].map((f) => document.fonts.load(f)));
  } catch { /* draw with fallback fonts */ }
  redrawParty();
})();
