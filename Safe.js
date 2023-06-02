const locationStatusElement = document.getElementById("location-status");

// Function to update the location status
function updateLocationStatus(isSafe) {
  locationStatusElement.innerText = isSafe ? "Safe Location" : "Unsafe Location";
  locationStatusElement.classList.toggle("safe", isSafe);
  locationStatusElement.classList.toggle("unsafe", !isSafe);
}

// Function to fetch data from the website
function fetchData() {
  // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint URL
  fetch('YOUR_API_ENDPOINT')
    .then(response => response.json())
    .then(data => {
      // Extract the relevant information and determine safety
      const isSafe = data.safety === 'safe';

      // Update the location status on the web page
      updateLocationStatus(isSafe);
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle error cases
    });
}

// Call the fetchData function to initiate the data retrieval
fetchData();
