/* 自绘 monoline 图标库（替代 emoji，去掉 AI/通用感）
 * 统一：24×24、描边 currentColor、stroke-width 1.7、圆角端点 —— 颜色随文字色（可跟主题色）。
 * 用法：ICONS.tent  → 一段 <svg>…</svg> 字符串。
 */
window.ICONS = (function () {
  const w = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const P = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    chat: '<path d="M4.5 5.5h15v9.5h-9l-4 3.2v-3.2h-2z"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 19.5c1.4-3.6 4.4-5 7-5s5.6 1.4 7 5"/>',
    pin: '<path d="M12 21c4.5-4.5 6.5-7.8 6.5-11A6.5 6.5 0 105.5 10c0 3.2 2 6.5 6.5 11z"/><circle cx="12" cy="9.7" r="2.3"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.6-3.6"/>',
    fire: '<path d="M12 3.5c2.8 2.6 4 4.8 4 7.5a4 4 0 11-8 0c0-1.2.4-2 1.2-2.8.3 1 .9 1.6 1.6 1.8-.4-2.4.3-4.6 1.2-6.5z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 14.4c0 1 1 1.7 2.4 1.7s2.4-.7 2.4-1.7-1-1.4-2.4-1.7-2.4-.8-2.4-1.8S10.6 9 12 9s2.4.7 2.4 1.6M12 7.7v8.6"/>',
    tent: '<path d="M12 4.5L4 19h16z"/><path d="M12 4.5v14.5M12 11l4 8M12 11l-4 8"/>',
    dice: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="12" cy="12" r="1"/>',
    mountain: '<path d="M3 19l6-10 3.5 5.5L15 11l6 8z"/>',
    mic: '<rect x="9.2" y="3.5" width="5.6" height="10" rx="2.8"/><path d="M6.5 11.5a5.5 5.5 0 0011 0M12 17v3.5M9 20.5h6"/>',
    frisbee: '<ellipse cx="12" cy="12.5" rx="8.5" ry="4"/><path d="M5 11c2.5 2 11.5 2 14 0"/>',
    bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 01-17 0z"/><path d="M9 4.5c0 1.5-1 2-1 3M13 4.5c0 1.5-1 2-1 3"/>',
    camera: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><circle cx="12" cy="13.5" r="3.2"/><path d="M8.5 7.5l1.3-2h4.4l1.3 2"/>',
    party: '<path d="M4 20l4.5-11 6.5 6.5z"/><path d="M15 5.5l.7 1.6 1.6.7-1.6.7L15 10.7l-.7-1.6L12.7 8.4l1.6-.7zM19 11.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z"/>',
    leaf: '<path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/><path d="M5 19c3.5-3.5 7-5.5 10-6.5"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 100 17c1.4 0 1.8-1 1.8-1.8 0-1.4 1-1.8 2.3-1.8h1.4a3 3 0 003-3c0-5-5-8.4-8.5-8.4z"/><circle cx="8.5" cy="11" r="1"/><circle cx="12" cy="8.5" r="1"/><circle cx="15.5" cy="11" r="1"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v5.5l-4.5 7.5a2 2 0 001.8 3h8.4a2 2 0 001.8-3l-4.5-7.5V3.5"/><path d="M8 15h8"/>',
    barn: '<path d="M4 20V9l8-4.5 8 4.5v11z"/><path d="M9.5 20v-5.5h5V20"/>',
    book: '<path d="M12 6.5C10 5 7 5 4.5 5.5v12C7 17 10 17 12 18.5 14 17 17 17 19.5 17.5v-12C17 5 14 5 12 6.5z"/><path d="M12 6.5v12"/>',
    cake: '<rect x="4.5" y="11" width="15" height="8.5" rx="2"/><path d="M4.5 14.5c2 1.4 3.5 1.4 5.5 0s3.5-1.4 5.5 0 1.5 1.2 4 0"/><path d="M12 11V7.5M12 7.5l1-1.2M12 7.5l-1-1.2"/>',
    wave: '<path d="M3 8.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 17.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
    bike: '<circle cx="6.5" cy="16.5" r="3.4"/><circle cx="17.5" cy="16.5" r="3.4"/><path d="M6.5 16.5l4-7.5h5.5l-3 7.5M10.5 9l-1.2-2.5H7"/>',
    climb: '<path d="M6.5 21V4l9.5 2.8L6.5 9.6"/>',
    palm: '<path d="M12 13v8M12 13c-3-4-7.5-2.5-8.5-.5 3-1.2 5 .3 6 2.5M12 13c3-4 7.5-2.5 8.5-.5-3-1.2-5 .3-6 2.5M5 21h14"/>',
    gift: '<rect x="4.5" y="9" width="15" height="4" rx="1"/><path d="M6 13v7h12v-7M12 9v11"/><path d="M12 9C12 6.5 10.3 5 8.8 5.6 7.3 6.2 7.8 9 12 9zM12 9c0-2.5 1.7-4 3.2-3.4C16.7 6.2 16.2 9 12 9z"/>',
    ticket: '<path d="M4 7.5h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z"/><path d="M12 7.5v9" stroke-dasharray="1.4 2.4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.8v2.4M12 17.8v2.4M5.4 7l1.7 1.7M16.9 15.3l1.7 1.7M3.8 12h2.4M17.8 12h2.4M5.4 17l1.7-1.7M16.9 8.7l1.7-1.7"/>',
    idcard: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.8 15.2c.7-1.5 4.1-1.5 5.4 0M13.5 9.5h4M13.5 12.5h4M13.5 15.3h2.6"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 18.5c1-3.2 4-4.2 5.5-4.2s4.5 1 5.5 4.2"/><path d="M15.8 6.4a3 3 0 010 5.5M16.5 14.4c2 .4 3.4 1.6 4 4.1"/>',
    map: '<path d="M9 4.5L4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  };
  const ICONS = {}; for (const k in P) ICONS[k] = w(P[k]); return ICONS;
})();
