function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbxkFlVYxY5Ol6gYFue9b3sYa09vsVsIX34qudX1o2RQGpS1wITHrwR09Mzt-A7zmFed/exec", {
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
