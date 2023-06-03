// Define the crime map layer
let crimeMapLayer;
let userCircle;

// Create a Leaflet map centered on Atlanta
const map = L.map("map").setView([33.7490, -84.3880], 11);

// Add the base tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById("checkBtn").addEventListener("click", function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const userLocation = L.latLng(latitude, longitude);

            // Zoom the map to the user's location
            map.setView(userLocation, 15);

            // Check if the user is in Atlanta
            const isInAtlanta = checkIfInAtlanta(latitude, longitude);

            if (!isInAtlanta) {
                document.getElementById("result").textContent = "You are not in Atlanta.";
                document.getElementById("result").classList.add("safety-not-atlanta"); // Apply the "safety-not-atlanta" class for a different color/style
                return; // Exit the function early if not in Atlanta
            }

            // Replace the URL below with the shareable link to your CSV file on Google Drive
            const spreadsheetUrl = "https://drive.google.com/file/d/19O1xFvcF_aWj7A_0-f8PHUYeZtYGjJMa/view?usp=sharing";

            // Load the CSV data using Papa Parse library
            Papa.parse(spreadsheetUrl, {
                download: true,
                header: true,
                complete: function(results) {
                    const data = results.data;

                    // Filter the data within a 2-mile radius of the user's location
                    const crimesWithinRadius = data.filter(function(crime) {
                        const crimeLatitude = parseFloat(crime.latitude);
                        const crimeLongitude = parseFloat(crime.longitude);

                        // Calculate the distance between the crime location and the user's location
                        const distance = getDistance(latitude, longitude, crimeLatitude, crimeLongitude);

                        // Check if the distance is within 2 miles (3218.69 meters)
                        return distance <= 3218.69;
                    });

                    // Determine the safety status based on the number of crimes within the radius
                    if (crimesWithinRadius.length === 0) {
                        document.getElementById("result").textContent = "You are in a safe location.";
                        document.getElementById("result").classList.add("safety-safe"); // Apply the "safety-safe" class for green color
                    } else if (crimesWithinRadius.length <= 5) {
                        document.getElementById("result").textContent = "You are in a moderately safe location.";
                        document.getElementById("result").classList.add("safety-moderate"); // Apply the "safety-moderate" class for yellow color
                    } else {
                        document.getElementById("result").textContent = "You are in an unsafe location.";
                        document.getElementById("result").classList.add("safety-unsafe"); // Apply the "safety-unsafe" class for red color
                    }

                    // Clear the crime map layer if it exists
                    if (crimeMapLayer) {
                        crimeMapLayer.clearLayers();
                    }

                    // Clear the user circle marker if it exists
                    if (userCircle) {
                        userCircle.remove();
                    }

                    // Create a layer group for the crime markers
                    crimeMapLayer = L.layerGroup().addTo(map);

                    // Add crime markers to the crime map layer
                    crimesWithinRadius.forEach(function(crime) {
                        const crimeMarker = L.marker([crime.latitude, crime.longitude]).addTo(crimeMapLayer);
                        crimeMarker.bindPopup(crime.description);
                    });

                    // Create a circle marker for the user's location
                    userCircle = L.circle([latitude, longitude], {
                        color: 'blue',
                        fillColor: 'blue',
                        fillOpacity: 0.4,
                        radius: 3218.69 // 2 miles in meters
                    }).addTo(map);
                }
            });
        });
    } else {
        console.log("Geolocation is not supported by your browser.");
    }
});

// Function to calculate the distance between two sets of coordinates using the Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the earth in kilometers
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance * 1000; // Convert to meters
}

// Function to convert degrees to radians
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

// Function to check if the user is in Atlanta based on latitude and longitude
function checkIfInAtlanta(latitude, longitude) {
    // Define the coordinates for Atlanta's boundaries
    const atlantaBoundaries = {
        north: 33.9722,
        south: 33.6306,
        east: -84.2896,
        west: -84.5518
    };

    // Check if the user's coordinates are within Atlanta's boundaries
    return (
        latitude >= atlantaBoundaries.south &&
        latitude <= atlantaBoundaries.north &&
        longitude >= atlantaBoundaries.west &&
        longitude <= atlantaBoundaries.east
    );
}