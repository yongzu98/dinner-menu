function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbyvAbtppRV5BP-RDJwxGw2PyZHDzDKtOcSskwnZn6ddyfD4frL5L0LYRCcjwknk_PRopg/exec", {
    method: "POST",
    body: JSON.stringify({
      menu: menuName,
      ua: navigator.userAgent,
      timestamp: new Date().toISOString()
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
