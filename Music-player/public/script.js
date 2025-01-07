document.addEventListener('DOMContentLoaded', () => {
    // UI elements
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const seekBar = document.getElementById('seek-bar');
    const volumeControl = document.getElementById('volume-control');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const playlist = document.getElementById('playlist');
    const playlistOnline = document.getElementById('playlist-online');
    const albumArt = document.getElementById('album-art');
    const songTitle = document.getElementById('song-title');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const searchInput = document.getElementById('search-input');

    let currentSongIndex = 0; // Index for local playlist
    let onlineCurrentSongIndex = 0; // Index for online playlist
    let isPlaying = false;
    let isOnlineSong = false; // Flag to check if the current song is from online playlist
    let songs = []; // Local playlist
    let onlineSongs = []; // Online playlist
    let audio = new Audio(); // Audio player

    // Fetch the playlist data
    function fetchPlaylist() {
        fetch('/api/playlist')
            .then(response => response.json())
            .then(data => {
                songs = data; // Store local playlist
                renderPlaylist();
                loadSong(currentSongIndex); // Load first song by default
            })
            .catch(error => console.error('Error fetching playlist:', error));
    }

    // Handle search input
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            renderOnlinePlaylist([]); // Clear the online playlist if search is empty
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            onlineSongs = await response.json(); // Store online playlist
            renderOnlinePlaylist(onlineSongs);
        } catch (error) {
            console.error('Error fetching search results:', error);
            renderOnlinePlaylist([]); // Clear playlist on error
        }
    });

    // Render the local playlist
    function renderPlaylist() {
        playlist.innerHTML = ''; // Clear existing list
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center space-x-4 p-2 rounded hover:bg-gray-800 cursor-pointer';
            li.innerHTML = `
                <img src="${song.albumArt}" alt="${song.title}" class="w-10 h-10 rounded">
                <div>
                    <p class="font-semibold">${song.title}</p>
                    <p class="text-sm text-gray-400">${song.artist}</p>
                </div>
            `;
            li.addEventListener('click', () => {
                currentSongIndex = index;
                isOnlineSong = false; // Mark as local song
                loadSong(currentSongIndex);
                playSong();
            });
            playlist.appendChild(li);
        });
    }

    // Render the online playlist
    function renderOnlinePlaylist(filteredSongs) {
        playlistOnline.innerHTML = ''; // Clear existing list
        filteredSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center space-x-4 p-2 rounded hover:bg-gray-800 cursor-pointer';
            li.innerHTML = `
                <img src="${song.albumArt}" alt="${song.title}" class="w-10 h-10 rounded">
                <div>
                    <p class="font-semibold">${song.title}</p>
                    <p class="text-sm text-gray-400">${song.artist}</p>
                </div>
            `;
            li.addEventListener('click', () => {
                onlineCurrentSongIndex = index;
                isOnlineSong = true; // Mark as online song
                loadOnlineSong(onlineCurrentSongIndex);
                playSong();
            });
            playlistOnline.appendChild(li);
        });
    }

    // Reset audio player state
    function resetAudioListeners() {
        audio.pause();
        audio.currentTime = 0;
    }

    // Load the selected song (local)
    function loadSong(index) {
        resetAudioListeners();
        const song = songs[index];
        audio.src = song.audioSrc;
        albumArt.src = song.albumArt;
        songTitle.textContent = song.title;
        artist.textContent = `Artist: ${song.artist}`;
        album.textContent = `Album: ${song.album}`;
        audio.addEventListener('loadedmetadata', updateMetadata);
        audio.addEventListener('timeupdate', updateProgress);
    }

    // Load the selected song (online)
    function loadOnlineSong(index) {
        resetAudioListeners();
        const song = onlineSongs[index];
        audio.src = song.audioSrc;
        albumArt.src = song.albumArt;
        songTitle.textContent = song.title;
        artist.textContent = `Artist: ${song.artist}`;
        album.textContent = `Album: ${song.album}`;
        audio.addEventListener('loadedmetadata', updateMetadata);
        audio.addEventListener('timeupdate', updateProgress);
    }

    // Play the current song
    function playSong() {
        isPlaying = true;
        resetAudioListeners();
        audio.currentTime = 0;
        audio.play().catch((error) => {
            if (error.name !== 'AbortError') {
                alert("Do not change songs too quickly");
                console.error('Error playing audio:', error);
            }
        });
        updatePlayPauseButton();
    }

    // Pause the current song
    function pauseSong() {
        isPlaying = false;
        audio.pause();
        updatePlayPauseButton();
    }

    // Update metadata (duration)
    function updateMetadata() {
        seekBar.max = audio.duration;
        duration.textContent = formatTime(audio.duration);
    }

    // Update play/pause button state
    function updatePlayPauseButton() {
        playPauseBtn.innerHTML = isPlaying
            ? `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
            : `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    // Update the progress bar
    function updateProgress() {
        seekBar.value = audio.currentTime;
        currentTime.textContent = formatTime(audio.currentTime);
    }

    // Format time (in minutes:seconds)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Event listeners for controls
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (isOnlineSong) {
            onlineCurrentSongIndex = (onlineCurrentSongIndex - 1 + onlineSongs.length) % onlineSongs.length;
            loadOnlineSong(onlineCurrentSongIndex);
        } else {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(currentSongIndex);
        }
        playSong();
    });

    nextBtn.addEventListener('click', () => {
        if (isOnlineSong) {
            onlineCurrentSongIndex = (onlineCurrentSongIndex + 1) % onlineSongs.length;
            loadOnlineSong(onlineCurrentSongIndex);
        } else {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(currentSongIndex);
        }
        playSong();
    });

    seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
    });

    volumeControl.addEventListener('input', () => {
        audio.volume = volumeControl.value / 100;
    });

    // Auto-play next song when current song ends
    audio.addEventListener('ended', () => {
        if (isOnlineSong) {
            nextBtn.click(); // Play the next online song
        } else {
            nextBtn.click(); // Play the next local song
        }
    });

    fetchPlaylist(); // Fetch playlist on load
});
