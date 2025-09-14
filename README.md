# Stream Soundboard

A React + Tailwind CSS web application featuring a Stream Soundboard and Overlay Music Jukebox, perfect for content creators and streamers.

## Features

### 🎵 Stream Soundboard
- **Search & Filter**: Find tracks by title, mood, or genre
- **Track Cards**: Each track displays with tags, play/pause, download, and attribution copy
- **Responsive Grid**: Mobile-friendly layout that stacks nicely
- **HTML5 Audio**: Built-in audio player for previewing tracks

### 🎧 Overlay Music Jukebox
- **OBS Ready**: Designed for browser source embedding in OBS
- **Playlist Controls**: Play/pause, skip forward/backward, shuffle
- **Auto-advance**: Automatically plays next track when current ends
- **Fullscreen Design**: Clean, minimal interface perfect for overlays

### 🏢 Agency Management Features
- **Track Upload & Management**: Upload and organize music library
- **User Management**: Assign tracks to streamers and manage permissions
- **Analytics Dashboard**: Track usage and performance metrics
- **Branding Controls**: Customize colors, logos, and styling
- **Role-Based Access**: Secure agency/streamer separation

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🧪 Testing

### Unit & Integration Tests
Run the comprehensive test suite:
```bash
npm test
```

### End-to-End Tests
We use Cypress for E2E testing to simulate real user workflows:

```bash
# Install Cypress (if not already installed)
npm install

# Run E2E tests in headless mode
npm run test:e2e

# Open Cypress test runner
npm run test:e2e:open
```

#### E2E Test Coverage
- **Agency Workflows**: Track upload → assignment → analytics
- **Streamer Workflows**: Library browsing → playback → playlists
- **Branding Controls**: Color updates → logo management → CSS customization
- **Complete Manual QA**: Full workflow simulation from upload to playback
- **Error Handling**: Graceful failure scenarios
- **Responsive Design**: Cross-device compatibility
- **Performance**: Large library handling
- **Accessibility**: Keyboard navigation and screen reader support

#### Key E2E Test Scenarios
1. **Agency User**: Upload track → see it appear in EnhancedMusicLibrary → assign to streamer
2. **Streamer User**: Log in → browse library → play uploaded track
3. **Branding Controls**: Update colors/logo → verify applied across interface

## 🎵 Music Management

### Demo Mode (Default)
The app runs in **Demo Mode** by default, which means:
- ✅ **No API keys required** - Works out of the box
- ✅ **Manual uploads** - Upload your own MP3, WAV, OGG, or M4A files
- ✅ **Local storage** - Tracks are stored locally in your browser
- ✅ **Full functionality** - All features work without external services

### Manual Track Upload

1. **Supported Formats**: MP3, WAV, OGG, M4A (up to 50MB)
2. **Upload Process**:
   - Click "Upload Track" in the admin panel
   - Select your audio file
   - Fill in track metadata (title, artist, category, mood, energy)
   - Submit and your track is ready to use

3. **Track Categories**:
   - **Chill Gaming** - Relaxing background music
   - **Gaming Action** - High-energy gameplay music
   - **Stream Starting** - Intro music for streams
   - **Hype Raid** - Exciting celebration music
   - **Break/BRB** - Pleasant waiting music
   - **Talk Show** - Background conversation music
   - **Intro/Outro** - Short branding tracks
   - **Boss Battle** - Epic challenge music
   - **Intermission** - Transitional music
   - **Background Chat** - Subtle viewer interaction music

### Future AI Integration
When you're ready to add AI music generation:
1. **Add your API keys** to the `.env` file
2. **Set `REACT_APP_DEMO_MODE=false`**
3. **The app will automatically switch** to AI generation mode

## 🎨 Customization

### Adding Your Own Tracks

1. **Replace dummy audio files:**
   - Place your audio files in the `public/audio/` directory
   - Update the `audioUrl` paths in the track data

2. **Update track data:**
   - Modify the `tracks` array in `src/components/StreamSoundboard.tsx`
   - Modify the `originalPlaylist` array in `src/components/OverlayJukebox.tsx`
   - Update the attribution text with your name

3. **Customize colors:**
   - Modify the custom colors in `tailwind.config.js`
   - Update the CSS variables in `src/index.css`

### Track Data Structure

```typescript
interface Track {
  id: number;
  title: string;
  mood: string;
  genre: string;
  audioUrl: string;
  tags: string[];
}
```

### Example Track Entry

```typescript
{
  id: 1,
  title: "Your Track Title",
  mood: "epic",
  genre: "orchestral",
  audioUrl: "/audio/your-track.mp3",
  tags: ["epic", "battle", "orchestral", "intense"]
}
```

## 🛠️ Built With

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **HTML5 Audio API** - Native browser audio support

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Grid Layout**: Responsive grid that adapts to screen size
- **Touch Friendly**: Large buttons and touch targets
- **Dark Theme**: Streamer-friendly dark UI

## 🎯 OBS Integration

The Overlay Jukebox is designed specifically for OBS browser source:

1. **Add Browser Source** in OBS
2. **Set URL** to your deployed app's jukebox page
3. **Set dimensions** (recommended: 800x600 or 1920x1080)
4. **Enable audio** if you want the audio to play through OBS

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Project Structure

```
src/
├── components/
│   ├── StreamSoundboard.tsx    # Main soundboard page
│   ├── OverlayJukebox.tsx     # OBS overlay jukebox
│   └── TrackCard.tsx          # Individual track card
├── types/
│   └── track.ts               # TypeScript interfaces
├── App.tsx                    # Main app with navigation
├── index.tsx                  # App entry point
└── index.css                  # Global styles + Tailwind
```

## 🎵 Audio File Support

The app supports all audio formats supported by HTML5:
- MP3
- WAV
- OGG
- AAC
- WebM

## 🌟 Features for Streamers

- **Quick Access**: Easy navigation between soundboard and jukebox
- **Mood Filtering**: Find the perfect track for any moment
- **Attribution Copy**: One-click copy of proper attribution text
- **Download Ready**: Easy access to download tracks
- **OBS Optimized**: Clean overlay design for stream integration

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Created with ❤️ for the streaming community**










