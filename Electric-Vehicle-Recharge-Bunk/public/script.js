document.addEventListener("DOMContentLoaded", async () => {

// Fetch and display stations in the admin panel
async function loadStations() {
  const response = await fetch('/stations');
  const stations = await response.json();

  const stationsListContainerAdmin = document.getElementById("stations-list-admin");
  if(stationsListContainerAdmin) {
    
    stationsListContainerAdmin.innerHTML = ''; // Clear previous list
  stations.forEach(station => {
      const stationCard = document.createElement("div");
      stationCard.classList.add("col-md-4", "mb-4");
      stationCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                      <div class="card-title d-flex align-items-start justify-content-between">
                        <div class="avatar flex-shrink-0">
                          <img src="../assets/img/icons/unicons/ev-station-solid-240.png" alt="chart success"
                            class="rounded" />
                        </div>
                        <div class="dropdown">
                          <button class="btn p-0" type="button" id="cardOpt3" data-bs-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="bx bx-dots-vertical-rounded"></i>
                          </button>
                          <div class="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                            <a class="dropdown-item" href="javascript:void(0);" onclick="showChargingStationPopupForAdmin('${station.name}', '${station.lat}', '${station.lng}')">Slots</a>
                            <a class="dropdown-item" href="javascript:void(0);" onclick="deleteStation('${station._id}')">Delete</a>
                          </div>
                        </div>
                      </div>
                      <h5 class="fw-semibold d-block mb-1">${station.name}</h5>
                      <span class="fw-semibold d-block mb-1">${station.location},</span><br>
                      <h4 class="card-title mb-2">${station.availability ? 'Available' : 'Occupied'}</h4>
                      <span class="d-block">Lat: ${station.lat}</span>
                      <span class="d-block">Lng: ${station.lng}</span>
                      <small class="text-success fw-semibold"><i class="bx bxs-plug"></i> ${station.types.join(", ")}</small>
                    </div>
                  </div>
      `;
      stationsListContainerAdmin.appendChild(stationCard);
  });
}
}

async function loadPickupRequests() {
  const response = await fetch('/pickupRequests');
  const requests = await response.json();

  const requestsListContainerAdmin = document.getElementById("request-list-admin");
  if(requestsListContainerAdmin) {
    
    requestsListContainerAdmin.innerHTML = ''; // Clear previous list
    requests.forEach(PickupRequests => {
      const requestCard = document.createElement("tr");
      requestCard.innerHTML = `

                            <td><i class="fab fa-angular fa-lg text-danger me-3"></i> <strong>${PickupRequests.name}</strong></td>
                            <td>${PickupRequests.email}</td>
                            <td>${PickupRequests.contact}</td>
                            <td><span class="badge bg-label-success me-1">${PickupRequests.carDetails}</span></td>
                            <td><div class="col">
                      <button
                        type="button"
                        class="btn btn-primary"
                        data-bs-toggle="tooltip"
                        data-bs-offset="0,4"
                        data-bs-placement="left"
                        data-bs-html="true"
                        title="<i class='bx bxs-note bx-xs' ></i> <span>${PickupRequests.notes}</span>"
                      >
                        Note
                      </button>
                    </div></td>
                            <td>
                              <div class="dropdown">
                                <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                  <i class="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div class="dropdown-menu">
                                  <a class="dropdown-item" target="_blank" href="${PickupRequests.location}"
                                    ><i class="bx bxs-map me-1"></i> Track</a
                                  >
                                  <a class="dropdown-item" href="javascript:void(0);" onclick="deletePickupRequest('${PickupRequests._id}')"
                                    ><i class="bx bx-trash me-1"></i> Delete</a
                                  >
                                </div>
                              </div>
                            </td>
      `;
      requestsListContainerAdmin.appendChild(requestCard);
  });
}
// Initialize tooltips for all elements with 'data-bs-toggle="tooltip"'
var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
var tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

}
  
    // Toggle Login/Logout links
    async function toggleAuthLinks() {
      const loginLink = document.getElementById("login-link");
      const registerLink = document.getElementById("register-link");
      const logoutLink = document.getElementById("logout-link");
      const controlpanellink = document.getElementById("control-panel-link");
      const userpanellink = document.getElementById("user-panel-link");
  
      if (await isUser()) {
        console.log("User logged in");
        if(loginLink) loginLink.style.display = "none";
        if(registerLink) registerLink.style.display = "none";
        if(controlpanellink) controlpanellink.style.display = "none";
        // logoutLink.style.display = "inline";
      } else if (await isAdmin()) {
        console.log("Admin logged in");
        if(loginLink) loginLink.style.display = "none";
        if(registerLink) registerLink.style.display = "none";
        if(userpanellink) userpanellink.style.display = "none";
        // controlpanellink.style.display = "inline";
        // logoutLink.style.display = "inline";
      } else {
        console.log("no one logged in");
        // loginLink.style.display = "inline";
        // registerLink.style.display = "inline";
        if(userpanellink) userpanellink.style.display = "none";
        if(controlpanellink) controlpanellink.style.display = "none";
        if(logoutLink) logoutLink.style.display = "none";
      }
    }
  
    // Logout user
    const logoutBtn = document.getElementById("logout-link");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const response = await fetch('/logout');
        const result = await response.json();
        if (result.message === "Logout successful") {
          Swal.fire({
            icon: 'success',
            title: 'Logout Successful!',
            text: 'You have been logged out.',
          }).then(() => {
            window.location.href = "/";
          });
        }
      });
    }

    const form = document.getElementById('pickup-form');
    const locationInput = document.getElementById('location');
    const locationButton = document.getElementById('get-location');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const contactInput = document.getElementById('contact');

    if(form) {
      if(await isUser()) {
        const response = await fetch("/check-auth-status");
        const data = await response.json();
        nameInput.value = data.isAuthenticated.username;
        emailInput.value = data.isAuthenticated.email;
        contactInput.value = data.isAuthenticated.contact;
         // Function to fetch the user's location
    locationButton.addEventListener('click', () => {
      if ('geolocation' in navigator) {
          locationButton.disabled = true; // Disable the button during fetching
          locationButton.innerText = 'Fetching location...';

          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  locationInput.value = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                  locationButton.innerText = 'Location Fetched';
              },
              (error) => {
                  console.error('Error fetching location:', error);
                  alert('Unable to fetch location. Please enable location services.');
                  locationButton.innerText = 'Get Location';
                  locationButton.disabled = false;
              }
          );
      } else {
          alert('Geolocation is not supported by your browser.');
      }
  });

      form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Gather form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            contact: document.getElementById('contact').value.trim(),
            email: document.getElementById('email').value.trim(),
            location: locationInput.value.trim(), // Use auto-filled location
            carDetails: document.getElementById('car-details').value.trim(),
            notes: document.getElementById('notes').value.trim()
        };

        try {
            // Send form data to the server
            const response = await fetch('/api/pickup-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Handle response
            const result = await response.json();
            if (response.ok) {
                alert('Pickup request submitted successfully!');
                form.reset(); // Clear the form after successful submission
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: `You need to login first!`,
      confirmButtonText: 'OK',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/admin/html/login.html";
      }
    });
  }
    }
  
    // Load stations on page load
    loadStations();
    loadPickupRequests();
    toggleAuthLinks();
  });
  
  function register() {
    let registrationData;
      registrationData = {
        username: document.getElementById("username").value,
        contact: document.getElementById("contact").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      };
  
    const registrationRoute = `/register/user`;
  
    fetch(registrationRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (
          data.message === "User registration successful"
        ) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `User registration successful`,
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/admin/html/login.html";
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `${data.message}`,
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `${error.message}`,
      });
      });
  }

function login() {      
    const loginData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
  
    const loginRoute = `/login/user`;
  
    fetch(loginRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
  
        if (
          data.message === "Login successful"
        ) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `User login successful`,
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/';
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `${data.message}`
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `${error.messsage}`,
      });
      });
  }
function adminlogin() {      
    const loginData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
  
    const loginRoute = `/login/admin`;
  
    fetch(loginRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
  
        if (
          data.message === "Login successful"
        ) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Admin login successful`,
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/';
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `${data.message}`
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `${error.messsage}`,
      });
      });
  }

  const stationform = document.getElementById("add-station-form");

  if(stationform){
// Handle Add Station Form Submission
document.getElementById("add-station-form").addEventListener("submit", async function (e) {
    e.preventDefault();  // Prevent default form submission behavior

    // Manually gather the form data
    const name = document.querySelector('input[name="name"]').value;
    const location = document.querySelector('input[name="location"]').value;
    const types = document.querySelector('input[name="types"]').value.split(',').map(type => type.trim());
    const availability = document.querySelector('select[name="availability"]').value === 'true';
    const lat = parseFloat(document.querySelector('input[name="lat"]').value);
    const lng = parseFloat(document.querySelector('input[name="lng"]').value);

    // Create an object to hold the form data
    const stationData = {
        name: name,
        location: location,
        types: types,
        availability: availability,
        lat: lat,
        lng: lng
    };

    // Send the data to the server via POST request
    const response = await fetch('/add-station', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Tell the server the body is in JSON format
        },
        body: JSON.stringify(stationData)  // Convert the object to a JSON string
    });

    // Parse the response from the server
    const data = await response.json();

    // Handle the response from the server
    if (data.message === "Station added successfully") {
        alert("Station added successfully!");
        // Optionally, you can clear the form after submission
        this.reset();
    } else {
        alert("Failed to add station: " + data.message);
    }
});
  }

      // Check if user is logged in
      async function isUser() {
        const response = await fetch("/check-auth-status");
        const data = await response.json();
        return data.isUser || false;
      }
  
      // Check if admin is logged in
      async function isAdmin() {
        const response = await fetch("/check-auth-status");
        const data = await response.json();
        return data.isAdmin || false;
      }

 const idmap = document.getElementById('map');
 if(idmap) {

  let map;

  function initMap() {
    // Check if the browser supports Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Create the map centered on the user's location
            map = L.map('map').setView([userLat, userLng], 12); // Zoom level set to 12

            // Add a tile layer (OpenStreetMap in this case)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add a marker at the user's location
            const userMarker = L.marker([userLat, userLng]).addTo(map);
            userMarker.bindPopup("You are here").openPopup();

            // Fetch charging stations data and add markers
            fetchStations(userLat, userLng);
        }, function(error) {
            alert("Unable to retrieve your location: " + error.message);
            // Fall back to a fixed location if geolocation fails
            const fallbackLat = 20.0118;
            const fallbackLng = 73.7902;
            initMapWithFixedLocation(fallbackLat, fallbackLng);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
        // Fallback to fixed location if geolocation is not supported
        const fallbackLat = 20.0118;
        const fallbackLng = 73.7902;
        initMapWithFixedLocation(fallbackLat, fallbackLng);
    }
}

