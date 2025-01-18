document.addEventListener("DOMContentLoaded", async () => {
    // Function to load public service list
    const userApplicationsListContainer = document.getElementById("userApplicationsList")

    // Function to get user applications
    async function getUserApplications() {
        if (userApplicationsListContainer) {
        try {
                const response = await fetch('/api/get-user-applications');
                const data = await response.json();
                const services = data.services;
            
                userApplicationsListContainer.innerHTML = '';
            
                if (data.message === "No applications found for this user") {
                    userApplicationsListContainer.innerHTML = '<p>You have not applied for any services yet.</p>';
                } else {
                    services.forEach(service => {
                        service.applications.forEach(application => {
                                const applicationDiv = document.createElement('div');
                                applicationDiv.classList.add('border', 'p-4', 'rounded-lg', 'bg-white');
                                
                                applicationDiv.innerHTML = `
                                    <p><strong>Service Name:</strong> ${service.serviceName}</p>
                                    <p><strong>Category:</strong> ${service.category}</p>
                                    <p><strong>Description:</strong> ${service.description}</p>
                                    <p><strong>Cost:</strong> ${service.cost}</p>
                                    <p><strong>Applied On:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> ${application.status}</p>
                                `;
            
                                userApplicationsListContainer.appendChild(applicationDiv);
                        });
                    });
                }
                
            } catch (error) {
                console.error('Error fetching user applications:', error);
            }
        }
    }

    // Fetch user applications when the page loads
    await getUserApplications();

    // Function to fetch applications for a specific service (admin)
    async function getApplications(serviceName) {
        try {
            const response = await fetch(`/api/get-applications/${serviceName}`);
            const data = await response.json();
            const applications = data.applications;

            const applicationsList = document.getElementById('applicationsList');
            applicationsList.innerHTML = '';

            if (applications.length === 0) {
                applicationsList.innerHTML = '<p>No applications found for this service.</p>';
            } else {
                applications.forEach(application => {
                    const applicationDiv = document.createElement('div');
                    applicationDiv.classList.add('border', 'p-4', 'rounded-lg', 'bg-white');
                    
                    applicationDiv.innerHTML = `
                        <p><strong>Username:</strong> ${application.username}</p>
                        <p><strong>Email:</strong> ${application.email}</p>
                        <p><strong>Contact:</strong> ${application.contact}</p>
                        <p><strong>Date of Birth:</strong> ${application.dob}</p>
                        <p><strong>State:</strong> ${application.state}</p>
                        <p><strong>City:</strong> ${application.city}</p>
                        <p><strong>Aadhar Number:</strong> ${application.aadhar_number}</p>
                        <p><strong>Status:</strong> ${application.status}</p>
                         <div class="mt-4">
                        <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onclick="approveApplication('${application._id}')">Approve</button>
                        <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2" onclick="rejectApplication('${application._id}')">Reject</button>
                    </div>
                    `;

                    applicationsList.appendChild(applicationDiv);
                });
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }

    // Initialize the service dropdown and fetch applications when a service is selected (admin)
    const serviceDropdown = document.getElementById('serviceDropdown');
    if(serviceDropdown){
        serviceDropdown.addEventListener('change', (event) => {
            const selectedService = event.target.value;
            if (selectedService) {
                getApplications(selectedService);
            }
        });
    }

    // Fetch the list of services when the page loads (admin)
    await getServices();
});

let servicesListings = [];

const publicServiceListContainer = document.getElementById("serviceList");

// Fetching services from the API and populating the service list
if (publicServiceListContainer) {
    publicServiceListContainer.innerHTML = ``;
    fetch("/api/get-services-listings")
        .then((response) => response.json())
        .then((data) => {
            servicesListings = data; // Store the fetched services in the array
            displayServices(servicesListings); // Function to display services initially
        })
        .catch((error) => console.error("Error fetching service listings:", error));
}

// Function to display the services
function displayServices(services) {
    publicServiceListContainer.innerHTML = ""; // Clear the previous services
    services.forEach((servicesListing) => {
        const serviceCard = document.createElement("div");
        serviceCard.classList.add("bg-white", "p-6", "rounded-lg", "shadow", "hover:shadow-lg", "transition");
        serviceCard.innerHTML = `
            <h3 class="text-lg font-semibold">${servicesListing.serviceName}</h3>
            <h2 class="font-semibold">${servicesListing.category}</h2>
            <p class="text-gray-600 mt-2">${servicesListing.description}</p>
            <p class="text-gray-600 mt-2">Cost: ${servicesListing.cost}</p>
            <p class="text-gray-600 mt-2">Availability: ${servicesListing.availability}</p>
            <button class="applyButton mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700" data-service-name="${servicesListing.serviceName}">Apply</button>
        `;
        publicServiceListContainer.appendChild(serviceCard);
    });

    // Add event listeners to apply buttons
    const applyButtons = document.querySelectorAll(".applyButton");
    applyButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const serviceName = e.target.dataset.serviceName;
            applyForService(serviceName);
        });
    });
}

