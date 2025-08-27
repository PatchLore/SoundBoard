# Track Validation Script

This script validates YouTube track IDs to identify which ones work for embedded playback in the Stream Soundboard application.

## Purpose

Many YouTube Audio Library tracks have embedding restrictions (Error 150), which prevents them from being played in embedded iframes. This script helps identify:

- ✅ **Working tracks**: YouTube IDs that can be embedded and played
- ❌ **Broken tracks**: YouTube IDs that are restricted or unavailable

## Usage

### Validate All Tracks
```bash
npm run validate-tracks
```

### Test a Single Track
```bash
npm run validate-single <youtubeId>
```

Example:
```bash
npm run validate-single jfKfPfyJRdk
```

## Output Files

The script generates two files in the `public/` directory:

- `audioLibrary-working.json` - Tracks that work for embedded playback
- `broken-tracks.json` - Tracks that are restricted or broken

## Validation Methods

### 1. Iframe Testing (Default)
- Tests each YouTube ID by attempting to access the embed URL
- Checks for error messages like "Video unavailable" or "embedding disabled"
- No API key required

### 2. YouTube Data API (Optional)
- Uses YouTube Data API for more accurate validation
- Requires `YOUTUBE_API_KEY` environment variable
- More reliable but requires API quota

To use the API method, set your YouTube API key:
```bash
export YOUTUBE_API_KEY=your_api_key_here
npm run validate-tracks
```

## Features

- **Progress Tracking**: Saves progress every 50 tracks
- **Rate Limiting**: 1-second delay between tests to avoid rate limits
- **Error Handling**: Graceful handling of network errors
- **Detailed Logging**: Shows progress and results
- **Statistics**: Provides success rate and sample tracks

## Expected Results

Based on typical YouTube Audio Library restrictions, you can expect:
- **10-30%** of tracks to work for embedding
- **70-90%** of tracks to be restricted (Error 150)

## Integration

After running the validation:

1. Update the app to use `audioLibrary-working.json` instead of the full library
2. Remove the fallback system for known working tracks
3. Keep the fallback for any remaining edge cases

## Example Output

```
Starting validation of 2304 tracks...
Using iframe testing method
Testing 1/2304: Living Voyage (_zwr8MPkWH8)
❌ Broken: Living Voyage
Testing 2/2304: News Theme (jfKfPfyJRdk)
✅ Works: News Theme
...

=== VALIDATION COMPLETE ===
✅ Working tracks: 345
❌ Broken tracks: 1959
📊 Success rate: 15.0%

✅ Sample working tracks:
  - News Theme (jfKfPfyJRdk)
  - Ambient Background (dQw4w9WgXcQ)
  - ...

❌ Sample broken tracks:
  - Living Voyage (_zwr8MPkWH8)
  - Gathering Darkness (Jx8ls-Y-Keg)
  - ...
```

## Notes

- The script takes approximately 40-60 minutes to complete (1 second per track)
- Progress is saved every 50 tracks, so you can resume if interrupted
- Consider running this during off-peak hours to avoid rate limiting

