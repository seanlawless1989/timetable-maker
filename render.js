/* Draws a timetable onto a canvas from the details entered in the form.
   Layout follows the Canva timetables: logo top centre, title under it,
   one tall column per day alternating brand green and yellow. */

// Brand book fonts: Museo Sans Rounded (headers bold, body) and Delius (sub-headers).
// Museo Sans Rounded is a paid font, so Nunito (free, rounded) stands in for it.
const FONT = "Nunito, Arial, sans-serif";
const SUB_FONT = "Delius, Arial, sans-serif";
const LOGO_FONT = "Andika, Arial, sans-serif";

const SIZES = {
  post: { label: 'Facebook post (same as your Canva)', W: 940, H: 788, scale: 2 },
  square: { label: 'Instagram square', W: 1080, H: 1080, scale: 1 },
  story: { label: 'Instagram / Facebook story', W: 1080, H: 1920, scale: 1 },
  a4: { label: 'A4 poster to print', W: 1240, H: 1754, scale: 2 },
};

const HELLO_BABY = 'Hello Baby (birth - 12 weeks)';

function formatTime(t, fmt) {
  if (!t) return '';
  const [hS, mS] = t.split(':');
  const h = Number(hS), m = mS || '00';
  if (fmt === '24h') return `${String(h).padStart(2, '0')}:${m}`;
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  if (fmt === 'short' && m === '00') return `${h12}${suffix}`;
  return `${h12}:${m}${suffix}`;
}

function classLines(cls, opts) {
  const start = formatTime(cls.start, opts.timeFmt);
  const end = formatTime(cls.end, opts.timeFmt);
  const time = end ? `${start} - ${end}` : start;
  const age = cls.age === 'custom' ? (cls.custom || '').trim() : cls.age;
  const wrapAge = (a) => (opts.brackets && a ? `(${a})` : a);
  const lines = [];
  if (time) lines.push({ text: time, kind: 'time' });
  if (age === HELLO_BABY) {
    lines.push({ text: 'Hello Baby', kind: 'label' });
    lines.push({ text: wrapAge('birth - 12 weeks'), kind: 'age' });
  } else if (age) {
    lines.push({ text: wrapAge(age), kind: 'age' });
  }
  return lines;
}

function wrapText(c, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const out = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.measureText(test).width <= maxW || !line) line = test;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

/* Logo cloud drawn in code to match the brand book's primary logo.
   The brand book asks for the original artwork, so a logo.png placed next to
   index.html (or uploaded in the form) is always used instead when present. */
const CLOUD = [
  [0.10, 0.30], [0.17, 0.06], [0.32, 0.02], [0.48, 0.08], [0.66, 0.0], [0.84, 0.05],
  [0.91, 0.28], [0.98, 0.52], [0.99, 0.80], [0.93, 0.97], [0.70, 1.0], [0.45, 0.96],
  [0.20, 1.0], [0.04, 0.95], [0.0, 0.70], [0.04, 0.45],
];

function cloudPath(c, x, y, w, h) {
  // closed Catmull-Rom spline through the cloud points
  const P = CLOUD.map(([px, py]) => [x + px * w, y + py * h]);
  const n = P.length;
  c.beginPath();
  c.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    c.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1]);
  }
  c.closePath();
}

