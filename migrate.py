import yt_dlp
import requests

PLAYLIST_URL = "https://youtube.com/playlist?list=PLhEIwtJ9OeISGEwKsExcjrOLTpV9OqIQ9"
BACKEND_URL = "https://mega-project-2-musicapp-production.up.railway.app/api/songs/add-external"

def migrate_songs():
    ydl_opts = {"extract_flat": True, "skip_download": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        print("Extracting playlist... Ek minute ruko bhai.")
        try:
            info = ydl.extract_info(PLAYLIST_URL, download=False)
            if "entries" in info:
                for entry in info["entries"]:
                    if not entry: continue
                    song_data = {
                        "title": entry.get("title"),
                        "artist": "Various Artists",
                        "audioUrl": "https://www.youtube.com/watch?v=" + entry.get("id"),
                        "albumArtUrl": entry.get("thumbnails")[-1]["url"] if entry.get("thumbnails") else ""
                    }
                    try:
                        res = requests.post(BACKEND_URL, json=song_data)
                        if res.status_code == 200:
                            print("Synced: " + song_data["title"])
                        else:
                            print("Error " + str(res.status_code) + " for: " + song_data["title"])
                    except Exception as e:
                        print("Backend band hai? Error: " + str(e))
                        break
        except Exception as e:
            print("Playlist error: " + str(e))

if __name__ == "__main__":
    migrate_songs()
