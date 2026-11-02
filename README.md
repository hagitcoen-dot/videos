# ספריית הסרטונים של חגית כהן

אתר סטטי שמרכז את כל הסרטונים מהערוץ https://www.youtube.com/@HagitC_SEL_CBT, עם חיפוש לפי מילים, סינון לפי נושאים וחומרים נלווים לכל סרטון או נושא.

## מה יש כאן
- `index.html`, `style.css`, `app.js`: האתר עצמו.
- `data/videos.json`: רשימת הסרטונים. מתמלאת ומתעדכנת אוטומטית, לא עורכים ידנית.
- `data/topics.json`: הנושאים (הכפתורים באתר) ומילות המפתח שמשייכות סרטון לנושא.
- `data/materials.json`: חומרים נלווים לפי סרטון או לפי נושא.
- `materials/`: מקום לקבצים (PDF, מצגות, דפי עבודה) שרוצים לשים ישירות באתר.
- `scripts/fetch_videos.py` ו-`.github/workflows/update-videos.yml`: עדכון יומי אוטומטי של רשימת הסרטונים.

## העלאה לאוויר עם GitHub Pages (חינם)
1. יוצרים מאגר חדש ב-GitHub ומעלים אליו את כל הקבצים בתיקייה.
2. Settings ← Pages ← Source: "Deploy from a branch", ענף `main`, תיקייה `/ (root)`.
3. Actions ← "עדכון רשימת הסרטונים" ← Run workflow. אחרי כמה דקות כל הסרטונים יופיעו באתר.
4. מומלץ: מפתח YouTube Data API (חינם, מ-Google Cloud Console) שנשמר כ-Secret בשם `YT_API_KEY` תחת Settings ← Secrets and variables ← Actions. בלי מפתח העדכון משתמש ב-yt-dlp, ויוטיוב חוסם לפעמים את השרתים של GitHub.

## אילו סרטונים מופיעים
האתר מציג רק את הסרטונים החברתיים־טיפוליים, לפי `data/selection.json`:
- `from_date`: רק סרטונים שפורסמו מהתאריך הזה והלאה (כרגע 2025-02-02).
- `playlists`: קישורים לפלייליסטים ביוטיוב. אם יש כאן משהו, יופיעו רק סרטונים מהפלייליסטים האלה (הדרך הכי מדויקת).
- `match_topics` (כרגע כבוי): כשזה `true`, יופיעו רק סרטונים ששייכים לפחות לנושא אחד מ-`topics.json`.
- `include_keywords`: אם ממלאים, רק סרטונים שאחת המילים מופיעה בהם.
- `include_ids` / `exclude_ids`: הוספה או הסתרה של סרטון מסוים, תמיד גוברים על הכללים.

## הוספת חומר לסרטון
ב-`data/materials.json`:
```json
"videos": {
  "AbCdEfGhIjK": [
    { "title": "דף עבודה: יומן מחשבות", "url": "materials/yoman-mahshavot.pdf", "type": "PDF" },
    { "title": "מצגת לשיעור", "url": "https://drive.google.com/...", "type": "מצגת" }
  ]
},
"topics": {
  "כעס": [ { "title": "כרטיסיות ויסות כעס", "url": "materials/kaas.pdf", "type": "PDF" } ]
}
```
מזהה הסרטון הוא 11 התווים שאחרי `watch?v=` בקישור ביוטיוב.

## קישורים ישירים
- לסרטון: `.../#v-<מזהה>`
- לחיפוש מוכן: `.../?q=כעס`
