// ============================================
// =============== Import Modules ==============
// ============================================

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import multer from 'multer';
import fs from 'fs';
import { parseFile } from 'music-metadata';

// ============================================
// =============== Server Setup ================
// ============================================

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files (e.g., uploads)

// Set EJS (if used)
app.set("view engine", "ejs");

// ============================================
// ============== Jamendo API =================
// ============================================

const clientId = '2eeec1bc';
const apiUrl = 'https://api.jamendo.com/v3.0';

// Utility function to search songs from Jamendo
async function searchJamendoTracks(searchQuery) {
  try {
    const response = await fetch(
      `${apiUrl}/tracks/?client_id=${clientId}&name=${encodeURIComponent(searchQuery)}&format=json`
    );
    if (!response.ok) throw new Error(`Jamendo fetch failed: ${response.statusText}`);

    const data = await response.json();
    if (!data.results?.length) return [];

    return data.results.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      albumArt: track.album_image || '../placeholder.png',
      audioSrc: track.audio,
      isLocal: false
    }));
  } catch (error) {
    console.error('Jamendo search error:', error);
    return [];
  }
}

// ============================================
// ============= File Upload Setup =============
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

let localPlaylist = [];

// ============================================
// ============ Local Playlist API =============
// ============================================

// Get combined local + uploaded playlist
app.get('/api/playlist', async (req, res) => {
  try {
    const uploadsDir = path.join("public", "uploads");
    const uploadedFiles = fs.readdirSync(uploadsDir);

    const uploadedSongs = uploadedFiles.map(async (file) => {
      const filePath = path.join(uploadsDir, file);
      try {
        const metadata = await parseFile(filePath);
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: metadata.common.title || path.basename(file, path.extname(file)),
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          albumArt: '../placeholder.png?height=300&width=300',
          audioSrc: `/uploads/${file}`,
          isLocal: true
        };
      } catch {
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: path.basename(file, path.extname(file)),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          albumArt: '../placeholder.png?height=300&width=300',
          audioSrc: `/uploads/${file}`,
          isLocal: true
        };
      }
    });

    const uploadedSongsData = await Promise.all(uploadedSongs);
    const combinedPlaylist = [...localPlaylist, ...uploadedSongsData];
    res.json(combinedPlaylist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist', details: error.message });
  }
});

// ============================================
// ============ Online Search API ==============
// ============================================

app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery) return res.status(400).json({ error: 'Search query is required' });

  try {
    const onlinePlaylist = await searchJamendoTracks(searchQuery);
    res.json(onlinePlaylist);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search tracks', details: error.message });
  }
});

// ============================================
// ============= Upload Endpoint ===============
// ============================================

app.post('/api/upload', upload.single('music'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const newTrack = {
    id: Date.now().toString(),
    title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
    artist: req.body.artist || 'Unknown Artist',
    album: req.body.album || 'Unknown Album',
    albumArt: '/placeholder.svg?height=300&width=300',
    audioSrc: `/uploads/${req.file.filename}`,
    isLocal: true
  };

  localPlaylist.push(newTrack);
  res.json(newTrack);
});

// ============================================
// ========== Playlist Management API ==========
// ============================================

const playlists = {}; // Structure: { playlistName: [songObjects] }

// Create playlist
app.post('/api/createPlaylist', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Playlist name required' });

  if (!playlists[name]) playlists[name] = [];
  res.json({ message: 'Playlist created', playlists });
});

// Get all playlists
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

// Add song to playlist
app.post('/api/addToPlaylist', (req, res) => {
  const { playlistName, song } = req.body;
  if (!playlistName || !song) return res.status(400).json({ error: 'Missing fields' });
  if (!playlists[playlistName]) return res.status(404).json({ error: 'Playlist not found' });

  playlists[playlistName].push(song);
  res.json({ message: 'Song added', playlist: playlists[playlistName] });
});

// Get songs from specific playlist
app.get('/api/playlists/:name', (req, res) => {
  const name = req.params.name;
  if (!playlists[name]) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlists[name]);
});

// ============================================
// =============== Start Server ================
// ============================================

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