// Function to filter services based on the search query
function filterServices() {
    const searchQuery = document.getElementById('serviceSearch').value.toLowerCase();
    const filteredServices = servicesListings.filter(service => {
        return service.serviceName.toLowerCase().includes(searchQuery) ||
               service.description.toLowerCase().includes(searchQuery) ||
               service.category.toLowerCase().includes(searchQuery);
    });

    displayServices(filteredServices); // Display the filtered services
}

// Function to get services
async function getServices() {
    try {
        const response = await fetch('/api/get-services-listings');
        const services = await response.json();

        const serviceDropdown = document.getElementById('serviceDropdown');
        if(serviceDropdown){
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.serviceName;
                option.textContent = service.serviceName;
                serviceDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}

// Function to approve application
async function approveApplication(applicationId) {
    try {
        const response = await fetch('/api/update-application-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, status: 'approved' })
        });

        const data = await response.json();
        console.log(data.message);
        alert(data.message);
    } catch (error) {
        console.error('Error approving application:', error);
    }
}

// Function to reject application
async function rejectApplication(applicationId) {
    try {
        const response = await fetch('/api/update-application-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, status: 'rejected' })
        });

        const data = await response.json();
        console.log(data.message);
        alert(data.message);
    } catch (error) {
        console.error('Error rejecting application:', error);
    }
}

// Toggle authentication links
toggleAuthLinks()
loadAdminServiceList()
fetchStates()

// Function to register user
function register() {
    let registrationData = {
        username: document.getElementById("username").value,
        contact: document.getElementById("contact").value,
        email: document.getElementById("email").value,
        dob: document.getElementById("dob").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        aadhar_number: document.getElementById("aadhar_number").value,
        password: document.getElementById("password").value,
    };

    const registrationRoute = `/api/register-user`;

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
            if (data.message === "User registration successful") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `User registration successful`,
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/login.html";
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

// Function to login user
function login() {
    const userType = document.getElementById("userType").value;

    const loginData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    const loginRoute = `/api/login-${userType}`;

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
                data.message === "User login successful" ||
                data.message === "Staff login successful" ||
                data.message === "Admin login successful"
            ) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `${userType} login successful`,
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

// Function to toggle authentication links
async function toggleAuthLinks() {
    const loginLink = document.getElementById("loginLink");
    const registerLink = document.getElementById("registerLink");
    const logoutButton = document.getElementById("logoutButton");
    const createService = document.getElementById("createService");
    const StaffpanelLink = document.getElementById("StaffpanelLink");
    const UserpanelLink = document.getElementById("UserpanelLink");
    const Userprofile = document.getElementById("userprofile");

    console.log("waiting for login...");

    if (loginLink || registerLink || logoutButton || StaffpanelLink || UserpanelLink || createService) {
        if (await isStaff()) {
            console.log("logged in as Staff");
            if (loginLink) loginLink.style.display = "none";
            if (registerLink) registerLink.style.display = "none";
            if (createService) createService.style.display = "none";
            if (UserpanelLink) UserpanelLink.style.display = "none";
            if (Userprofile) Userprofile.style.display = "none";
        } else if (await isUser()) {
            console.log("logged in as user");
            if (loginLink) loginLink.style.display = "none";
            if (registerLink) registerLink.style.display = "none";
            if (StaffpanelLink) StaffpanelLink.style.display = "none";
        } else if (await isAdmin()) {
            console.log("logged in as Admin");
            if (loginLink) loginLink.style.display = "none";
            if (registerLink) registerLink.style.display = "none";
            if (UserpanelLink) UserpanelLink.style.display = "none";
            if (Userprofile) Userprofile.style.display = "none";
        } else {
            console.log("no one logged in");
            if (logoutButton) logoutButton.style.display = "none";
            if (StaffpanelLink) StaffpanelLink.style.display = "none";
            if (UserpanelLink) UserpanelLink.style.display = "none";
            if (Userprofile) Userprofile.style.display = "none";
        }
    } else {
        console.log("No authentication-related elements found on this page.");
    }
}

// Functions to check user roles
async function isStaff() {
    try {
        const response = await fetch("/api/check-auth-status");
        const data = await response.json();
        return data.isStaff || false;
    } catch (error) {
        console.error("Error checking staff status:", error);
    }
}

async function isAdmin() {
    try {
        const response = await fetch("/api/check-auth-status");
        const data = await response.json();
        return data.isAdmin || false;
    } catch (error) {
        console.error("Error checking admin status:", error);
    }
}

async function isUser() {
    try {
        const response = await fetch("/api/check-auth-status");
        const data = await response.json();
        return data.isUser || false;
    } catch (error) {
        console.error("Error checking company status:", error);
        return false;
    }
}

// Event listener for logout button
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        fetch("/api/logout")
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
                window.location.href = "/login.html";
            })
            .catch((error) => console.error("Error:", error));
    });
}

