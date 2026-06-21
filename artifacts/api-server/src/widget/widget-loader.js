(function () {
  var script = document.currentScript || document.querySelector('script[data-token]');
  if (!script) return;
  var token = script.getAttribute('data-token');
  if (!token) { console.error('LRSTORE Widget: data-token is required'); return; }

  var base = (script.src || window.location.origin).replace(/\/widget\.js.*$/, '');

  var style = document.createElement('style');
  style.textContent = [
    '#lrstore-widget-btn { position:fixed; bottom:24px; right:24px; width:56px; height:56px; background:#1e40af; border-radius:50%; border:none; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index:9998; transition:transform 0.2s; }',
    '#lrstore-widget-btn:hover { transform:scale(1.08); }',
    '#lrstore-widget-btn svg { fill:none; stroke:#fff; stroke-width:2; }',
    '#lrstore-widget-frame { position:fixed; bottom:90px; right:24px; width:360px; height:540px; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.3); z-index:9999; display:none; border:none; transition:opacity 0.2s; }',
    '#lrstore-widget-frame.open { display:block; }',
    '@media(max-width:480px){ #lrstore-widget-frame { width:calc(100vw - 16px); height:70vh; bottom:80px; right:8px; } }'
  ].join('');
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'lrstore-widget-btn';
  btn.setAttribute('aria-label', 'Chat dengan LRSTORE');
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var iframe = document.createElement('iframe');
  iframe.id = 'lrstore-widget-frame';
  iframe.src = base + '/api/widget?token=' + encodeURIComponent(token);
  iframe.allow = 'microphone';
  iframe.title = 'LRSTORE Chat';

  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    iframe.className = open ? 'open' : '';
    btn.innerHTML = open
      ? '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  });

  document.body.appendChild(iframe);
  document.body.appendChild(btn);
})();
