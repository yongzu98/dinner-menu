function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbzeodLoJ3msd0SuGdcb1FqtMBcyqiQBsKF_gbuzVr4XjMjaxSPUq9gC303pSk_8Uzlx8Q/exec", {
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
