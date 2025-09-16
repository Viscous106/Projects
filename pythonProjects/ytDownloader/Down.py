import yt_dlp
import os

x = input("Enter the playlist URL: ")

path = input("Enter the download path (leave empty for current directory): ")
if not path:
    path = os.getcwd()

ydl_opts = {
    'outtmpl': os.path.join(path, '%(title)s.%(ext)s'),
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    try:
        ydl.download([x])
        print("Download complete!")
    except Exception as e:
        print(f"An error occurred: {e}")