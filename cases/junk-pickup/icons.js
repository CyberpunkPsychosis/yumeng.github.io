/* 自绘 monoline 图标库（24×24，描边 currentColor，stroke-width 1.7）
 * 颜色随文字色，可跟主题色。用法：ICONS.trash → 一段 <svg> 字符串。
 */
window.ICONS = (function () {
  const w = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const P = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    orders: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5h6v2.5H9z"/><path d="M8.5 11h7M8.5 14.5h5"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 19.5c1.4-3.6 4.4-5 7-5s5.6 1.4 7 5"/>',
    pin: '<path d="M12 21c4.5-4.5 6.5-7.8 6.5-11A6.5 6.5 0 105.5 10c0 3.2 2 6.5 6.5 11z"/><circle cx="12" cy="9.7" r="2.3"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.6-3.6"/>',
    trash: '<path d="M5 7h14M9.5 7V5.2A1.2 1.2 0 0110.7 4h2.6a1.2 1.2 0 011.2 1.2V7"/><path d="M6.5 7l1 12.2A1.5 1.5 0 009 20.5h6a1.5 1.5 0 001.5-1.3L17.5 7"/><path d="M10 11v6M14 11v6"/>',
    bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 01-17 0z"/><path d="M9 4.5c0 1.5-1 2-1 3M13 4.5c0 1.5-1 2-1 3"/>',
    recycle: '<path d="M8 8l2-3.2a2 2 0 013.4 0L15 7"/><path d="M16.5 9l2 3.4a2 2 0 01-1.7 3H14"/><path d="M9.5 19H6.2a2 2 0 01-1.7-3L6 13"/><path d="M14 17l-2 2 2 2M8 8l-3 1 1 3M16.5 9l3-.5-.5-3"/>',
    bed: '<path d="M3.5 18v-9M3.5 13.5h17M20.5 18v-4.5a3 3 0 00-3-3h-9V13"/><path d="M3.5 16h17"/><path d="M7.5 13a1.5 1.5 0 010-3h2a1.5 1.5 0 010 3"/>',
    wardrobe: '<rect x="5.5" y="3.5" width="13" height="17" rx="1.5"/><path d="M12 3.5v17M9.7 10v2M14.3 10v2"/>',
    tv: '<rect x="3.5" y="6" width="17" height="11" rx="2"/><path d="M8.5 20.5h7M12 17v3.5"/><path d="M7 9.5h4"/>',
    table: '<path d="M3 9.5h18M5 9.5V19M19 9.5V19M8.5 9.5V6.5h7v3"/>',
    toilet: '<path d="M6 4.5h3v6H6z"/><path d="M5 10.5h11a0 0 0 010 0 6 6 0 01-5 5.9V20H8.5v-3.6A6 6 0 015 10.5z"/>',
    cat: '<path d="M5 20v-6l-1.5-4L6 11l1.5-3L9 11h6l1.5-3L18 11l2.5-1L19 14v6"/><path d="M9.5 16h.01M14.5 16h.01"/>',
    sofa: '<path d="M4 11.5V9a2 2 0 012-2h12a2 2 0 012 2v2.5"/><path d="M4 11.5a2 2 0 012 2v2H18v-2a2 2 0 012-2 2 2 0 012 2V19H2v-5.5a2 2 0 012-2z"/>',
    edit: '<path d="M5 19h3l9.4-9.4a2 2 0 00-3-3L5 16z"/><path d="M13.8 7.2l3 3"/>',
    bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
    bike: '<circle cx="6.5" cy="16.5" r="3.4"/><circle cx="17.5" cy="16.5" r="3.4"/><path d="M6.5 16.5l4-7.5h5.5l-3 7.5M10.5 9l-1.2-2.5H7"/>',
    leaf: '<path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/><path d="M5 19c3.5-3.5 7-5.5 10-6.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    ticket: '<path d="M4 7.5h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z"/><path d="M12 7.5v9" stroke-dasharray="1.4 2.4"/>',
    headset: '<path d="M5 13v-1a7 7 0 0114 0v1"/><path d="M5 13h2v5H6a1 1 0 01-1-1zM19 13h-2v5h1a1 1 0 001-1z"/><path d="M19 17v1.5a2.5 2.5 0 01-2.5 2.5H12"/>',
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4"/>',
    stairs: '<path d="M4 19h4v-4h4v-4h4V7h4"/>',
    shield: '<path d="M12 3.5l7 2.5v5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 14.4c0 1 1 1.7 2.4 1.7s2.4-.7 2.4-1.7-1-1.4-2.4-1.7-2.4-.8-2.4-1.8S10.6 9 12 9s2.4.7 2.4 1.6M12 7.7v8.6"/>',
    chat: '<path d="M4.5 5.5h15v9.5h-9l-4 3.2v-3.2h-2z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.8v2.4M12 17.8v2.4M5.4 7l1.7 1.7M16.9 15.3l1.7 1.7M3.8 12h2.4M17.8 12h2.4M5.4 17l1.7-1.7M16.9 8.7l1.7-1.7"/>',
    gift: '<rect x="4.5" y="9" width="15" height="4" rx="1"/><path d="M6 13v7h12v-7M12 9v11"/><path d="M12 9C12 6.5 10.3 5 8.8 5.6 7.3 6.2 7.8 9 12 9zM12 9c0-2.5 1.7-4 3.2-3.4C16.7 6.2 16.2 9 12 9z"/>',
    package: '<path d="M12 3.5l8 4.2v8.6L12 20.5l-8-4.2V7.7z"/><path d="M4 7.7l8 4.3 8-4.3M12 12v8.5"/>',
    star: '<path d="M12 4l2.3 4.8 5.2.7-3.8 3.7.9 5.2L12 16.9 7.4 18.4l.9-5.2-3.8-3.7 5.2-.7z"/>',
  };
  const ICONS = {}; for (const k in P) ICONS[k] = w(P[k]); return ICONS;
})();