function drawLogo(c, cx, top, w, s, logoImg) {
  const h = w * 0.3;
  if (logoImg) {
    const k = Math.min((w * 1.05) / logoImg.width, (h * 1.25) / logoImg.height);
    const iw = logoImg.width * k, ih = logoImg.height * k;
    c.drawImage(logoImg, cx - iw / 2, top + (h - ih) / 2, iw, ih);
    return top + h;
  }
  const x = cx - w / 2, y = top;
  const band = h * 0.085;
  // white border (shows on non-white backgrounds, as the brand book notes)
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.15)';
  c.shadowBlur = 6 * s;
  cloudPath(c, x - band, y - band, w + band * 2, h + band * 2);
  c.fillStyle = BRAND.white;
  c.fill();
  c.restore();
  // dotted edge inside the white border
  cloudPath(c, x - band * 0.45, y - band * 0.45, w + band * 0.9, h + band * 0.9);
  c.strokeStyle = '#A8D57D';
  c.lineWidth = band * 0.32;
  c.setLineDash([0.1, band * 0.55]);
  c.lineCap = 'round';
  c.stroke();
  c.setLineDash([]);
  cloudPath(c, x, y, w, h);
  c.fillStyle = BRAND.green;
  c.fill();

  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  const fs = h * 0.36;
  c.font = `400 ${fs}px ${LOGO_FONT}`;
  c.fillStyle = BRAND.yellow;
  c.fillText('Baby Sensory', cx, y + h * 0.52);
  const tw = c.measureText('Baby Sensory').width;
  c.font = `400 ${fs * 0.22}px ${LOGO_FONT}`;
  c.fillText('TM', cx + tw / 2 + fs * 0.16, y + h * 0.27);
  let ts = h * 0.15;
  c.font = `400 ${ts}px ${LOGO_FONT}`;
  const tag = 'Precious Early Learning for Babies';
  while (c.measureText(tag).width > w * 0.78) {
    ts *= 0.95;
    c.font = `400 ${ts}px ${LOGO_FONT}`;
  }
  c.fillStyle = BRAND.greenTint;
  c.fillText(tag, cx, y + h * 0.78);
  return top + h + band;
}