// Fetch station data from the backend (via API)
async function fetchStations(userLat, userLng) {
    try {
        const response = await fetch('/stations');
        const stations = await response.json(); // Get the station data from the server

        // Loop through the stations and add markers to the map
        stations.forEach(station => {
             // Calculate distance to each station from user location (optional)
             const distance = getDistanceFromLatLonInKm(userLat, userLng, station.lat, station.lng);
             
            const Icon = new L.Icon({
                iconUrl: '/assets/icons/available_icon.png',  // Example green icon (replace with your image URL)
                iconSize: [40, 40], // Adjust size
                iconAnchor: [15, 15], // Anchor to center of the marker
                popupAnchor: [0, -15] // Adjust the popup position
            });

            // Create a marker for each station
            const marker = L.marker([station.lat, station.lng], { icon: Icon }).addTo(map)
            .bindPopup(`
                <h5>${station.name}</h5>
                <p><strong>Location:</strong> ${station.lat}, ${station.lng}</p>
                <p><strong>Status:</strong> ${station.availability ? 'Available' : 'Occupied'}</p>
                <p><strong>Distance from you:</strong> ${distance.toFixed(2)} km</p>
                <p><strong>Get Directions:</strong> 
                <a href="https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}" target="_blank" style="color: red; text-decoration: none;">Click Here</a>
            </p>
                <button class="btn btn-success btn-sm custom-btn" onclick="sendStationDetailsToServer('${station._id}', '${station.name}', '${station.lat}', '${station.lng}', '${distance.toFixed(2)}')">Book Now</button>
                `);
        });
    } catch (error) {
        console.error('Error fetching stations:', error);
    }
}
  
  // Initialize the map when the page loads
  document.addEventListener("DOMContentLoaded", initMap);

