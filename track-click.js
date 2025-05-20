function trackClick(menuName) {
  const ua = navigator.userAgent;
  const referrer = document.referrer || "direct";
  const timestamp = new Date().toISOString();

  // 아주 간단한 모바일/데스크탑 분류 (정밀하지는 않지만 실용적)
  const deviceType = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";

  const data = {
    menu: menuName,
    ua: ua,
    referrer: referrer,
    deviceType: deviceType,
    timestamp: timestamp
  };

  fetch("https://script.google.com/macros/s/AKfycbzVJwRDmrFa0fUlLMGtkkJCAi59vzlwR81aH4QcRZIFxzKWymoNO0OVCUMHVzBo8t3a/exec", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(data)
  });
}
