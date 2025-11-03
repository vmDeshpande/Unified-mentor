// ==========================================================
// 🎵 MUSIC PLAYER — Main Script (script.js)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // UI ELEMENTS
    // ======================================================
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

    // ======================================================
    // STATE VARIABLES
    // ======================================================
    let songs = [];
    let onlineSongs = [];
    let isOnlineSong = false;
    let currentSongIndex = 0;
    let onlineCurrentSongIndex = 0;
    let isPlaying = false;
    let audio = new Audio();

    // Playlist playback mode
    let isPlayingPlaylist = false;
    let currentPlaylistSongs = [];
    let currentPlaylistIndex = 0;

    // ======================================================
    // FETCH LOCAL PLAYLIST
    // ======================================================
    function fetchLocalPlaylist() {
        fetch('/api/playlist')
            .then(res => res.json())
            .then(data => {
                songs = data;
                renderPlaylist();
                loadSong(currentSongIndex);
            })
            .catch(err => console.error('Error fetching playlist:', err));
    }

    // ======================================================
    // SEARCH ONLINE SONGS
    // ======================================================
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return renderOnlinePlaylist([]);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            onlineSongs = await res.json();
            renderOnlinePlaylist(onlineSongs);
        } catch (err) {
            console.error('Search error:', err);
            renderOnlinePlaylist([]);
        }
    });

    // ======================================================
    // RENDER PLAYLISTS (LOCAL + ONLINE)
    // ======================================================
    function renderPlaylist() {
        playlist.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center space-x-4 p-2 rounded hover:bg-gray-800 cursor-pointer';
            li.innerHTML = `
                <img src="${song.albumArt}" alt="${song.title}" class="w-10 h-10 rounded">
                <div>
                    <p class="font-semibold">${song.title}</p>
                    <p class="text-sm text-gray-400">${song.artist}</p>
                </div>`;
            li.addEventListener('click', () => {
                isPlayingPlaylist = false;
                isOnlineSong = false;
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
            });
            playlist.appendChild(li);
        });
    }

    function renderOnlinePlaylist(filteredSongs) {
        playlistOnline.innerHTML = '';
        filteredSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center space-x-4 p-2 rounded hover:bg-gray-800 cursor-pointer';
            li.innerHTML = `
                <img src="${song.albumArt}" alt="${song.title}" class="w-10 h-10 rounded">
                <div>
                    <p class="font-semibold">${song.title}</p>
                    <p class="text-sm text-gray-400">${song.artist}</p>
                </div>`;
            li.addEventListener('click', () => {
                isPlayingPlaylist = false;
                isOnlineSong = true;
                onlineCurrentSongIndex = index;
                loadOnlineSong(onlineCurrentSongIndex);
                playSong();
            });
            playlistOnline.appendChild(li);
        });
    }

    // ======================================================
    // AUDIO SETUP & CONTROLS
    // ======================================================
    function resetAudioListeners() {
        audio.pause();
        audio.currentTime = 0;
    }

    function loadSong(index) {
        resetAudioListeners();
        const song = songs[index];
        if (!song) return;
        audio.src = song.audioSrc;
        albumArt.src = song.albumArt;
        songTitle.textContent = song.title;
        artist.textContent = `Artist: ${song.artist}`;
        album.textContent = `Album: ${song.album}`;
        audio.addEventListener('loadedmetadata', updateMetadata);
        audio.addEventListener('timeupdate', updateProgress);
    }

    function loadOnlineSong(index) {
        resetAudioListeners();
        const song = onlineSongs[index];
        if (!song) return;
        audio.src = song.audioSrc;
        albumArt.src = song.albumArt;
        songTitle.textContent = song.title;
        artist.textContent = `Artist: ${song.artist}`;
        album.textContent = `Album: ${song.album}`;
        audio.addEventListener('loadedmetadata', updateMetadata);
        audio.addEventListener('timeupdate', updateProgress);
    }

    // ======================================================
    // PLAYBACK FUNCTIONS
    // ======================================================
    function playSong() {
        isPlaying = true;
        audio.play().catch(e => console.error('Playback error:', e));
        updatePlayPauseButton();
    }

    function pauseSong() {
        isPlaying = false;
        audio.pause();
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        playPauseBtn.innerHTML = isPlaying
            ? `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/></svg>`
            : `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132z"/></svg>`;
    }

    function updateMetadata() {
        seekBar.max = audio.duration;
        duration.textContent = formatTime(audio.duration);
    }

    function updateProgress() {
        seekBar.value = audio.currentTime;
        currentTime.textContent = formatTime(audio.currentTime);
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ======================================================
    // BUTTON HANDLERS
    // ======================================================
    playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));

    prevBtn.addEventListener('click', () => {
        if (isPlayingPlaylist) {
            currentPlaylistIndex = Math.max(0, currentPlaylistIndex - 2);
            playNextFromPlaylist();
        } else if (isOnlineSong) {
            onlineCurrentSongIndex = (onlineCurrentSongIndex - 1 + onlineSongs.length) % onlineSongs.length;
            loadOnlineSong(onlineCurrentSongIndex);
            playSong();
        } else {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(currentSongIndex);
            playSong();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (isPlayingPlaylist) playNextFromPlaylist();
        else if (isOnlineSong) {
            onlineCurrentSongIndex = (onlineCurrentSongIndex + 1) % onlineSongs.length;
            loadOnlineSong(onlineCurrentSongIndex);
            playSong();
        } else {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(currentSongIndex);
            playSong();
        }
    });

    seekBar.addEventListener('input', () => (audio.currentTime = seekBar.value));
    volumeControl.addEventListener('input', () => (audio.volume = volumeControl.value / 100));
    audio.addEventListener('ended', () => (isPlayingPlaylist ? playNextFromPlaylist() : nextBtn.click()));

    // ======================================================
    // PLAYLIST PLAYBACK LOGIC
    // ======================================================
    const playPlaylistBtn = document.getElementById('play-playlist-btn');
    const playlistDropdown1 = document.getElementById('playlist-dropdown');

    playPlaylistBtn.addEventListener('click', async () => {
        const playlistName = playlistDropdown1.value;
        if (!playlistName) return alert('Select a playlist first');

        const res = await fetch(`/api/playlists/${playlistName}`);
        if (!res.ok) return alert('Failed to load playlist');

        const songs = await res.json();
        if (!songs.length) return alert('Playlist is empty');

        currentPlaylistSongs = songs;
        currentPlaylistIndex = 0;
        isPlayingPlaylist = true;
        playNextFromPlaylist();
    });

    function playNextFromPlaylist() {
        if (currentPlaylistIndex >= currentPlaylistSongs.length) {
            alert('Playlist finished!');
            isPlayingPlaylist = false;
            return;
        }

        const song = currentPlaylistSongs[currentPlaylistIndex++];
        if (!song) return playNextFromPlaylist();

        const src = song.audioSrc || song.filePath || song.src || song.url;
        if (!src) return playNextFromPlaylist();

        songTitle.textContent = song.title || 'Unknown';
        artist.textContent = song.artist || 'Unknown';
        albumArt.src = song.albumArt || './placeholder.png';

        const isOnline = src.startsWith('http');
        audio.src = isOnline ? src : src.startsWith('/') ? src : `/${src}`;
        audio.play().catch(err => console.error('Playback error:', err));
        audio.onended = () => { if (isPlayingPlaylist) playNextFromPlaylist(); };
    }

    // ======================================================
    // PLAYLIST MANAGEMENT (CREATE / ADD / VIEW)
    // ======================================================
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const playlistNameInput = document.getElementById('playlist-name');
    const playlistDropdown = document.getElementById('playlist-dropdown');
    const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
    const playlistContainer = document.getElementById('playlist-container');
    let playlists = {};

    async function fetchPlaylists() {
        try {
            const res = await fetch('/api/playlists');
            playlists = await res.json();
            updatePlaylistDropdown();
            displayPlaylists();
        } catch (err) {
            console.error('Error fetching playlists:', err);
        }
    }

    function updatePlaylistDropdown() {
        if (!playlistDropdown) return;
        playlistDropdown.innerHTML = '<option value="">Select Playlist</option>';
        Object.keys(playlists).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            playlistDropdown.appendChild(opt);
        });
    }

    createPlaylistBtn?.addEventListener('click', async () => {
        const name = playlistNameInput.value.trim();
        if (!name) return alert('Enter playlist name');
        await fetch('/api/createPlaylist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        playlistNameInput.value = '';
        fetchPlaylists();
    });

    addToPlaylistBtn?.addEventListener('click', async () => {
        const playlistName = playlistDropdown.value;
        if (!playlistName) return alert('Select a playlist first');
        const song = isOnlineSong ? onlineSongs[onlineCurrentSongIndex] : songs[currentSongIndex];
        if (!song) return alert('No song selected');
        await fetch('/api/addToPlaylist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistName, song })
        });
        alert(`Added "${song.title}" to ${playlistName}`);
        fetchPlaylists();
    });

    function displayPlaylists() {
        if (!playlistContainer) return;
        playlistContainer.innerHTML = '';
        Object.entries(playlists).forEach(([name, songs]) => {
            const div = document.createElement('div');
            div.className = 'bg-gray-800 p-4 rounded-lg mb-4';

            const title = document.createElement('h3');
            title.textContent = `🎵 ${name}`;
            title.className = 'text-green-400 font-semibold mb-2';
            div.appendChild(title);

            if (songs.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'No songs added yet.';
                p.className = 'text-gray-400 text-sm';
                div.appendChild(p);
            } else {
                const ul = document.createElement('ul');
                songs.forEach(song => {
                    const li = document.createElement('li');
                    li.textContent = `${song.title} — ${song.artist || 'Unknown'}`;
                    li.className = 'text-gray-300 text-sm';
                    ul.appendChild(li);
                });
                div.appendChild(ul);
            }
            playlistContainer.appendChild(div);
        });
    }

    // ======================================================
    // INIT
    // ======================================================
    fetchPlaylists();
    fetchLocalPlaylist();
});