// Function to calculate the distance from the user's location to a station
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
}

// Fallback function to initialize the map with a fixed location
function initMapWithFixedLocation(lat, lng) {
    map = L.map('map').setView([lat, lng], 12); // Zoom level set to 12

    // Add a tile layer (OpenStreetMap in this case)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker at the fallback location
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("Fallback location").openPopup();

    // Fetch stations and add markers (same function as before)
    fetchStations(lat, lng);
}
}

// Delete Station
async function deleteStation(stationId) {
  const response = await fetch(`/delete-station/${stationId}`, { method: 'DELETE' });
  const data = await response.json();
  if (data.message === "Station deleted successfully") {
      alert('Station deleted!');
      loadStations(); // Reload the station list
  } else {
      alert('Failed to delete station: ' + data.message);
  }
}

// Delete pickup request
async function deletePickupRequest(pickupId) {
  const response = await fetch(`/delete-pickup/${pickupId}`, { method: 'DELETE' });
  const data = await response.json();
  if (data.message === "pickup request deleted successfully") {
      alert('pickup request deleted!');
      loadStations(); // Reload the station list
  } else {
      alert('Failed to delete pickup request: ' + data.message);
  }
}


async function sendStationDetailsToServer(stationId, stationName, stationLat, stationLng, distance) {
  if (await isAdmin()) {
      alert("Admins can't book stations!");
      return;
  }

  if (await isUser()) {
      try {
          // Fetch user authentication status
          const response1 = await fetch("/check-auth-status");
          const user = await response1.json();
          const userdata = user.isAuthenticated;

          // Prepare the station details for submission
          const stationDetails = {
              stationId,
              stationName,
              stationLat,
              stationLng,
              distance,
              userdata
          };

          // Store these details globally or pass them to the next function
          window.currentStationDetails = stationDetails; // Example of using a global variable

          // Show the car details popup
          Swal.fire({
              title: "Enter Car Details",
              html: `
                  <input id="carName" class="swal2-input" placeholder="Car Name">
                  <input id="carModel" class="swal2-input" placeholder="Car Model">
              `,
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: "Next",
              preConfirm: () => {
                  const carName = document.getElementById("carName").value;
                  const carModel = document.getElementById("carModel").value;

                  if (!carName || !carModel) {
                      Swal.showValidationMessage("Both Car Name and Model are required");
                      return false;
                  }

                  return { carName, carModel };
              }
          }).then(async result  => {
              if (result.isConfirmed) {
                  // Store car details globally or use them directly
                  window.currentCarName = result.value.carName;
                  window.currentCarModel = result.value.carModel;

                  // Now show the charging station slot selection popup
                  showChargingStationPopup(stationName, stationLat, stationLng);
              }
          });
      } catch (error) {
          console.error("Error:", error);
          Swal.fire({
              icon: "error",
              title: "Error!",
              text: "There was an issue with the request.",
          });
      }
  } else {
      alert("You need to log in first!");
      return;
  }
}