function drawPicture(c, img, cx, cy, maxW, maxH) {
  if (!img) return;
  const k = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * k, h = img.height * k;
  c.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function drawCover(c, img, W, H) {
  const k = Math.max(W / img.width, H / img.height);
  const iw = img.width * k, ih = img.height * k;
  c.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
}

/* Main entry. state: the form details. images: { logo, background } as loaded Image objects or null. */
function drawTimetable(canvas, state, images = {}) {
  const size = SIZES[state.size] || SIZES.post;
  const { W, H, scale } = size;
  canvas.width = W * scale;
  canvas.height = H * scale;
  const c = canvas.getContext('2d');
  c.setTransform(scale, 0, 0, scale, 0, 0);
  const s = Math.min(W / 940, H / 788) * (W > H ? 1 : 1.08);
  const theme = THEMES[state.theme] || THEMES.spring;
  const days = state.days.filter((d) => d.day || d.classes.length);

  // Background
  if (images.background) {
    drawCover(c, images.background, W, H);
  } else {
    theme.background(c, W, H, s);
  }

  // Logo + corner decorations
  const margin = 30 * s;
  const logoW = 300 * s;
  const logoTop = (W > H ? 16 : 40) * s;
  const logoBottom = drawLogo(c, W / 2, logoTop, logoW, s, images.logo);
  const showPics = state.decorations !== false;
  const els = images.elements || {};
  const cornerIds = (state.cornerPics || theme.cornerPics || []).filter((id) => els[id]);
  const footIds = showPics ? (state.footPics || theme.footPics || []).filter((id) => els[id]) : [];
  if (showPics) {
    const cy = logoTop + 60 * s;
    const L = { x: margin + 62 * s, y: cy }, R = { x: W - margin - 62 * s, y: cy };
    if (cornerIds.length) {
      drawPicture(c, els[cornerIds[0]], L.x, L.y, 130 * s, 118 * s);
      drawPicture(c, els[cornerIds[1] || cornerIds[0]], R.x, R.y, 130 * s, 118 * s);
    } else {
      theme.corners(c, L, R, s);
    }
  }

  // Title
  const title = (state.title || '').trim();
  let titleSize = 54 * s;
  c.font = `800 ${titleSize}px ${FONT}`;
  const titleMax = W - 2 * (margin + 120 * s);
  while (title && c.measureText(title).width > titleMax && titleSize > 24 * s) {
    titleSize *= 0.95;
    c.font = `800 ${titleSize}px ${FONT}`;
  }
  const titleBase = logoBottom + 14 * s + titleSize * 0.85;
  if (title) {
    c.save();
    const light = theme.titleColour === BRAND.white;
    c.shadowColor = light ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.95)';
    c.shadowBlur = 14 * s;
    c.fillStyle = theme.titleColour;
    c.textAlign = 'center';
    c.fillText(title, W / 2, titleBase);
    c.shadowBlur = 6 * s;
    c.fillText(title, W / 2, titleBase);
    c.restore();
  }

  // Venue footer
  const venue = (state.venue || '').trim();
  let colBottom = H - (W > H ? 0 : 30 * s);
  if (venue) {
    let vs = 24 * s;
    c.font = `800 ${vs}px ${FONT}`;
    while (c.measureText(venue).width > W - 2 * margin - 40 * s && vs > 12 * s) {
      vs *= 0.95;
      c.font = `800 ${vs}px ${FONT}`;
    }
    const pillH = vs * 1.9;
    const pillW = c.measureText(venue).width + 48 * s;
    const pillY = H - pillH - 12 * s;
    c.fillStyle = 'rgba(255,255,255,0.95)';
    c.beginPath();
    c.roundRect(W / 2 - pillW / 2, pillY, pillW, pillH, pillH / 2);
    c.fill();
    c.fillStyle = BRAND.green;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(venue, W / 2, pillY + pillH / 2 + vs * 0.04);
    c.textBaseline = 'alphabetic';
    colBottom = pillY - 10 * s;
  }

  if (!days.length) return;

  // Columns
  const colTop = titleBase + 22 * s;
  const n = days.length;
  // Tall formats put days on two rows so the text can stay large
  const rows = (W < H * 0.95 && n > 3) || (W < H * 1.05 && n > 4) ? 2 : 1;
  const perRow = Math.ceil(n / rows);
  const rowGap = 18 * s;
  const rowH = (colBottom - colTop - (rows - 1) * rowGap) / rows;
  const colW = (W - 2 * margin) / perRow;
  const pad = 10 * s;
  const radius = Math.min(colW / 2, rowH / 3);
  const cells = days.map((d, i) => {
    const r = Math.floor(i / perRow);
    const inRow = r === rows - 1 ? n - r * perRow : perRow;
    const startX = margin + ((perRow - inRow) * colW) / 2;
    const top = colTop + r * (rowH + rowGap);
    return { x: startX + (i - r * perRow) * colW, top, bottom: top + rowH, last: i - r * perRow === inRow - 1, green: (i % 2 === 0) };
  });
  const textBottomOf = (cell) => cell.bottom - radius * 0.45;

  // Find the largest text size that fits every column
  const opts = { timeFmt: state.timeFmt, brackets: state.brackets !== false };
  const sizesAt = (k) => ({
    head: 30 * s * k,
    note: 19 * s * k,
    time: 25 * s * k,
    label: 22 * s * k,
    age: 21 * s * k,
  });
  const lineH = 1.22;
  const blockGapMin = 12 * s;

  function layoutDay(d, k, cell) {
    const z = sizesAt(Math.min(k, 1.25));
    const maxW = colW - 2 * pad;
    c.font = `400 ${z.head}px ${SUB_FONT}`;
    const head = d.day ? [d.day] : [];
    let ok = head.every((t) => c.measureText(t).width <= maxW);
    c.font = `400 ${z.note}px ${FONT}`;
    const note = d.note ? wrapText(c, d.note.trim(), maxW) : [];
    ok = ok && note.every((t) => c.measureText(t).width <= maxW);
    const blocks = d.classes.map((cls) => {
      const lines = [];
      for (const ln of classLines(cls, opts)) {
        const px = z[ln.kind];
        c.font = `${ln.kind === 'age' ? 700 : 800} ${px}px ${FONT}`;
        const wrapped = wrapText(c, ln.text, maxW);
        // prefer slightly smaller text over breaking a short line in two
        if (wrapped.length > 1 && k > 0.8 && ln.kind !== 'time') ok = false;
        for (const t of wrapped) {
          if (c.measureText(t).width > maxW) ok = false;
          lines.push({ text: t, kind: ln.kind, px });
        }
      }
      const h = lines.reduce((a, l) => a + l.px * lineH, 0);
      return { lines, h };
    }).filter((b) => b.lines.length);
    const headH = head.length * z.head * 1.25 + note.length * z.note * lineH;
    const startY = cell.top + 18 * s + headH + 14 * s;
    const total = blocks.reduce((a, b) => a + b.h, 0) + Math.max(0, blocks.length - 1) * blockGapMin;
    ok = ok && startY + total <= textBottomOf(cell);
    return { ok, z, head, note, blocks, startY, total };
  }

  let k = W > H ? 1.15 : 1.3;
  let layouts;
  for (; k >= 0.45; k -= 0.05) {
    layouts = days.map((d, i) => layoutDay(d, k, cells[i]));
    if (layouts.every((l) => l.ok)) break;
  }

  days.forEach((d, i) => {
    const cell = cells[i];
    const x = cell.x;
    const green = cell.green;
    const fill = green ? BRAND.green : BRAND.yellow;
    // Brand book pairings: yellow or white on green, green on yellow
    const headCol = green ? BRAND.yellow : BRAND.green;
    const bodyCol = green ? BRAND.white : BRAND.green;
    c.fillStyle = fill;
    c.beginPath();
    c.roundRect(x, cell.top, colW + (cell.last ? 0 : 0.5), cell.bottom - cell.top, [4 * s, 4 * s, radius, radius]);
    c.fill();
    if (theme.outline && !images.background) {
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 3 * s;
      c.stroke();
    }

    const L = layouts[i];
    const cx = x + colW / 2;
    c.textAlign = 'center';
    let y = cell.top + 18 * s;
    c.fillStyle = headCol;
    c.font = `400 ${L.z.head}px ${SUB_FONT}`;
    for (const t of L.head) {
      y += L.z.head;
      // Delius only comes in one weight, so thicken it slightly for legibility
      c.strokeStyle = headCol;
      c.lineWidth = L.z.head * 0.045;
      c.lineJoin = 'round';
      c.strokeText(t, cx, y);
      c.fillText(t, cx, y);
      y += L.z.head * 0.25;
    }
    c.font = `400 ${L.z.note}px ${FONT}`;
    for (const t of L.note) {
      y += L.z.note;
      c.fillText(t, cx, y);
      y += L.z.note * (lineH - 1);
    }

    // Spread the classes down the column, like the Canva versions
    const avail = textBottomOf(cell) - L.startY;
    const nb = L.blocks.length;
    const free = avail - L.blocks.reduce((a, b) => a + b.h, 0);
    // leave room at the bottom of the column when a picture goes there
    const maxGap = footIds.length ? 34 * s : 110 * s;
    const gap = nb > 0 ? Math.min(free / (nb + 0.4), maxGap) : 0;
    y = L.startY + gap * 0.25;
    c.fillStyle = bodyCol;
    for (const b of L.blocks) {
      for (const ln of b.lines) {
        c.font = `${ln.kind === 'age' ? 700 : 800} ${ln.px}px ${FONT}`;
        y += ln.px;
        c.fillText(ln.text, cx, y);
        y += ln.px * (lineH - 1);
      }
      y += Math.max(gap, blockGapMin);
    }

    // Brand picture in the space left at the bottom of the column
    if (footIds.length) {
      const top = y - Math.max(gap, blockGapMin) + 12 * s;
      const bottom = cell.bottom - 10 * s;
      const room = bottom - top;
      if (room > 56 * s) {
        // skip pictures that would vanish into the column colour (green stars on green, etc.)
        const clash = (id) => (green ? /^(stars-green|note-)/ : /^stars-yellow/).test(id);
        let pick = null;
        for (let k = 0; k < footIds.length && !pick; k++) {
          const id = footIds[(i + k) % footIds.length];
          if (!clash(id)) pick = id;
        }
        const img = pick && els[pick];
        const size = Math.min(room * 0.86, 150 * s);
        drawPicture(c, img, cx, top + room * 0.5, Math.min(colW * 0.66, size), size);
      }
    }
  });
}
