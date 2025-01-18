// carousel.js
const apiKey = "ozEhMFHgpWf0F6liGbPwyGIPqwGiXIHcBIeMuXcAcHZxzRMg2AoGtrsK";
const heroCarouselContainer = document.querySelector(".swiper-wrapper");

const imageTexts = [
    "Empowering Rural Communities",
    "Building a Digital Future",
    "Connecting Villages Seamlessly"
];

async function fetchImages(query, perPage = 10) {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`, {
            headers: {
                Authorization: apiKey,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch images from Pexels API.");
        }

        const data = await response.json();
        return data.photos;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function getRandomSubset(array, size) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

async function populateHeroCarousel() {
    const images = await fetchImages("indianvillage", 10); // Fetch 10 images for more randomness
    const randomImages = getRandomSubset(images, 3); // Select 3 random images

    randomImages.forEach((image, index) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide relative";
        slide.innerHTML = `
            <img src="${image.src.landscape}" alt="Dynamic Image ${index + 1}" class="image-Element w-full h-[600px] object-cover">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h2 class="text-white text-3xl font-bold text-center px-6">${imageTexts[index]}</h2>
            </div>
        `;
        heroCarouselContainer.appendChild(slide);
    });

    new Swiper(".swiper-container", {
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
}

populateHeroCarousel();
