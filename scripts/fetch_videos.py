#!/usr/bin/env python3
"""מעדכן את data/videos.json מכל הסרטונים בערוץ.

שתי דרכים:
1. אם מוגדר משתנה הסביבה YT_API_KEY: YouTube Data API (הכי אמין).
2. אחרת: yt-dlp, בלי מפתח.
סרטונים שכבר ברשימה לא נשלפים שוב בפירוט, כך שכל ריצה מהירה.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

CHANNEL_ID = "UCCpDs06S_mfdCzTVFTah0qw"  # @HagitC_SEL_CBT
UPLOADS = "UU" + CHANNEL_ID[2:]
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "videos.json")


def load_existing():
    try:
        with open(OUT, encoding="utf-8") as f:
            return {v["id"]: v for v in json.load(f).get("videos", [])}
    except FileNotFoundError:
        return {}


def api_get(path, **params):
    params["key"] = os.environ["YT_API_KEY"]
    url = f"https://www.googleapis.com/youtube/v3/{path}?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def iso_duration(s):
    # PT1H2M3S -> seconds
    import re
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m:
        return None
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def fetch_with_api():
    ids, token = [], None
    while True:
        p = {"part": "contentDetails", "playlistId": UPLOADS, "maxResults": 50}
        if token:
            p["pageToken"] = token
        data = api_get("playlistItems", **p)
        ids += [i["contentDetails"]["videoId"] for i in data["items"]]
        token = data.get("nextPageToken")
        if not token:
            break
    videos = []
    for i in range(0, len(ids), 50):
        data = api_get("videos", part="snippet,contentDetails,status", id=",".join(ids[i:i + 50]))
        for it in data["items"]:
            if it["status"].get("privacyStatus") != "public":
                continue
            sn = it["snippet"]
            th = sn.get("thumbnails", {})
            videos.append({
                "id": it["id"],
                "title": sn["title"],
                "description": sn.get("description", ""),
                "published": sn["publishedAt"],
                "duration": iso_duration(it["contentDetails"].get("duration")),
                "tags": sn.get("tags", []),
                "thumbnail": (th.get("medium") or th.get("high") or th.get("default") or {}).get("url"),
            })
    return videos


def fetch_with_ytdlp(existing):
    import yt_dlp
    opts = {"quiet": True, "extract_flat": "in_playlist", "skip_download": True, "ignoreerrors": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        flat = ydl.extract_info(f"https://www.youtube.com/playlist?list={UPLOADS}", download=False)
    entries = [e for e in (flat or {}).get("entries") or [] if e and e.get("id")]
    if not entries:
        raise RuntimeError("yt-dlp did not return any videos")
    videos = []
    detail_opts = {"quiet": True, "skip_download": True, "ignoreerrors": True}
    fails = 0  # YouTube often blocks per-video details from CI servers; stop asking after a few failures
    with yt_dlp.YoutubeDL(detail_opts) as ydl:
        for e in entries:
            vid = e["id"]
            old = existing.get(vid)
            if old and old.get("description") is not None and old.get("published"):
                old["title"] = e.get("title") or old["title"]
                videos.append(old)
                continue
            info = {}
            if fails < 3:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False) or {}
                fails = 0 if info else fails + 1
            ud = info.get("upload_date")
            videos.append({
                "id": vid,
                "title": info.get("title") or e.get("title") or "",
                "description": info.get("description") if info else None,
                "published": f"{ud[:4]}-{ud[4:6]}-{ud[6:]}T00:00:00Z" if ud else None,
                "duration": info.get("duration") or e.get("duration"),
                "tags": info.get("tags") or [],
                "thumbnail": f"https://i.ytimg.com/vi/{vid}/mqdefault.jpg",
            })
            print("+", vid, videos[-1]["title"], file=sys.stderr)
    return videos


def selected_playlists():
    path = os.path.join(os.path.dirname(OUT), "selection.json")
    try:
        with open(path, encoding="utf-8") as f:
            pls = json.load(f).get("playlists", [])
    except FileNotFoundError:
        return []
    out = []
    for p in pls:
        p = str(p).strip()
        m = urllib.parse.parse_qs(urllib.parse.urlparse(p).query).get("list")
        out.append(m[0] if m else p)
    return [p for p in out if p]


def playlist_video_ids(pl):
    if os.environ.get("YT_API_KEY"):
        ids, token = [], None
        while True:
            p = {"part": "contentDetails", "playlistId": pl, "maxResults": 50}
            if token:
                p["pageToken"] = token
            data = api_get("playlistItems", **p)
            ids += [i["contentDetails"]["videoId"] for i in data["items"]]
            token = data.get("nextPageToken")
            if not token:
                return ids
    import yt_dlp
    with yt_dlp.YoutubeDL({"quiet": True, "extract_flat": "in_playlist", "ignoreerrors": True}) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/playlist?list={pl}", download=False) or {}
    return [e["id"] for e in info.get("entries") or [] if e and e.get("id")]


def main():
    existing = load_existing()
    videos = fetch_with_api() if os.environ.get("YT_API_KEY") else fetch_with_ytdlp(existing)
    membership = {}
    for pl in selected_playlists():
        for vid in playlist_video_ids(pl):
            membership.setdefault(vid, []).append(pl)
    for v in videos:
        v["playlists"] = membership.get(v["id"], [])
    # order: 0 = newest, by the channel's upload order (works even when dates are unavailable)
    for i, v in enumerate(videos):
        v["order"] = i
    out = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "channel": "https://www.youtube.com/@HagitC_SEL_CBT",
        "videos": videos,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"saved {len(videos)} videos", file=sys.stderr)


if __name__ == "__main__":
    main()
