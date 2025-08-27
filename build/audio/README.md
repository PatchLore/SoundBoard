# Audio Files for Stream Soundboard

This directory contains your audio tracks and configuration.

## File Structure

```
stream-soundboard/
├── public/
│   ├── tracks/
│   │   ├── chill-river.mp3
│   │   ├── epic-journey.mp3
│   │   └── (your other MP3 files)
│   └── tracks.json ← Track configuration
```

## How to Add Your Tracks

### 1. **Add MP3 Files**
Place your exported MP3 files in the `public/tracks/` directory:
- `chill-river.mp3`
- `epic-journey.mp3`
- `your-track-name.mp3`

### 2. **Update tracks.json**
Edit `public/tracks.json` to match your files:

```json
[
  {
    "id": 1,
    "title": "Chill River",
    "tags": ["chill", "ambient"],
    "src": "/tracks/chill-river.mp3"
  },
  {
    "id": 2,
    "title": "Epic Journey", 
    "tags": ["epic", "cinematic"],
    "src": "/tracks/epic-journey.mp3"
  }
]
```

### 3. **File Naming Convention**
- **MP3 files**: Use descriptive names like `chill-river.mp3`
- **JSON paths**: Update the `src` field to match your filename
- **Tags**: Use relevant tags for mood/genre filtering

## Track Configuration

Each track in `tracks.json` has:
- **id**: Unique identifier (1, 2, 3...)
- **title**: Display name for the track
- **tags**: Array of tags for search/filtering
- **src**: Path to the MP3 file

## Benefits of This Approach

✅ **Easy to manage** - Edit tracks without touching code  
✅ **Dynamic loading** - App automatically loads new tracks  
✅ **Flexible naming** - Use any filename you want  
✅ **No rebuilds** - Just update JSON and refresh browser  

## Testing

After updating:
1. **Refresh your browser** - tracks will load automatically
2. **Check search/filtering** - new tags will work immediately
3. **Test audio playback** - verify MP3 files load correctly

## File Format

- **MP3**: 128kbps or higher for good quality
- **JSON**: UTF-8 encoding, valid JSON syntax
- **Paths**: Always start with `/tracks/` for public access
