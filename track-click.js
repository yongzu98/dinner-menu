function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycby_NDlQ42sYEMByBhcgZLIg0QTzX4wnXsGIMWnXs3cpdxSGCYU7BrrJLWUL_FuQt1M/exec", {
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
