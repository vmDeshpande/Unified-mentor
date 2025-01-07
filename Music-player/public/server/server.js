import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import multer from 'multer';
import fs from 'fs';
import { parseFile } from 'music-metadata';

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded music)
app.use(express.static("public"));

// Set EJS as the view engine (if used for rendering views)
app.set("view engine", "ejs");

// Jamendo API credentials
const clientId = '2eeec1bc';
const apiUrl = 'https://api.jamendo.com/v3.0';

// Configure multer for file uploads (save in 'public/uploads')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename with timestamp
  }
});

const upload = multer({ storage: storage });

let localPlaylist = [];

// Function to search for songs by title from Jamendo API
async function searchJamendoTracks(searchQuery) {
    try {
      const response = await fetch(`${apiUrl}/tracks/?client_id=${clientId}&name=${encodeURIComponent(searchQuery)}&format=json`);
      if (!response.ok) {
        throw new Error(`Error searching for tracks: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Return the tracks in a formatted way
        return data.results.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artist_name,
          album: track.album_name,
          albumArt: track.album_image || '../placeholder.png',
          audioSrc: track.audio, 
          isLocal: false
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching for tracks from Jamendo:', error);
      return [];
    }
}

// API endpoint to fetch combined playlist (Jamendo + uploads)
app.get('/api/playlist', async (req, res) => {
    try {  
      // Fetch uploaded songs from local storage and extract metadata
      const uploadsDir = path.join("public", "uploads");
      const uploadedSongs = fs.readdirSync(uploadsDir).map(async (file) => {
        const filePath = path.join(uploadsDir, file);
        try {
          // Extract metadata from local music files
          const metadata = await parseFile(filePath);

          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Unique ID
            title: metadata.common.title || path.basename(file, path.extname(file)), // Fallback to filename if no title
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            albumArt: '../placeholder.png?height=300&width=300', // Fallback for album art
            audioSrc: `/uploads/${file}`,
            isLocal: true
          };
        } catch (error) {
          console.error(`Error reading metadata for ${file}:`, error);
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Unique ID
            title: path.basename(file, path.extname(file)),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            albumArt: '../placeholder.png?height=300&width=300', // Fallback for album art
            audioSrc: `/uploads/${file}`,
            isLocal: true
          };
        }
      });

      // Wait for all metadata promises to resolve
      const uploadedSongsData = await Promise.all(uploadedSongs);
      const combinedPlaylist = [...localPlaylist, ...uploadedSongsData]; // Combine local and uploaded songs
      res.json(combinedPlaylist);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      res.status(500).json({ error: 'Failed to fetch playlist', details: error.message });
    }
});

// API endpoint to search for songs from Jamendo
app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Fetch search results from Jamendo API
    const onlinePlaylist = await searchJamendoTracks(searchQuery);
    res.json(onlinePlaylist); // Return the search results as a JSON response
  } catch (error) {
    console.error('Error searching for playlist:', error);
    res.status(500).json({ error: 'Failed to search for tracks', details: error.message });
  }
});

// API endpoint to upload a local music file
app.post('/api/upload', upload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const newTrack = {
    id: Date.now().toString(),
    title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
    artist: req.body.artist || 'Unknown Artist',
    album: req.body.album || 'Unknown Album',
    albumArt: '/placeholder.svg?height=300&width=300',
    audioSrc: `/uploads/${req.file.filename}`,
    isLocal: true
  };

  localPlaylist.push(newTrack); // Add new track to local playlist
  res.json(newTrack); // Respond with the newly uploaded track
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
