function trackClick(menuName) {
  fetch("https://script.google.com/macros/s/AKfycbxEzXQnfzUmdBzGDaj_U-VFm2XRAclEwthP1bTFJIk36K3Ra6jiBpekPvlKIFItD6dg/exec", {
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
