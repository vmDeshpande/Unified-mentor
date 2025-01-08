const api = {
  key: "fcc8de7015bbb202209bbf0261babf4c", // API key for OpenWeatherMap
  base: "https://api.openweathermap.org/data/2.5/" // Base URL for weather API
}

const searchbox = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');

// Event listener for search button click
searchBtn.addEventListener('click', () => {
  // Check if searchbox is empty, alert if true
  if (searchbox.value == 0) {
      alert('Please enter a city name');
      return;
  }
  getResults(searchbox.value); // Call getResults with search query
});

// Event listener for pressing enter key in searchbox
searchbox.addEventListener('keydown', (evt) => {
  // If enter key (keyCode 13) is pressed
  if (evt.keyCode == 13) {
      if (searchbox.value == 0) {
          alert('Please enter a city name');
          return;
      }
      getResults(searchbox.value); // Call getResults with search query
  }
});

// Function to fetch weather data based on city name
function getResults(query) {
  fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
      .then(weather => weather.json()) // Parse response to JSON
      .then(displayResults); // Pass the weather data to displayResults function
}

// Function to display weather data on the page
function displayResults(weather) {
  // Display city name and country
  let city = document.querySelector('.location .city');
  city.innerText = `${weather.name}, ${weather.sys.country}`;

  // Display current date
  let now = new Date();
  let date = document.querySelector('.location .date');
  date.innerText = dateBuilder(now);

  // Display current temperature
  let temp = document.querySelector('.current .temp');
  temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;

  // Display general weather condition (e.g., Clear, Rain, etc.)
  let weather_el = document.querySelector('.current .weather');
  weather_el.innerText = weather.weather[0].main;

  // Display humidity
  let humidity_el = document.querySelector('.current .humidity');
  humidity_el.innerText = `Humidity: ${weather.main.humidity}`;

  // Display min and max temperatures
  let hilow = document.querySelector('.hi-low');
  hilow.innerText = `${Math.round(weather.main.temp_min)}°c / ${Math.round(weather.main.temp_max)}°c`;

  // Display wind information
  let deg = document.querySelector('.deg');
  deg.innerText = `Wind Degree: ${weather.wind.deg}`;

  let gust = document.querySelector('.gust');
  gust.innerText = `Wind Gust: ${weather.wind.gust}`;

  let speed = document.querySelector('.speed');
  speed.innerText = `Wind Speed: ${weather.wind.speed}`;

  // Add weather icon dynamically
  let iconDiv = document.querySelector('.icon');
  iconDiv.innerHTML = ''; // Clear any previous content

  const iconCode = weather.weather[0].icon; // Get icon code from weather data
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Construct the icon URL

  // Create a container for the icon
  let iconContainer = document.createElement('div');
  iconContainer.classList.add('icon-container'); // Add class for styling

  // Create the img element for the icon
  let imgElement = document.createElement('img');
  imgElement.setAttribute('src', iconUrl); // Set the image source to the icon URL
  imgElement.setAttribute('alt', weather.weather[0].description); // Set alt text for the image

  // Optional: Set the size of the icon
  imgElement.style.width = '80px';
  imgElement.style.height = '80px';

  // Append the image to the container
  iconContainer.appendChild(imgElement);

  // Append the icon container to the icon div
  iconDiv.appendChild(iconContainer);
}

// Function to format the date
function dateBuilder(d) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let day = days[d.getDay()]; // Get the current day
  let date = d.getDate(); // Get the current date
  let month = months[d.getMonth()]; // Get the current month
  let year = d.getFullYear(); // Get the current year

  return `${day} ${date} ${month} ${year}`; // Return the formatted date
}
