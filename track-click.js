function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbz1EuI2R3g8okHbrsW4n6JpH8EZ_H189O8z02zZEh61YAAEVelb4OIwwKpL2RB_X5iN6w/exec/exec", {
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
