# 🎵 Vibe Music Player

A beautiful, responsive music player website.

## 🚀 Quick Setup (3 Steps!)

### Step 1: Add Your Songs

1. Copy all your 50 MP3 files
2. Paste them into the `songs` folder in this project
3. Name them simply: `song1.mp3`, `song2.mp3`, etc. (or keep original names)

### Step 2: Update songs.json

Edit `songs.json` and list all your songs:

```json
{
  "songs": [
    {
      "title": "Beautiful Day",
      "artist": "John Doe",
      "url": "songs/beautiful_day.mp3"
    },
    {
      "title": "Night Vibes",
      "artist": "Jane Smith",
      "url": "songs/night_vibes.mp3"
    }
  ]
}
```

Add all 50 songs with their actual filenames.

### Step 3: Push to GitHub & Deploy

```bash
git add .
git commit -m "Add music player"
git push
```

Then deploy to Netlify:
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Click "Deploy site"

**Note:** You'll need Netlify Pro tier ($19/month) since your songs folder will be 150-350 MB.

---

## 💡 FREE Alternative (Recommended)

If you want to stay on Netlify's FREE tier, use one of these:

### Option A: Cloudinary (Easiest & Free)
1. Sign up at [cloudinary.com](https://cloudinary.com) (free account)
2. Upload your 50 songs
3. Copy the URLs and paste in `songs.json`
4. Deploy to Netlify free tier ✅

### Option B: Google Drive
1. Upload songs to Google Drive
2. Make them publicly accessible
3. Get shareable links
4. Use in `songs.json`

---

## ✨ Features

- 🎵 Play/Pause controls
- ⏭️ Next/Previous track
- 📊 Progress bar with seek
- 📱 Responsive design
- 🎨 Beautiful gradient UI
- 📝 Playlist view

## 🔧 Customization

### Change Colors
Edit `style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Title
Edit `index.html`:
```html
<h1>🎵 Your Music Name</h1>
```

## 📝 License

Free to use for personal projects!
