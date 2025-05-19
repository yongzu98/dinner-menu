function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbxhiyG4YlVCVrVsfiBymddR8HfiOyir4UyQNLJD4E6Nd2OzJ45QlHNZQbnia4rcYDgw/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      menu: menuName,
      ua: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
