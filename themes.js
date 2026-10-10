/* Baby Sensory timetable themes.
   Everything here is drawn with simple shapes in code (no photos, no AI imagery),
   so every timetable comes out the same way from the same details.
   To add a theme: copy one of the entries in THEMES at the bottom and change it. */

const BRAND = {
  green: '#74C043',
  yellow: '#FBEB02',
  ink: '#1D1D1B',
  white: '#FFFFFF',
};

/* Seeded random numbers, so a theme's pattern is identical every time. */
function seeded(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

function withTransform(c, x, y, rot, scale, fn) {
  c.save();
  c.translate(x, y);
  if (rot) c.rotate(rot);
  if (scale && scale !== 1) c.scale(scale, scale);
  fn();
  c.restore();
}

function vGradient(c, H, stops) {
  const g = c.createLinearGradient(0, 0, 0, H);
  stops.forEach(([p, col]) => g.addColorStop(p, col));
  return g;
}

/* ---------- Shapes ---------- */

function flower(c, x, y, r, petal, centre = '#FFD54A') {
  withTransform(c, x, y, 0, 1, () => {
    c.fillStyle = petal;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      c.beginPath();
      c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = centre;
    c.beginPath();
    c.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    c.fill();
  });
}

function tulip(c, x, y, size, colour, rot = 0) {
  withTransform(c, x, y, rot, size / 100, () => {
    c.strokeStyle = '#4E9A2A';
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(4, 60, 0, 120);
    c.stroke();
    c.fillStyle = '#6DB93C';
    c.beginPath();
    c.moveTo(0, 115);
    c.quadraticCurveTo(-34, 70, -26, 40);
    c.quadraticCurveTo(-8, 80, 0, 100);
    c.fill();
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(-24, -42);
    c.lineTo(-12, -22);
    c.lineTo(0, -46);
    c.lineTo(12, -22);
    c.lineTo(24, -42);
    c.quadraticCurveTo(30, 6, 0, 6);
    c.quadraticCurveTo(-30, 6, -24, -42);
    c.fill();
  });
}

function egg(c, x, y, w, h, colour, stripe, rot = 0) {
  withTransform(c, x, y, rot, 1, () => {
    c.beginPath();
    c.moveTo(0, -h / 2);
    c.bezierCurveTo(w * 0.62, -h / 2, w * 0.56, h / 2, 0, h / 2);
    c.bezierCurveTo(-w * 0.56, h / 2, -w * 0.62, -h / 2, 0, -h / 2);
    c.closePath();
    c.fillStyle = colour;
    c.fill();
    c.save();
    c.clip();
    c.strokeStyle = stripe;
    c.lineWidth = Math.max(2, w * 0.07);
    c.lineJoin = 'round';
    for (const band of [-0.12, 0.18]) {
      c.beginPath();
      const yy = band * h;
      for (let i = 0; i <= 10; i++) {
        const xx = -w / 2 + (i / 10) * w;
        const dy = i % 2 ? h * 0.05 : -h * 0.05;
        i ? c.lineTo(xx, yy + dy) : c.moveTo(xx, yy + dy);
      }
      c.stroke();
    }
    c.fillStyle = stripe;
    for (const [dx, dy] of [[-0.18, -0.32], [0.16, -0.36], [0, 0.38], [-0.22, 0.34], [0.22, 0.32]]) {
      c.beginPath();
      c.arc(dx * w, dy * h, w * 0.05, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  });
}

function bunny(c, x, y, size) {
  withTransform(c, x, y, 0, size / 100, () => {
    const ear = (dx, rot) => {
      withTransform(c, dx, -70, rot, 1, () => {
        c.fillStyle = '#FFFFFF';
        c.beginPath();
        c.ellipse(0, 0, 16, 46, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#F7A8BE';
        c.beginPath();
        c.ellipse(0, 4, 8, 34, 0, 0, Math.PI * 2);
        c.fill();
      });
    };
    ear(-20, -0.15);
    ear(22, 0.2);
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.ellipse(0, 0, 50, 42, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1D1D1B';
    for (const dx of [-18, 18]) {
      c.beginPath();
      c.arc(dx, -6, 6, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#FFFFFF';
    for (const dx of [-16, 20]) {
      c.beginPath();
      c.arc(dx, -8, 2, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#F7A8BE';
    for (const dx of [-30, 30]) {
      c.beginPath();
      c.ellipse(dx, 10, 9, 6, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#EE7FA0';
    c.beginPath();
    c.moveTo(-6, 6);
    c.lineTo(6, 6);
    c.lineTo(0, 13);
    c.fill();
    c.strokeStyle = '#8A8A8A';
    c.lineWidth = 1.5;
    for (const s of [-1, 1]) {
      for (const dy of [-3, 4]) {
        c.beginPath();
        c.moveTo(s * 12, 10);
        c.lineTo(s * 46, 10 + dy * 2);
        c.stroke();
      }
    }
  });
}

function sun(c, x, y, r) {
  withTransform(c, x, y, 0, 1, () => {
    c.fillStyle = '#FFC400';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.beginPath();
      c.moveTo(Math.cos(a - 0.13) * r * 0.9, Math.sin(a - 0.13) * r * 0.9);
      c.lineTo(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45);
      c.lineTo(Math.cos(a + 0.13) * r * 0.9, Math.sin(a + 0.13) * r * 0.9);
      c.fill();
    }
    c.fillStyle = '#FFE14A';
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#5A3A12';
    for (const dx of [-0.32, 0.32]) {
      c.beginPath();
      c.arc(dx * r, -0.12 * r, r * 0.08, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = '#5A3A12';
    c.lineWidth = r * 0.07;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(0, 0.05 * r, r * 0.38, 0.2 * Math.PI, 0.8 * Math.PI);
    c.stroke();
    c.fillStyle = 'rgba(244,120,120,0.55)';
    for (const dx of [-0.55, 0.55]) {
      c.beginPath();
      c.arc(dx * r, 0.2 * r, r * 0.13, 0, Math.PI * 2);
      c.fill();
    }
  });
}

function beachBall(c, x, y, r) {
  withTransform(c, x, y, -0.4, 1, () => {
    const cols = ['#EF3F30', '#FFFFFF', '#1EADE3', '#FFFFFF', '#FBD400', '#FFFFFF'];
    c.save();
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.clip();
    cols.forEach((col, i) => {
      const a0 = (i / 6) * Math.PI * 2;
      const a1 = ((i + 1) / 6) * Math.PI * 2;
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(0, -r * 0.55);
      c.quadraticCurveTo(Math.cos(a0) * r * 1.6, Math.sin(a0) * r * 1.6, Math.cos(a0) * r * 2, Math.sin(a0) * r * 2);
      c.lineTo(Math.cos(a1) * r * 2, Math.sin(a1) * r * 2);
      c.closePath();
      c.fill();
    });
    c.restore();
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.ellipse(0, -r * 0.55, r * 0.16, r * 0.1, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    c.lineWidth = r * 0.04;
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.stroke();
  });
}

function leaf(c, x, y, size, rot, colour) {
  withTransform(c, x, y, rot, size / 100, () => {
    c.fillStyle = colour;
    c.beginPath();
    // simple maple-style leaf: five rounded points
    const pts = [[0, -50], [14, -22], [44, -30], [30, 2], [46, 22], [14, 18], [6, 44], [0, 30], [-6, 44], [-14, 18], [-46, 22], [-30, 2], [-44, -30], [-14, -22]];
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(80,30,0,0.35)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, 56);
    c.lineTo(0, -40);
    c.moveTo(0, 10);
    c.lineTo(30, -18);
    c.moveTo(0, 10);
    c.lineTo(-30, -18);
    c.stroke();
  });
}

function pumpkin(c, x, y, r) {
  withTransform(c, x, y, 0, 1, () => {
    c.fillStyle = '#4E7A2A';
    c.beginPath();
    c.moveTo(-r * 0.08, -r * 0.6);
    c.quadraticCurveTo(-r * 0.05, -r * 0.95, r * 0.12, -r * 1.05);
    c.lineTo(r * 0.18, -r * 0.92);
    c.quadraticCurveTo(r * 0.06, -r * 0.85, r * 0.1, -r * 0.6);
    c.fill();
    const lobes = [[-0.55, 0.62, '#E8801E'], [0.55, 0.62, '#E8801E'], [-0.25, 0.7, '#F29A3A'], [0.25, 0.7, '#F29A3A'], [0, 0.72, '#F6A84A']];
    for (const [dx, w, col] of lobes) {
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(dx * r, 0, w * r * 0.62, r * 0.68, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgba(160,70,0,0.35)';
      c.lineWidth = r * 0.03;
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.35)';
    for (const [dx, dy] of [[-0.1, -0.3], [0.05, -0.1], [-0.08, 0.15], [0.45, -0.2], [-0.5, 0.1]]) {
      c.beginPath();
      c.ellipse(dx * r, dy * r, r * 0.02, r * 0.07, 0, 0, Math.PI * 2);
      c.fill();
    }
  });
}

function acorn(c, x, y, size, rot) {
  withTransform(c, x, y, rot, size / 100, () => {
    c.fillStyle = '#C98B4A';
    c.beginPath();
    c.ellipse(0, 18, 30, 38, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.beginPath();
    c.ellipse(-10, 18, 6, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#7A4A1E';
    c.beginPath();
    c.ellipse(0, -8, 36, 20, 0, Math.PI, 0);
    c.lineTo(36, -2);
    c.quadraticCurveTo(0, 8, -36, -2);
    c.closePath();
    c.fill();
    c.strokeStyle = '#5A3412';
    c.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(i * 12 - 8, -20);
      c.lineTo(i * 12 + 8, 0);
      c.stroke();
    }
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, -26);
    c.quadraticCurveTo(4, -36, 10, -38);
    c.stroke();
  });
}

function snowflake(c, x, y, r, rot = 0, colour = '#FFFFFF') {
  withTransform(c, x, y, rot, 1, () => {
    c.strokeStyle = colour;
    c.lineWidth = Math.max(1.5, r * 0.1);
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      c.rotate(Math.PI / 3);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -r);
      c.moveTo(0, -r * 0.55);
      c.lineTo(r * 0.25, -r * 0.8);
      c.moveTo(0, -r * 0.55);
      c.lineTo(-r * 0.25, -r * 0.8);
      c.stroke();
    }
  });
}

function bauble(c, x, y, r, colour, stringTop) {
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.lineWidth = Math.max(1.5, r * 0.04);
  c.beginPath();
  c.moveTo(x, stringTop);
  c.lineTo(x, y - r);
  c.stroke();
  c.fillStyle = '#E6C35C';
  c.fillRect(x - r * 0.22, y - r * 1.12, r * 0.44, r * 0.22);
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.25, colour);
  g.addColorStop(1, shade(colour, -0.35));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = r * 0.08;
  c.beginPath();
  c.moveTo(x - r * 0.95, y + r * 0.05);
  for (let i = 0; i <= 8; i++) c.lineTo(x - r * 0.95 + (i / 8) * r * 1.9, y + (i % 2 ? -r * 0.12 : r * 0.08));
  c.stroke();
}

function firework(c, x, y, r, colours) {
  withTransform(c, x, y, 0, 1, () => {
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const col = colours[i % colours.length];
      c.strokeStyle = col;
      c.lineWidth = Math.max(1.5, r * 0.035);
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25);
      c.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
      c.stroke();
      c.fillStyle = col;
      c.beginPath();
      c.arc(Math.cos(a) * r, Math.sin(a) * r, r * 0.05, 0, Math.PI * 2);
      c.fill();
    }
  });
}

function star(c, x, y, r, colour, rot = 0) {
  withTransform(c, x, y, rot, 1, () => {
    c.fillStyle = colour;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
  });
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function scatter(c, W, H, count, seed, fn) {
  const rnd = seeded(seed);
  for (let i = 0; i < count; i++) fn(rnd() * W, rnd() * H, rnd, i);
}

/* ---------- Themes ----------
   Each theme gives: a name, the default title, the title colour,
   a background painter and the two corner decorations beside the logo. */

const THEMES = {
  spring: {
    name: 'Spring',
    title: 'Spring Term',
    titleColour: BRAND.ink,
    swatch: ['#CFEEFC', '#F9B4C8'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#CFEEFC'], [1, '#EAF7D9']]);
      c.fillRect(0, 0, W, H);
      const cols = ['#F9B4C8', '#C9B6F2', '#FFF07A', '#FFFFFF', '#A9DCF5'];
      scatter(c, W, H, 34, 11, (x, y, rnd, i) => {
        c.globalAlpha = 0.75;
        flower(c, x, y, (10 + rnd() * 14) * s, cols[i % cols.length]);
        c.globalAlpha = 1;
      });
    },
    corners(c, L, R, s) {
      tulip(c, L.x - 22 * s, L.y + 10 * s, 70 * s, '#F27BA0', -0.25);
      tulip(c, L.x + 8 * s, L.y, 80 * s, '#FFC93C', 0);
      tulip(c, L.x + 38 * s, L.y + 12 * s, 70 * s, '#9DD3F5', 0.25);
      flower(c, R.x, R.y, 38 * s, '#F9B4C8');
      flower(c, R.x + 38 * s, R.y + 36 * s, 22 * s, '#C9B6F2');
    },
  },
  easter: {
    name: 'Easter',
    title: 'Easter Term',
    titleColour: BRAND.ink,
    swatch: ['#F6E3EE', '#BDE3D0'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#E8F1F5'], [1, '#F6E9F2']]);
      c.fillRect(0, 0, W, H);
      const cols = ['#BDE3D0', '#F6C6D8', '#FFF1A8', '#C9D8F5', '#E2CFF4'];
      scatter(c, W, H, 22, 7, (x, y, rnd, i) => {
        const w = (70 + rnd() * 50) * s;
        egg(c, x, y, w, w * 1.3, cols[i % cols.length], 'rgba(255,255,255,0.8)', (rnd() - 0.5) * 1.2);
      });
    },
    corners(c, L, R, s) {
      egg(c, L.x, L.y + 8 * s, 74 * s, 96 * s, '#F27BA0', '#FFFFFF', -0.2);
      egg(c, L.x + 48 * s, L.y + 30 * s, 50 * s, 64 * s, '#FFD54A', '#FFFFFF', 0.25);
      bunny(c, R.x, R.y + 20 * s, 90 * s);
    },
  },
  summer: {
    name: 'Summer',
    title: 'Summer Term',
    titleColour: BRAND.ink,
    swatch: ['#7FD0F5', '#F3DCA4'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#6CC6F2'], [0.55, '#CDEFFC'], [0.62, '#3FB4E0'], [0.7, '#F3DCA4'], [1, '#EBCB85']]);
      c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      scatter(c, W, H * 0.45, 6, 3, (x, y, rnd) => {
        const r = (16 + rnd() * 14) * s;
        for (const [dx, dy, k] of [[0, 0, 1], [r, 4 * s, 0.8], [-r, 6 * s, 0.75], [r * 0.5, -r * 0.5, 0.8]]) {
          c.beginPath();
          c.arc(x + dx, y + dy, r * k, 0, Math.PI * 2);
          c.fill();
        }
      });
    },
    corners(c, L, R, s) {
      sun(c, L.x + 10 * s, L.y, 40 * s);
      sun(c, R.x - 10 * s, R.y, 40 * s);
    },
  },
  summerHoliday: {
    name: 'Summer holiday',
    title: 'Summer Holiday Term',
    titleColour: BRAND.ink,
    swatch: ['#3FB4E0', '#EF3F30'],
    background(c, W, H, s) { THEMES.summer.background(c, W, H, s); },
    corners(c, L, R, s) {
      sun(c, L.x + 10 * s, L.y, 40 * s);
      beachBall(c, R.x - 6 * s, R.y + 8 * s, 46 * s);
    },
  },
  autumn: {
    name: 'Autumn',
    title: 'Autumn Term',
    titleColour: BRAND.white,
    swatch: ['#F2A91E', '#C8401E'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#F6A33A'], [1, '#C8401E']]);
      c.fillRect(0, 0, W, H);
      const cols = ['#E2571E', '#F7C948', '#B5341B', '#8A3B12', '#F2A91E'];
      scatter(c, W, H, 30, 5, (x, y, rnd, i) => {
        c.globalAlpha = 0.85;
        leaf(c, x, y, (50 + rnd() * 50) * s, rnd() * Math.PI * 2, cols[i % cols.length]);
        c.globalAlpha = 1;
      });
    },
    corners(c, L, R, s) {
      acorn(c, L.x - 10 * s, L.y, 70 * s, -0.3);
      acorn(c, L.x + 34 * s, L.y + 22 * s, 56 * s, 0.35);
      pumpkin(c, R.x, R.y + 16 * s, 52 * s);
    },
  },
  pumpkin: {
    name: 'Baby Pumpkin',
    title: 'Baby Pumpkin',
    titleColour: BRAND.ink,
    swatch: ['#FFF6EF', '#E8801E'],
    background(c, W, H, s) {
      c.fillStyle = '#FFF6EF';
      c.fillRect(0, 0, W, H);
      const cols = ['#F6C9A6', '#F2B07C', '#FAD9BE'];
      scatter(c, W, H, 30, 9, (x, y, rnd, i) => {
        c.globalAlpha = 0.6;
        leaf(c, x, y, (36 + rnd() * 30) * s, rnd() * Math.PI * 2, cols[i % cols.length]);
        c.globalAlpha = 1;
      });
    },
    corners(c, L, R, s) {
      pumpkin(c, L.x, L.y + 16 * s, 50 * s);
      pumpkin(c, R.x, R.y + 16 * s, 50 * s);
    },
  },
  christmas: {
    name: 'Christmas',
    title: 'Christmas Term',
    titleColour: BRAND.white,
    outline: true,
    swatch: ['#0F5A3A', '#D7263D'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#14694A'], [1, '#0A3D28']]);
      c.fillRect(0, 0, W, H);
      scatter(c, W, H, 40, 13, (x, y, rnd) => {
        c.globalAlpha = 0.35 + rnd() * 0.4;
        snowflake(c, x, y, (8 + rnd() * 16) * s, rnd());
        c.globalAlpha = 1;
      });
    },
    corners(c, L, R, s) {
      bauble(c, L.x - 14 * s, L.y + 10 * s, 34 * s, '#D7263D', 0);
      bauble(c, L.x + 46 * s, L.y - 10 * s, 24 * s, '#E6C35C', 0);
      bauble(c, R.x + 14 * s, R.y + 10 * s, 34 * s, '#D7263D', 0);
      bauble(c, R.x - 46 * s, R.y - 10 * s, 24 * s, '#E6C35C', 0);
    },
  },
  newYear: {
    name: 'New Year',
    title: 'New Year Term',
    titleColour: BRAND.white,
    swatch: ['#0D1635', '#E6C35C'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#101C45'], [1, '#050A1C']]);
      c.fillRect(0, 0, W, H);
      const cols = ['#E6C35C', '#F4E3A1', '#C0C6D4', '#FFFFFF'];
      scatter(c, W, H, 90, 21, (x, y, rnd, i) => {
        c.fillStyle = cols[i % cols.length];
        withTransform(c, x, y, rnd() * Math.PI, 1, () => c.fillRect(-4 * s, -1.5 * s, 8 * s, 3 * s));
      });
      scatter(c, W, H, 14, 4, (x, y, rnd) => star(c, x, y, (3 + rnd() * 4) * s, '#FFFFFF', rnd()));
    },
    corners(c, L, R, s) {
      firework(c, L.x, L.y, 52 * s, ['#3D7BF5', '#F5D442', '#E8463F']);
      firework(c, R.x, R.y, 52 * s, ['#F5D442', '#8ED1FC', '#F27BA0']);
    },
  },
  plain: {
    name: 'Everyday',
    title: 'Our Classes',
    titleColour: BRAND.ink,
    swatch: ['#FFFFFF', '#74C043'],
    background(c, W, H, s) {
      c.fillStyle = vGradient(c, H, [[0, '#FFFFFF'], [1, '#F2F9E8']]);
      c.fillRect(0, 0, W, H);
      scatter(c, W, H, 40, 17, (x, y, rnd, i) => {
        c.fillStyle = i % 2 ? 'rgba(116,192,67,0.18)' : 'rgba(251,235,2,0.3)';
        c.beginPath();
        c.arc(x, y, (6 + rnd() * 16) * s, 0, Math.PI * 2);
        c.fill();
      });
    },
    corners() {},
  },
};
