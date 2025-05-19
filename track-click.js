function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbwc7Y10-BHOTsAIG2pmAnxPCNEEFgK7xWXlw-ROw7TQuqYA-h9lAbQEkHG_22eFzHWweA/exec", {
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