// Show the charging station popup
let selectedSlot = null;

function showChargingStationPopup(stationName, stationLat, stationLng) {
  Swal.fire({
      title: "Select Charging Slot",
      html: `
         <div id="charging-station-ui" class="container py-4" style="max-width: 800px;">
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP101">CP 101</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP102">CP 102</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP103">CP 103</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP104">CP 104</button>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP201">CP 201</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP202">CP 202</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP203">CP 203</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP204">CP 204</button>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP301">CP 301</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP302">CP 302</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP303">CP 303</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-info w-100 py-3 slot-btn" data-slot="CP304">CP 304</button>
                </div>
            </div>
         </div>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Cancel",
      didOpen: () => {
          // Check availability after rendering the slots
          renderSlots(stationName, stationLat, stationLng);

          // Attach event listeners to the slot buttons after the popup has opened
          document.querySelectorAll('.slot-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const selectedSlot = event.target.getAttribute('data-slot');
                submitCarDetailsWithSlot(selectedSlot);
            });
        });
      }
  });
}

function showChargingStationPopupForAdmin(stationName, stationLat, stationLng) {
  Swal.fire({
      title: "Charging Slots",
      html: `
         <div id="charging-station-ui" class="container py-4" style="max-width: 800px;">
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP101">CP 101</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP102">CP 102</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP103">CP 103</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP104">CP 104</button>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP201">CP 201</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP202">CP 202</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP203">CP 203</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP204">CP 204</button>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP301">CP 301</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP302">CP 302</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP303">CP 303</button>
                </div>
                <div class="col-3">
                    <button class="btn btn-outline-success slot-btn" data-slot="CP304">CP 304</button>
                </div>
            </div>
         </div>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Cancel",
      didOpen: () => {
          // Check availability after rendering the slots
          renderSlots(stationName, stationLat, stationLng);
      }
  });
}

