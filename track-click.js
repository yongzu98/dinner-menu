function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbwW0JaG6H1FBOs92RcaR3TVSrk_kV-V4tmOjIpAbdh_kq_jdSIB6rnhzQ0Ags39BALP/exec", {
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


