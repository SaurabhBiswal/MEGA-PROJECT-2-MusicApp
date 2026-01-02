import os
import yt_dlp
import requests
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET") 
)

PLAYLIST_URL = "https://youtube.com/playlist?list=PLhEIwtJ9OeISGEwKsExcjrOLTpV9OqIQ9"
BACKEND_URL = "http://localhost:8080/api/songs/add-external"

def migrate():
    # Sabse important settings: ignoreerrors aur extract_flat
    ydl_opts = {
        "extract_flat": True, 
        "ignoreerrors": True,  # Error aane par playlist ko band mat karo
        "quiet": True,
        "no_warnings": True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        print("🚀 FAST & ROBUST MODE START! Restricted gaane apne aap skip honge...")
        try:
            # Sirf gaano ki list nikalenge bina deep checking ke
            playlist_info = ydl.extract_info(PLAYLIST_URL, download=False)
            
            if not playlist_info or 'entries' not in playlist_info:
                print("❌ Playlist load nahi ho saki.")
                return

            entries = playlist_info['entries']
            print(f"✅ Playlist loaded! Total items found: {len(entries)}. Starting process...")

            for entry in entries:
                if not entry: continue # Restricted gaane yahan skip ho jayenge
                
                title = entry.get('title')
                video_id = entry.get('id')
                url = f"https://www.youtube.com/watch?v={video_id}"
                
                print(f"🔄 Checking: {title}")
                
                try:
                    # Upload start (Yahan age restriction check phir se hoga, fail hua toh skip hoga)
                    print(f"☁️ Uploading to Cloudinary...")
                    up = cloudinary.uploader.upload(
                        url, 
                        resource_type="video",
                        folder="music_app_cloud",
                        notification_url="" # Noise kam karne ke liye
                    )
                    
                    song_data = {
                        "title": title,
                        "artist": "Various Artists",
                        "audioUrl": up["secure_url"],
                        "albumArtUrl": entry.get("thumbnails")[-1]["url"] if entry.get("thumbnails") else ""
                    }
                    
                    # Java Backend update
                    res = requests.post(BACKEND_URL, json=song_data)
                    if res.status_code == 200:
                        print(f"✅ Success: {title}")
                    else:
                        print(f"⚠️ DB Sync Failed: {res.status_code}")
                
                except Exception as upload_err:
                    print(f"⏭️ Skipping '{title}' (Age restricted or Unavailable)")
                    continue

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate()