async function submitCarDetailsWithSlot(selectedSlot) {
  try {
      // Collect all details
      const stationDetails = window.currentStationDetails;
      const carName = window.currentCarName;
      const carModel = window.currentCarModel;

      if (!stationDetails || !carName || !carModel) {
          Swal.fire({
              icon: 'error',
              title: 'Missing Details',
              text: 'Please complete all steps before selecting a slot.',
          });
          return;
      }

      // Prepare data for submission
      const data = {
          ...stationDetails, // Includes stationId, stationName, stationLat, stationLng, distance, userdata
          carName,
          carModel,
          slot: selectedSlot
      };

      // Send the data to the server
      const response = await fetch('/submit-booking', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log(result);

      if (result.message === "Booking saved successfully!") {
          Swal.fire({
              icon: 'success',
              title: 'Booking Confirmed',
              text: `Your booking for slot ${selectedSlot} is confirmed.`,
          });
      } else {
          Swal.fire({
              icon: 'error',
              title: 'Booking Failed',
              text: 'There was an error processing your booking.',
          });
      }
  } catch (error) {
      console.error('Error:', error);
      Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'There was an issue with the booking request.',
      });
  }
}

// This function will be called for each slot
async function renderSlots(stationName, stationLat, stationLng) {
  const slotButtons = document.querySelectorAll('.slot-btn');
  
  // Check the availability of each slot
  slotButtons.forEach((button) => {
      const slot = button.getAttribute('data-slot');
      checkSlotAvailability(stationName, stationLat, stationLng, button, slot);
  });
}

async function checkSlotAvailability(stationName, stationLat, stationLng, slotElement, slot) {
  try {
      const response = await fetch('/check-slot-availability', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stationName, stationLat, stationLng, slot })
      });

      const data = await response.json();

      if (data.booked) {
          // If slot is booked, add a "booked" indicator (cat icon)
          const bookedIndicator = document.createElement('span');
          bookedIndicator.classList.add('booked-indicator');
          slotElement.appendChild(bookedIndicator); // Add the indicator on top of the button

          // Optionally, disable the button to prevent booking
          slotElement.setAttribute('disabled', 'true');
      } else {
          // If the slot is available, remove the indicator (if any)
          const existingIndicator = slotElement.querySelector('.booked-indicator');
          if (existingIndicator) {
              existingIndicator.remove();
          }

          // Enable the button if it was disabled
          slotElement.removeAttribute('disabled');
      }
  } catch (error) {
      console.error('Error checking slot availability:', error);
  }
}

