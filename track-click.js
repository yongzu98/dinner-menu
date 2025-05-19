function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbxbcsQizGjHikAvChb-fHTkrFTTruWTpTzNZYdCmzf5RuajF6qFmbtUUvbX7F6Qh4ZyEA/exec", {
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
