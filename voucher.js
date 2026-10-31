/* Gift voucher maker. Draws a fixed brand template (based on the Darlington voucher)
   with the franchisee's own details, and downloads it as a picture to print or send. */

const VOUCHER_KEY = 'bs-voucher-v1';
const msgMe = (() => { try { return JSON.parse(localStorage.getItem('bs-messages-v1')) || {}; } catch { return {}; } })();

const VOUCHER_DEFAULT = {
  style: 'green',
  area: (msgMe.area || '').replace(/^\s*baby sensory\s*/i, ''),
  kind: 'money',
  amount: '50',
  forText: 'one term of classes',
  to: '',
  from: '',
  number: 1,
  expiry: '',
  contactName: msgMe.name || '',
  contact: '',
  terms: 'Terms and conditions apply. Bookings, cancellations and rescheduling are subject to availability. Voucher cannot be refunded or exchanged for cash.',
};
const v = Object.assign({}, VOUCHER_DEFAULT, readStore());

function readStore() {
  try { return JSON.parse(localStorage.getItem(VOUCHER_KEY)) || {}; } catch { return {}; }
}
function store() {
  try { localStorage.setItem(VOUCHER_KEY, JSON.stringify(v)); } catch { /* storage unavailable */ }
}

// Sky colour behind the cloud; the hills, border and text keep to the brand pairings
const VOUCHER_STYLES = {
  green: { name: 'Green', sky: '#9BD35F', border: BRAND.yellow },
  yellow: { name: 'Yellow', sky: BRAND.yellow, border: BRAND.green },
  blue: { name: 'Sky blue', sky: '#CDEBF7', border: BRAND.yellow },
};

const VW = 1200, VH = 675, EXPORT_SCALE = 2;
const PICS = ['moon', 'stars-yellow-1', 'stars-yellow-2', 'sun', 'rain', 'say-hello', 'shakers-1', 'flower', 'corn', 'beach-ball', 'shaker-blue'];
const vImages = { logo: null, els: {} };