// Function to create a new service
async function createService() {
    try {
        if (isAdmin()) {
            const serviceName = document.getElementById("serviceName").value;
            const description = document.getElementById("description").value;
            const cost = document.getElementById("cost").value;
            const availability = document.getElementById("availability").value;
            const category = document.getElementById("category").value;

            const postRoute = "/api/new-service";

            await fetch(postRoute, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serviceName,
                    description,
                    cost,
                    availability,
                    category,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.message === "Service created successfully") {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Service created successfully!',
                            confirmButtonText: 'OK',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = "./dashboard.html";
                            }
                        });
                    } else {
                        console.error("Not authorized");
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed!',
                            text: 'you are not authorized!',
                            confirmButtonText: 'OK',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = "../index.html";
                            }
                        });
                    }
                });
        } else {
            console.error("Not authorized");
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'you are not authorized!',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: error,
        });
        console.error("Error:", error);
    }
}

// Function to load admin service list
async function loadAdminServiceList() {
    const adminServiceListContainer = document.getElementById("adminServiceList");
    if(adminServiceListContainer){
        fetch("/api/get-services-listings")
            .then((response) => response.json())
            .then((servicesListings) => {
                adminServiceListContainer.innerHTML = '';
                servicesListings.forEach((servicesListing) => {
                    const serviceCard = document.createElement("div");
                    serviceCard.classList.add("bg-white", "p-6", "rounded-lg", "shadow", "hover:shadow-lg", "transition");
                    serviceCard.innerHTML = `
                        <h3 class="text-lg font-semibold">${servicesListing.serviceName}</h3>
                        <h2 class="font-semibold">${servicesListing.category}</h2>
                        <p class="text-gray-600 mt-2">${servicesListing.description}</p>
                        <p class="text-gray-600 mt-2">Cost: ${servicesListing.cost}</p>
                        <p class="text-gray-600 mt-2">Availability: ${servicesListing.availability}</p>
                        <button class="mt-6 inline-block bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700" onclick="deleteService('${servicesListing._id}')">Delete</button>
                        <button class="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700" onclick="editService('${servicesListing._id}')">Edit</button>
                    `;
                    adminServiceListContainer.appendChild(serviceCard);
                });
            })
            .catch((error) => console.error("Error fetching service listings:", error));
    }
}

