function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/여기에_당신의_웹앱_URL/exec", {
    method: "POST",
    body: JSON.stringify({
      menu: menuName,
      timestamp: new Date().toISOString()
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
