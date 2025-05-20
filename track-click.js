function trackClick(menuName, userAgent) {
  const data = {
    menu: menuName,
    ua: userAgent,
    timestamp: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/AKfycby6oyQFyU7MW9rgNOGx0YlB3BmzKUSJxRRNKMcw7g720_iyg3XPMdYpB6nisbaK6KBY/exec", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"   // 핵심 우회 포인트
    },
    body: JSON.stringify(data)
  });
}