async function fetchUserBookings() {
  // Get the logged-in user's email and contact (You should get this from session or cookie)
  const response = await fetch("/check-auth-status");
  const data = await response.json();
  if(data.isUser) {
  const email = data.isAuthenticated.email;
  const contact = data.isAuthenticated.contact;

  try {
      // Make a request to the server to get the user's booked slots
      const response = await fetch(`/user-panel?email=${email}&contact=${contact}`);
      const data = await response.json();
      const bookinglist = document.getElementById('booking-list');

      if (data.message) {
          // If no bookings found or error
          if(bookinglist){
            bookinglist.innerHTML = `<p>${data.message}</p>`;
          }
      } else {
        if(bookinglist) {
// If bookings are found, display them
          const bookingListing = data.bookings.map(booking => `
              <div class="container mt-5">
    <div id="booking-list" class="mt-4">
        <!-- Each booking item will be displayed here -->
        <div class="booking-item border p-4 mb-4 rounded shadow-sm">
            <h4 class="mb-3"><i class="bi bi-house-door-fill"></i> Station: ${booking.stationName}</h4>
            <p><i class="bi bi-calendar-check"></i> <strong>Slot:</strong> ${booking.slot}</p>
            <p><i class="bi bi-car-front"></i> <strong>Car:</strong> ${booking.car.name} ${booking.car.model}</p>
            <p><i class="bi bi-calendar-day"></i> <strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
            <p><i class="bi bi-geo-alt-fill"></i> <strong>Get Directions:</strong> 
                <a href="https://www.google.com/maps/dir/?api=1&destination=${booking.stationLat},${booking.stationLng}" 
                   target="_blank" class="btn btn-outline-danger btn-sm">
                   <i class="bi bi-arrow-right-circle"></i> Click Here
                </a>
            </p>
        </div>
    </div>
</div>

          `).join('');
          bookinglist.innerHTML = bookingListing;
      }
    }
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      document.getElementById('booking-list').innerHTML = '<p>There was an issue fetching your bookings. Please try again later.</p>';
  }
}
}

async function fetchUserPickupBookings() {
  // Get the logged-in user's email and contact (You should get this from session or cookie)
  const response = await fetch("/check-auth-status");
  const data = await response.json();
  if(data.isUser) {
  const email = data.isAuthenticated.email;
  const contact = data.isAuthenticated.contact;

  try {
      // Make a request to the server to get the user's booked slots
      const response = await fetch(`/pick-up-user?email=${email}&contact=${contact}`);
      const data = await response.json();
      const PickupRequestList = document.getElementById('pickup-request-list');

      if (data.message) {
        console.log(data.message)
          // If no bookings found or error
          if(PickupRequestList){
            PickupRequestList.innerHTML = `<p>${data.message}</p>`;
          }
      } else {
        console.log(data)
        if(PickupRequestList) {
// If bookings are found, display them
          const bookingListing = data.PickupRequest.map(booking => `
              <div class="container mt-5">
    <div id="booking-list" class="mt-4">
        <!-- Each booking item will be displayed here -->
        <div class="booking-item border p-4 mb-4 rounded shadow-sm">
            <h4 class="mb-3"><i class="bi bi-person-circle"></i> Name: ${booking.name}</h4>
            <p><i class="bi bi-telephone-fill"></i> <strong>Contact:</strong> ${booking.contact}</p>
            <p><i class="bi bi-envelope-fill"></i> <strong>Email:</strong> ${booking.email}</p>
            <p><i class="bi bi-car-front-fill"></i> <strong>Car Details:</strong> ${booking.carDetails}</p>
            <p><i class="bi bi-file-earmark-text"></i> <strong>Notes:</strong> ${booking.notes}</p>
        </div>
    </div>
</div>


          `).join('');
          PickupRequestList.innerHTML = bookingListing;
      }
    }
  } catch (error) {
      console.error('Error fetching user PickUp bookings:', error);
      document.getElementById('pickup-request-list').innerHTML = '<p>There was an issue fetching your PickUp bookings. Please try again later.</p>';
  }
}
}

fetchUserPickupBookings();
fetchUserBookings();