function numberText() {
  return String(Math.max(0, parseInt(v.number, 10) || 0)).padStart(3, '0');
}
function ordinalDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  const n = d.getDate(), sfx = ['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th';
  return `${n}${sfx} ${d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
}
function amountText() {
  const a = String(v.amount || '').trim().replace(/^£/, '');
  return a ? `£${a}` : '£';
}

// White cloud with a blue outline, built from overlapping circles like the example
const CLOUD_PUFFS = [[-300, 50, 125], [-190, -40, 150], [-30, -95, 175], [150, -55, 160], [295, 45, 130], [-120, 70, 170], [110, 70, 170]];
function drawVoucherCloud(c, cx, cy, k) {
  const shape = (grow) => {
    c.beginPath();
    for (const [x, y, r] of CLOUD_PUFFS) {
      c.moveTo(cx + x * k + r * k + grow, cy + y * k);
      c.arc(cx + x * k, cy + y * k, r * k + grow, 0, Math.PI * 2);
    }
    c.roundRect(cx - 330 * k - grow, cy + 20 * k - grow, 660 * k + grow * 2, 175 * k + grow * 2, 60 * k);
  };
  c.fillStyle = '#58C3DA';
  shape(14);
  c.fill('nonzero');
  c.fillStyle = BRAND.white;
  shape(0);
  c.fill('nonzero');
}

function drawHills(c) {
  c.fillStyle = '#62AD35';
  c.beginPath();
  c.moveTo(0, 430);
  c.bezierCurveTo(250, 340, 520, 400, 700, 460);
  c.bezierCurveTo(880, 520, 1050, 400, 1200, 390);
  c.lineTo(1200, VH);
  c.lineTo(0, VH);
  c.closePath();
  c.fill();
  c.fillStyle = BRAND.green;
  c.beginPath();
  c.moveTo(0, 520);
  c.bezierCurveTo(260, 450, 560, 500, 760, 540);
  c.bezierCurveTo(950, 580, 1080, 500, 1200, 480);
  c.lineTo(1200, VH);
  c.lineTo(0, VH);
  c.closePath();
  c.fill();
}

function drawVoucher(canvas) {
  canvas.width = VW * EXPORT_SCALE;
  canvas.height = VH * EXPORT_SCALE;
  const c = canvas.getContext('2d');
  c.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);
  const st = VOUCHER_STYLES[v.style] || VOUCHER_STYLES.green;
  const el = (id) => vImages.els[id];

  c.fillStyle = st.sky;
  c.fillRect(0, 0, VW, VH);

  // yellow sunshine shape behind the cloud, then the hills
  c.fillStyle = v.style === 'yellow' ? BRAND.white : BRAND.yellow;
  c.beginPath();
  c.moveTo(250, 520);
  c.quadraticCurveTo(600, 300, 980, 470);
  c.lineTo(980, 560);
  c.lineTo(250, 560);
  c.fill();
  drawHills(c);

  // pictures behind the cloud edges
  drawPicture(c, el('moon'), 300, 105, 115, 115);
  drawPicture(c, el('sun'), 880, 90, 125, 125);
  drawPicture(c, el('rain'), 970, 115, 95, 115);

  drawVoucherCloud(c, 600, 268, 0.86);

  drawPicture(c, el('stars-yellow-1'), 115, 190, 90, 90);
  drawPicture(c, el('stars-yellow-2'), 1085, 70, 80, 80);
  drawPicture(c, el('say-hello'), 1090, 200, 130, 130);
  drawPicture(c, el('shakers-1'), 105, 505, 110, 110);
  for (const [x, y, sz] of [[275, 505, 95], [325, 525, 100], [375, 510, 90]]) drawPicture(c, el('flower'), x, y, sz, sz);
  for (const [x, y, sz] of [[720, 500, 105], [770, 520, 115], [822, 495, 105]]) drawPicture(c, el('corn'), x, y, sz, sz);
  drawPicture(c, el('beach-ball'), 650, 600, 70, 70);
  drawPicture(c, el('shaker-blue'), 1110, 430, 80, 100);

  // voucher number pill, top left
  c.font = `800 20px ${FONT}`;
  const numLabel = `Voucher No. ${numberText()}`;
  const pw = c.measureText(numLabel).width + 40;
  c.fillStyle = BRAND.white;
  c.beginPath();
  c.roundRect(34, 30, pw, 44, 22);
  c.fill();
  c.strokeStyle = BRAND.green;
  c.lineWidth = 3;
  c.stroke();
  c.fillStyle = BRAND.green;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(numLabel, 54, 53);
  c.textBaseline = 'alphabetic';

  drawCloudText(c);

  // logo and area, bottom right
  const logoBottom = drawLogo(c, 1010, 505, 300, 1, vImages.logo);
  if (v.area.trim()) {
    let fs = 32;
    c.font = `400 ${fs}px ${SUB_FONT}`;
    while (c.measureText(v.area.trim()).width > 320 && fs > 16) { fs -= 1; c.font = `400 ${fs}px ${SUB_FONT}`; }
    c.textAlign = 'center';
    c.fillStyle = BRAND.yellow;
    c.strokeStyle = BRAND.yellow;
    c.lineWidth = fs * 0.045;
    c.strokeText(v.area.trim(), 1010, logoBottom + 14 + fs);
    c.fillText(v.area.trim(), 1010, logoBottom + 14 + fs);
  }

  // terms, bottom left, yellow on the green hill
  if (v.terms.trim()) {
    c.font = `800 14px ${FONT}`;
    c.fillStyle = BRAND.yellow;
    c.textAlign = 'left';
    const lines = wrapText(c, `**${v.terms.trim()}`, 560).slice(0, 4);
    let y = VH - 22 - (lines.length - 1) * 18;
    for (const ln of lines) { c.fillText(ln, 40, y); y += 18; }
  }

  // yellow (or green) frame
  c.strokeStyle = st.border;
  c.lineWidth = 16;
  c.strokeRect(8, 8, VW - 16, VH - 16);
}

function drawCloudText(c) {
  const area = v.area.trim();
  const brandName = `Baby Sensory${area ? ` ${area}` : ''}`;
  const maxW = 520;
  const lines = [];
  lines.push({ text: 'Gift Voucher', font: SUB_FONT, weight: 400, size: 66, colour: BRAND.green, gap: 10, faux: true });
  if (v.to.trim() || v.from.trim()) {
    const parts = [];
    if (v.to.trim()) parts.push(`To ${v.to.trim()}`);
    if (v.from.trim()) parts.push(`From ${v.from.trim()}`);
    lines.push({ text: parts.join('   ·   '), weight: 800, size: 24, colour: BRAND.ink, gap: 8 });
  }
  if (v.kind === 'money') {
    lines.push({ text: 'This voucher is for', weight: 700, size: 24, colour: BRAND.ink, gap: 0 });
    lines.push({ text: amountText(), weight: 900, size: 62, colour: BRAND.green, gap: 2 });
    lines.push({ text: `of classes at ${brandName}`, weight: 700, size: 24, colour: BRAND.ink, gap: 10 });
  } else {
    lines.push({ text: 'This voucher is for', weight: 700, size: 24, colour: BRAND.ink, gap: 2 });
    lines.push({ text: or2(v.forText, 'classes'), weight: 900, size: 40, colour: BRAND.green, gap: 4 });
    lines.push({ text: `at ${brandName}`, weight: 700, size: 24, colour: BRAND.ink, gap: 10 });
  }
  const who = v.contactName.trim();
  const how = v.contact.trim();
  if (who || how) {
    lines.push({ text: `To redeem, contact ${who || ''}${who && how ? ' at' : ''}`.replace(/\s+$/, ''), weight: 600, size: 20, colour: BRAND.ink, gap: 0 });
    if (how) lines.push({ text: how, weight: 800, size: 20, colour: BRAND.ink, gap: 4 });
  }
  if (v.expiry) lines.push({ text: `Valid until ${ordinalDate(v.expiry)}`, weight: 700, size: 18, colour: BRAND.green, gap: 0 });

  // wrap long lines, then shrink everything until it fits inside the cloud
  const top = 108, bottom = 422;
  let k = 1, laid;
  for (; k > 0.5; k -= 0.04) {
    laid = [];
    let h = 0;
    for (const ln of lines) {
      const size = ln.size * k;
      c.font = `${ln.weight} ${size}px ${ln.font || FONT}`;
      for (const t of wrapText(c, ln.text, maxW)) {
        laid.push({ ...ln, text: t, px: size });
        h += size * 1.18;
      }
      laid[laid.length - 1].after = ln.gap * k;
      h += ln.gap * k;
    }
    if (h <= bottom - top && laid.every((l) => { c.font = `${l.weight} ${l.px}px ${l.font || FONT}`; return c.measureText(l.text).width <= maxW; })) {
      laid.height = h;
      break;
    }
    laid.height = h;
  }
  let y = top + Math.max(0, (bottom - top - laid.height) / 2);
  c.textAlign = 'center';
  for (const l of laid) {
    c.font = `${l.weight} ${l.px}px ${l.font || FONT}`;
    y += l.px;
    c.fillStyle = l.colour;
    if (l.faux) {
      c.strokeStyle = l.colour;
      c.lineWidth = l.px * 0.045;
      c.lineJoin = 'round';
      c.strokeText(l.text, 600, y);
    }
    c.fillText(l.text, 600, y);
    y += l.px * 0.18 + (l.after || 0);
  }
}
const or2 = (a, b) => (a && String(a).trim()) || b;

// ---- page ------------------------------------------------------------------

const $v = (id) => document.getElementById(id);
const vCanvas = document.createElement('canvas');
let vPending = false;

function redraw() {
  if (vPending) return;
  vPending = true;
  requestAnimationFrame(() => {
    vPending = false;
    drawVoucher(vCanvas);
    $v('out').src = vCanvas.toDataURL('image/png');
    store();
  });
}

function bindVoucher() {
  const box = $v('styles');
  for (const [id, st] of Object.entries(VOUCHER_STYLES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme';
    b.innerHTML = `<span class="sw" style="background:${st.sky}"></span>`;
    b.append(st.name);
    b.setAttribute('aria-pressed', String(v.style === id));
    b.addEventListener('click', () => {
      v.style = id;
      box.querySelectorAll('.theme').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      redraw();
    });
    box.appendChild(b);
  }
  for (const k of ['area', 'amount', 'forText', 'to', 'from', 'number', 'expiry', 'contactName', 'contact', 'terms']) {
    const input = $v(k);
    input.value = v[k];
    input.addEventListener('input', () => { v[k] = input.value; redraw(); });
  }
  const kinds = document.querySelectorAll('input[name=kind]');
  const showKind = () => {
    $v('f-amount').hidden = v.kind !== 'money';
    $v('f-forText').hidden = v.kind === 'money';
  };
  kinds.forEach((r) => {
    r.checked = r.value === v.kind;
    r.addEventListener('change', () => { v.kind = r.value; showKind(); redraw(); });
  });
  showKind();
  $v('resetTerms').addEventListener('click', () => { v.terms = VOUCHER_DEFAULT.terms; $v('terms').value = v.terms; redraw(); });

  $v('download').addEventListener('click', () => {
    drawVoucher(vCanvas);
    vCanvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `gift-voucher-${numberText()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      nextNumber(`Downloaded voucher No. ${numberText()}.`);
    }, 'image/png');
  });
  $v('print').addEventListener('click', () => {
    const done = `Printed voucher No. ${numberText()}.`;
    window.print();
    nextNumber(done);
  });
}

// each voucher gets its own number, so move on to the next one after saving it
function nextNumber(msg) {
  v.number = (parseInt(v.number, 10) || 0) + 1;
  $v('number').value = v.number;
  $v('status').textContent = `${msg} The next voucher will be No. ${numberText()}.`;
  redraw();
}

(async function startVoucher() {
  bindVoucher();
  const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const logoSrc = (typeof ASSET_DATA !== 'undefined' && ASSET_DATA.logo) || 'assets/logo.png';
  const byId = Object.fromEntries(ELEMENTS.map((e) => [e.id, e.src]));
  const [logo, ...pics] = await Promise.all([load(logoSrc), ...PICS.map((id) => load(byId[id]))]);
  vImages.logo = logo;
  PICS.forEach((id, i) => { vImages.els[id] = pics[i]; });
  try {
    await Promise.all([document.fonts.load(`800 20px Nunito`), document.fonts.load(`900 20px Nunito`), document.fonts.load(`400 20px Delius`), document.fonts.load(`400 20px Andika`)]);
  } catch { /* draw with fallback fonts */ }
  redraw();
})();