// Function to delete a service
async function deleteService(serviceId) {
    const isAdminUser = await isAdmin();
    if (isAdminUser) {
        const response = await fetch(`/api/delete-service/${serviceId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.message === "Service deleted successfully") {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Service deleted!',
            });
            loadAdminServiceList();
        } else {
            alert('Failed to delete Service: ' + data.message);
        }
    } else {
        console.error("Not authorized");
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Only Admins can delete services!',
        });
        return;
    }
}

// Function to edit a service
async function editService(serviceId) {
    const isAdminUser = await isAdmin();
    if (isAdminUser) {
        // Fetch service data
        fetch(`/api/get-service/${serviceId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    // Populate the form fields with the current service data
                    document.getElementById("editServiceId").value = data.service._id;
                    document.getElementById("editServiceName").value = data.service.serviceName;
                    document.getElementById("editDescription").value = data.service.description;
                    document.getElementById("editCost").value = data.service.cost;
                    document.getElementById("editAvailability").value = data.service.availability;
                    document.getElementById("editCategory").value = data.service.category;

                    // Show the modal
                    document.getElementById("editServiceModal").classList.remove("hidden");
                }
            })
            .catch((error) => console.error("Error fetching service data:", error));
    } else {
        console.error("Not authorized");
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Only Admins can edit services!',
        });
        return;
    }
}

// Function to close the Edit Service Modal
function closeEditServiceModal() {
    document.getElementById("editServiceModal").classList.add("hidden");
}

// Function to submit the edited service data
function submitEditService() {
    const serviceId = document.getElementById("editServiceId").value;
    const serviceData = {
        serviceName: document.getElementById("editServiceName").value,
        description: document.getElementById("editDescription").value,
        cost: document.getElementById("editCost").value,
        availability: document.getElementById("editAvailability").value,
        category: document.getElementById("editCategory").value,
    };

    // Send updated data to the server
    fetch(`/api/update-service/${serviceId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === "Service updated successfully") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Service updated successfully!',
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        closeEditServiceModal();
                        loadAdminServiceList(); // Reload the service list to reflect changes
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Could not update service.',
                });
            }
        })
        .catch((error) => {
            console.error("Error updating service:", error);
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Error updating service.',
            });
        });
}

// Function to handle Apply button click
async function applyForService(serviceName) {
    if (await isUser()) {
        fetch("/api/apply-for-service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ serviceName }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Application submitted successfully") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: `You have successfully applied for ${serviceName}.`,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed!',
                        text: data.message || 'An error occurred while applying for the service.',
                    });
                }
            })
            .catch((error) => {
                console.error("Error applying for service:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred. Please try again later.',
                });
            });
    } else if (await isAdmin() || await isStaff()) {
        console.error("Not authorized");
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Admin/Staff cannot apply for service',
            confirmButtonText: 'OK',
        })
        return;
    } else {
        console.error("Not authorized");
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'login to apply for services.',
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "../login.html";
            }
        });
        return;
    }
}

// Fetch states and populate the dropdown
async function fetchStates() {
    fetch('/api/states')
        .then(response => response.json())
        .then(states => {
            const stateSelect = document.getElementById('state');
            if(stateSelect){
            stateSelect.innerHTML = '<option value="#">Select State</option>'; // Clear previous options

            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.name; // Store the state ID in the value
                option.textContent = state.name;
                stateSelect.appendChild(option);
            });
        }
        })
        .catch(error => {
            console.error('Error fetching states:', error);
        });
}

// Fetch cities for a selected state and populate the city dropdown
const states = document.getElementById('state')
if(states){
states.addEventListener('change', function() {
    const stateId = this.value;
    if (stateId !== '#') {
        fetchCities(stateId);
    } else {
        const citySelect = document.getElementById('city');
        citySelect.innerHTML = '<option value="#">Select City</option>'; // Reset cities dropdown
    }
});
}

// Fetch cities for a specific state
function fetchCities(stateId) {
    fetch(`/api/cities/${stateId}`)
        .then(response => response.json())
        .then(cities => {
            const citySelect = document.getElementById('city');
            citySelect.innerHTML = '<option value="#">Select City</option>'; // Clear previous options

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.name;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
        });
}

const mainProfile = document.getElementById('mainProfile')
if(mainProfile){
    if (isUser()) {
        fetch('/api/user-profile')
            .then(response => response.json())
            .then(userData => {
                console.log(userData)
                document.getElementById('profileUsername').textContent = userData.user.username;
                document.getElementById('profileEmail').textContent = userData.user.email;
                document.getElementById('profileContact').textContent = userData.user.contact;
                document.getElementById('profileDob').textContent = userData.user.dob;
                document.getElementById('profileState').textContent = userData.user.state;
                document.getElementById('profileCity').textContent = userData.user.city;
                document.getElementById('profileAadhar').textContent = userData.user.aadhar_number;
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
    }
}