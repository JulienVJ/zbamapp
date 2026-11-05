// Compteur de zbamapp.com, sans cookies ni donnée personnelle (table site_events de Supabase) :
// une ligne par visite et par clic vers un store, avec la page, la source de la campagne
// (?s=tiktok, ?s=insta…, gardée pour la durée de l'onglet) et le type d'appareil.
// Les liens vers les stores portent data-store="ios" ou data-store="android".
// Google Play : passer à true quand l'app Android est publiée (les boutons Android deviennent actifs).
window.ZBAM_ANDROID_LIVE = true;
window.ZBAM_PLAY_URL = 'https://play.google.com/store/apps/details?id=app.zbam.mobile';
window.ZBAM_IOS_URL = 'https://apps.apple.com/fr/app/zbam/id6819425689';

(function () {
  var URL = 'https://buxcvedksdaglqbanizy.supabase.co/rest/v1/site_events';
  var KEY = 'sb_publishable_ljyMBz0zssENChzkLgzLqQ_xXux1GMY';
  var page = location.pathname.indexOf('/join') === 0 ? 'join' : 'home';
  var ua = navigator.userAgent;
  var device = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/.test(ua) ? 'android' : 'other';

  var source = null;
  try {
    var s = (new URLSearchParams(location.search).get('s') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
    if (s) sessionStorage.setItem('zbam-source', s);
    source = sessionStorage.getItem('zbam-source') || null;
  } catch (e) {}
  // Lien d'invitation entre amis : compté à part pour voir ce que rapporte le bouche-à-oreille.
  if (!source && page === 'join') source = 'invitation';

  function send(kind, store) {
    try {
      fetch(URL, {
        method: 'POST',
        keepalive: true,
        headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ kind: kind, page: page, source: source, device: device, store: store || null }),
      }).catch(function () {});
    } catch (e) {}
  }

  send('visit');

  // Lien de campagne (?s=insta, ?s=tiktok…) ouvert sur un téléphone : direction le store de l'appareil, sans passer
  // par la page (9 visiteurs de la pub sur 10 s'y arrêtaient, novembre 2026). La visite et le passage au store sont comptés
  // avant de partir. Sur ordinateur, sans source, ou avec ?reste=1 (pour vérifier la page), la page s'affiche.
  var campaign = /[?&]s=/.test(location.search) && !/[?&]reste=1/.test(location.search);
  var target = device === 'ios' ? window.ZBAM_IOS_URL : device === 'android' && window.ZBAM_ANDROID_LIVE ? window.ZBAM_PLAY_URL : null;
  if (page === 'home' && campaign && target) {
    send('store', device);
    setTimeout(function () { location.replace(target); }, 150);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-store]');
    if (a) send('store', a.getAttribute('data-store'));
  });
})();
