function trackClick(menuName, userAgent) {
  const data = {
    menu: menuName,
    ua: userAgent,
    timestamp: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/AKfycbw0yXEAzAMt4UkbPevzG3sIg2Pgs1fSK1r6kzND343bhsSPdhEN95aGT6ehi47jgxYR/exec", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"   // 핵심 우회 포인트
    },
    body: JSON.stringify(data)
  });
}
