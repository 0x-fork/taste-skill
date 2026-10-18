// tasteskill / charts.js — small, dependency-free charts for app screens, drawn in SVG from your data.
// They follow references/app-screens.md: one question per chart, one series that matters, 3–5 quiet
// horizontal gridlines, round ticks that top out above the largest value, 2px straight lines with no
// markers, square bars, no gradients, a bare tooltip, tabular figures. Colours come from CSS variables:
//   --chart-1 … --chart-4 (series), --chart-muted (other series), --grid, --axis-ink, --ink, --surface
// Usage (after this file loads):
//   Charts.line(el, { labels: ['1 Oct', …], series: [{ name: 'Requests', values: [...] }], format: Charts.fmt.compact })
//   Charts.bars(el, { labels, values, highlight: 6, format })        one bar may carry the accent
//   Charts.ring(el, { value: 0.72, label: '72%', sub: 'of capacity' }) a progress ring with its total inside
//   Charts.barList(el, [{ label: 'Berlin', value: 412 }, …], { format })  a ranked list where the row is the bar
// Every chart gets role="img" and an aria-label that states what it shows.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const css = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;
  const svg = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (parent) parent.appendChild(n); return n; };
  // numbers follow the page's language (<html lang>), so separators match the rest of the screen
  const nf = (o) => new Intl.NumberFormat(document.documentElement.lang || 'en', o);
  const fmt = {
    int: (v) => nf({ maximumFractionDigits: 0 }).format(v),
    dec: (d) => (v) => nf({ minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
    pct: (d = 1) => (v) => nf({ style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
    money: (cur = 'EUR', d = 0) => (v) => nf({ style: 'currency', currency: cur, minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
    compact: (v) => nf({ notation: 'compact', maximumFractionDigits: 1 }).format(v),
    ms: (v) => `${nf({ maximumFractionDigits: 0 }).format(v)} ms`,
  };
  // Round ticks (steps of 1, 2, 2.5 or 5 × 10^n) whose top sits above the largest value.
  function ticks(min, max, count = 4) {
    if (max === min) max = min + 1;
    const raw = (max - min) / count, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
    const lo = Math.floor(min / step) * step; let hi = Math.ceil(max / step) * step; if (hi <= max) hi += step;
    const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function frame(el, h) {
    el.innerHTML = '';
    const w = Math.max(240, el.clientWidth || 600);
    const s = svg('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: h, role: 'img', style: 'display:block;overflow:visible;font-variant-numeric:tabular-nums' }, el);
    return { s, w, h };
  }
  function tooltip(el) {
    let t = el.querySelector('.chart-tip');
    if (!t) { t = document.createElement('div'); t.className = 'chart-tip'; t.style.cssText = 'position:absolute;pointer-events:none;padding:6px 8px;font:inherit;font-size:12px;line-height:1.35;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity 120ms ease;background:var(--surface,#fff);color:var(--ink,#111);border:1px solid var(--grid,#e5e7eb)'; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; el.appendChild(t); }
    return t;
  }
  function axes(g, { w, h, padL, padB, padT, yt, y, xLabels, x, el }) {
    const grid = css(el, '--grid', '#e8e8e8'), ink = css(el, '--axis-ink', '#6b6b6b');
    for (const v of yt) {
      const yy = y(v);
      svg('line', { x1: padL, x2: w, y1: yy, y2: yy, stroke: grid, 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, g);
      const t = svg('text', { x: padL - 8, y: yy + 4, 'text-anchor': 'end', 'font-size': 12, fill: ink }, g); t.textContent = el._fmt(v);
    }
    const n = xLabels.length, every = n <= 8 ? 1 : Math.max(1, Math.ceil(n / 6));
    xLabels.forEach((lab, i) => { if (i % every && i !== n - 1) return; if (i === n - 1 && (n - 1) % every && (n - 1) % every < every / 2) return; const t = svg('text', { x: x(i), y: h - padB + 18, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', 'font-size': 12, fill: ink }, g); t.textContent = lab; });
  }
  function line(el, { labels, series, format = fmt.int, height = 220, fill = false, min }) {
    el._fmt = format;
    const draw = () => {
      const { s, w, h } = frame(el, height);
      const all = series.flatMap((x) => x.values.filter((v) => v != null));
      const yt = ticks(min ?? Math.min(0, ...all), Math.max(...all), 4);
      const padL = 12 + Math.max(...yt.map((v) => String(format(v)).length)) * 7, padB = 26, padT = 8;
      const x = (i) => padL + (i * (w - padL)) / Math.max(1, labels.length - 1);
      const y = (v) => padT + (h - padT - padB) * (1 - (v - yt[0]) / (yt.at(-1) - yt[0]));
      const g = svg('g', {}, s);
      axes(g, { w, h, padL, padB, padT, yt, y, xLabels: labels, x, el });
      series.forEach((sr, k) => {
        const col = sr.colour || (k === 0 ? css(el, '--chart-1', '#2f6fdf') : css(el, `--chart-${k + 1}`, css(el, '--chart-muted', '#a3a3a3')));
        const pts = sr.values.map((v, i) => (v == null ? null : [x(i), y(v)]));
        const d = pts.reduce((acc, p, i) => (p ? acc + (acc && pts[i - 1] ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) : acc), '');
        if (fill && k === 0) { const first = pts.find(Boolean), last = [...pts].reverse().find(Boolean); svg('path', { d: `${d}L${last[0]} ${y(yt[0])}L${first[0]} ${y(yt[0])}Z`, fill: col, opacity: 0.12 }, g); }
        svg('path', { d, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
      });
      // hover: a rule, a dot per series and a bare tooltip
      const tip = tooltip(el), rule = svg('line', { y1: padT, y2: h - padB, stroke: css(el, '--axis-ink', '#6b6b6b'), 'stroke-width': 1, opacity: 0 }, g);
      const dots = series.map((sr, k) => svg('circle', { r: 3.5, fill: css(el, '--surface', '#fff'), stroke: sr.colour || css(el, `--chart-${k + 1}`, '#2f6fdf'), 'stroke-width': 2, opacity: 0 }, g));
      const hit = svg('rect', { x: padL, y: padT, width: w - padL, height: h - padT - padB, fill: 'transparent' }, s);
      const move = (ev) => { const r = s.getBoundingClientRect(); const px = ((ev.clientX - r.left) / r.width) * w; const i = Math.max(0, Math.min(labels.length - 1, Math.round(((px - padL) / (w - padL)) * (labels.length - 1)))); rule.setAttribute('x1', x(i)); rule.setAttribute('x2', x(i)); rule.setAttribute('opacity', 0.35); series.forEach((sr, k) => { const v = sr.values[i]; dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', v == null ? -99 : y(v)); dots[k].setAttribute('opacity', v == null ? 0 : 1); }); tip.innerHTML = `<div style="opacity:.7">${labels[i]}</div>` + series.map((sr) => `<div><b style="font-weight:600">${sr.values[i] == null ? '–' : format(sr.values[i])}</b> ${series.length > 1 ? sr.name : ''}</div>`).join(''); const left = Math.min((x(i) / w) * r.width + 12, r.width - tip.offsetWidth - 4); tip.style.left = `${Math.max(0, left)}px`; tip.style.top = '0px'; tip.style.opacity = 1; };
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerleave', () => { tip.style.opacity = 0; rule.setAttribute('opacity', 0); dots.forEach((d) => d.setAttribute('opacity', 0)); });
      const last = series[0].values.filter((v) => v != null).at(-1);
      s.setAttribute('aria-label', `${series.map((x) => x.name).join(', ')}, ${labels[0]} to ${labels.at(-1)}; latest ${last == null ? 'no data' : format(last)}`);
    };
    draw(); watch(el, draw);
  }
  function bars(el, { labels, values, format = fmt.int, height = 200, highlight = null, colour }) {
    el._fmt = format;
    const draw = () => {
      const { s, w, h } = frame(el, height);
      const yt = ticks(0, Math.max(...values), 4);
      const padL = 12 + Math.max(...yt.map((v) => String(format(v)).length)) * 7, padB = 26, padT = 8;
      const band = (w - padL) / values.length, bw = Math.max(2, band * 0.62);
      const x = (i) => padL + band * i + band / 2;
      const y = (v) => padT + (h - padT - padB) * (1 - v / yt.at(-1));
      const g = svg('g', {}, s);
      axes(g, { w, h, padL, padB, padT, yt, y, xLabels: labels, x, el });
      const main = colour || css(el, '--chart-1', '#2f6fdf'), muted = css(el, '--chart-muted', '#c9c9c9');
      values.forEach((v, i) => { const r = svg('rect', { x: x(i) - bw / 2, y: y(v), width: bw, height: Math.max(0, y(0) - y(v)), fill: highlight == null || highlight === i ? main : muted, 'shape-rendering': 'crispEdges' }, g); const t = svg('title', {}, r); t.textContent = `${labels[i]}: ${format(v)}`; });
      s.setAttribute('aria-label', `${labels.length} bars from ${labels[0]} to ${labels.at(-1)}; highest ${format(Math.max(...values))}`);
    };
    draw(); watch(el, draw);
  }
  function ring(el, { value, label, sub, size = 132, stroke = 8, colour }) {
    el.innerHTML = '';
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
    const wrap = document.createElement('div'); wrap.style.cssText = `position:relative;width:${size}px;height:${size}px`;
    const s = svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, role: 'img', 'aria-label': `${label}${sub ? ' ' + sub : ''}` }, wrap);
    svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: css(el, '--grid', '#e8e8e8'), 'stroke-width': stroke }, s);
    svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: colour || css(el, '--chart-1', '#2f6fdf'), 'stroke-width': stroke, 'stroke-dasharray': `${c * v} ${c}`, transform: `rotate(-90 ${size / 2} ${size / 2})` }, s);
    const t = document.createElement('div'); t.style.cssText = 'position:absolute;inset:0;display:grid;place-content:center;text-align:center;font-variant-numeric:tabular-nums';
    t.innerHTML = `<div style="font-size:${Math.round(size / 5.5)}px;font-weight:600;line-height:1">${label}</div>${sub ? `<div style="font-size:12px;opacity:.7;margin-top:4px">${sub}</div>` : ''}`;
    wrap.appendChild(t); el.appendChild(wrap);
  }
  function barList(el, rows, { format = fmt.int, colour } = {}) {
    el.innerHTML = '';
    const max = Math.max(...rows.map((r) => r.value)) || 1;
    const list = document.createElement('ol'); list.style.cssText = 'list-style:none;margin:0;padding:0;display:grid;gap:2px;font-variant-numeric:tabular-nums';
    for (const r of rows) {
      const li = document.createElement('li'); li.style.cssText = 'position:relative;display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:6px;isolation:isolate';
      const bar = document.createElement('span'); bar.style.cssText = `position:absolute;inset:0 auto 0 0;width:${(r.value / max) * 100}%;background:${colour || 'var(--bar-fill, color-mix(in srgb, var(--chart-1, #2f6fdf) 12%, transparent))'};border-radius:inherit;z-index:-1`;
      li.append(bar); const a = document.createElement('span'); a.textContent = r.label; const b = document.createElement('span'); b.textContent = format(r.value); b.style.fontWeight = '500';
      li.append(a, b); list.appendChild(li);
    }
    el.appendChild(list);
  }
  function watch(el, draw) { if (!('ResizeObserver' in window)) return; let w = el.clientWidth; new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; draw(); } }).observe(el); }
  window.Charts = { line, bars, ring, barList, ticks, fmt };
})();
