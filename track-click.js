function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbzkHWbAcUq2OyIx0hWTnf-U-wIVFY1o05BIcE08O8SDy62FKUiIpDyv47BBKNlPDa0D/exec", { // YOUR_WEB_APP_URL 를 실제 웹 앱 URL로 변경
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      menu: menuName,
      ua: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  });
}
