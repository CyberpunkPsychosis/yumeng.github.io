/* 自绘 monoline 图标库（24×24，描边 currentColor，stroke-width 1.6）
 * 颜色随文字色。用法：ICONS.scan → 一段 <svg> 字符串。
 */
window.ICONS = (function () {
  const w = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const P = {
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.6-3.6"/>',
    scan: '<path d="M4 8.5v-2a2 2 0 012-2h2M16 4.5h2a2 2 0 012 2v2M20 15.5v2a2 2 0 01-2 2h-2M8 19.5H6a2 2 0 01-2-2v-2"/><path d="M4 12h16"/>',
    album: '<rect x="4" y="4.5" width="16" height="15" rx="2.5"/><path d="M4 9h16M9 4.5V9"/><circle cx="10" cy="14" r="1.6"/><path d="M6.5 18l3.4-3 2.4 2 2.6-2.6 2.6 2.8"/>',
    layers: '<path d="M12 4l8 4.3-8 4.3-8-4.3z"/><path d="M4.6 12.6L12 16.6l7.4-4"/><path d="M4.6 16.2L12 20.2l7.4-4"/>',
    user: '<circle cx="12" cy="8.2" r="3.5"/><path d="M5.2 19.5c1.4-3.5 4.3-4.9 6.8-4.9s5.4 1.4 6.8 4.9"/>',
    heart: '<path d="M12 19.6s-6.6-4.3-8.5-8.4C2.4 8.5 4.1 5.6 7 5.6c1.9 0 3.3 1 4 2.4.7-1.4 2.1-2.4 4-2.4 2.9 0 4.6 2.9 3.5 5.6-1.9 4.1-8.5 8.4-8.5 8.4z"/>',
    share: '<path d="M7 17L17 7M9.8 7H17v7.2"/>',
    phone: '<path d="M6.8 4.5c.8 0 1.6.6 1.9 1.4l.7 2c.2.7 0 1.5-.6 2l-1 .9a12.5 12.5 0 005.4 5.4l.9-1c.5-.6 1.3-.8 2-.6l2 .7c.8.3 1.4 1.1 1.4 1.9v1.4a1.9 1.9 0 01-2.1 1.9C10.5 19.7 4.3 13.5 3.5 6.6a1.9 1.9 0 011.9-2.1z"/>',
    wechat: '<path d="M4 6.5h13v8.5h-7.6L5.6 18v-3H4z"/><path d="M8.5 10h.01M12.5 10h.01"/><path d="M17 9.5h3v7h-2l-2 1.8v-1.8h-2.4"/>',
    pin: '<path d="M12 21c4.5-4.5 6.5-7.8 6.5-11A6.5 6.5 0 105.5 10c0 3.2 2 6.5 6.5 11z"/><circle cx="12" cy="9.7" r="2.3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.8v2.4M12 17.8v2.4M5.4 7l1.7 1.7M16.9 15.3l1.7 1.7M3.8 12h2.4M17.8 12h2.4M5.4 17l1.7-1.7M16.9 8.7l1.7-1.7"/>',
    camera: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><circle cx="12" cy="13.5" r="3.2"/><path d="M8.5 7.5l1.3-2h4.4l1.3 2"/>',
    video: '<rect x="3.5" y="6.5" width="12.5" height="11" rx="2"/><path d="M16 10.5l4.5-2.5v8L16 13.5"/>',
    chat: '<path d="M4.5 5.5h15v9.5h-9l-4 3.2v-3.2h-2z"/>',
    eye: '<path d="M3 12c2.5-4 6-6 9-6s6.5 2 9 6c-2.5 4-6 6-9 6s-6.5-2-9-6z"/><circle cx="12" cy="12" r="2.6"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    back: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const ICONS = {}; for (const k in P) ICONS[k] = w(P[k]);
  ICONS.heartf = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 19.6s-6.6-4.3-8.5-8.4C2.4 8.5 4.1 5.6 7 5.6c1.9 0 3.3 1 4 2.4.7-1.4 2.1-2.4 4-2.4 2.9 0 4.6 2.9 3.5 5.6-1.9 4.1-8.5 8.4-8.5 8.4z"/></svg>';
  return ICONS;
})();
