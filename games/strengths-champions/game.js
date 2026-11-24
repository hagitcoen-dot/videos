/* אספני החוזקות: מסע האלופים. גרסת ביניים ליסודי (ב'-ה'). האיורים מ"רביעיות חוזקות" של חגית כהן.
   טקסט עם {זכר|נקבה} מוצג לפי הדמות שנבחרה בפתיחה. */
(function () {
  "use strict";
  var GUIDE = "kit/guide.svg";
  var C = { wis: "#cfe98a", cou: "#f6e27f", hum: "#f8cdb4", jus: "#ddc9ef", tem: "#bfe7dc", tra: "#c7dcf6" };
  /* n שם (כמו בקלפים), f משפחה, t משפט קצר (אפשר לקרוא אחרי "ראיתי שאתה"), m שלוש משימות */
  var S = [
    { n: "סקרנות", f: "wis", t: "{שואל|שואלת} שאלות ורוצה לגלות עוד.",
      m: ["לשאול שאלה אחת שמעניינת אותי ולחפש לה תשובה.", "לגלות איך עובד משהו בבית (בזהירות ובאישור).", "לשאול מישהו במשפחה על משהו שהוא אוהב."] },
    { n: "אהבת למידה", f: "wis", t: "{נהנה|נהנית} ללמוד דברים חדשים, גם כשלא חייבים.",
      m: ["ללמוד עובדה חדשה ולספר אותה בארוחת ערב.", "לבחור נושא שמעניין אותי ולקרוא עליו עמוד אחד.", "ללמד מישהו בבית משהו שלמדתי."] },
    { n: "התלהבות", f: "cou", t: "{עושה|עושה} דברים במרץ ובשמחה, {ומדביק|ומדביקה} אחרים.",
      m: ["לעשות משימה אחת במלוא המרץ, עם מוזיקה!", "לכתוב בערב דבר אחד שאני מחכה לו מחר.", "להציע לחברים משחק חדש בהפסקה."] },
    { n: "נקודת מבט רחבה", f: "wis", t: "{רואה|רואה} את התמונה הגדולה {ונותן|ונותנת} עצות טובות.",
      m: ["כשמשהו מעצבן אותי, לשאול: איך זה ייראה בעוד שבוע?", "להקשיב לחבר עם בעיה, ורק אז לתת עצה.", "לחשוב על ויכוח מהצד של השני."] },
    { n: "תבונה מעשית", f: "wis", t: "{מוצא|מוצאת} דרכים חדשות ליצור ולפתור בעיות.",
      m: ["לבנות משהו חדש מחפצים שיש בבית.", "למצוא שלוש דרכים שונות לפתור בעיה קטנה.", "להמציא כלל חדש למשחק שאני מכיר{|ה}."] },
    { n: "הבנה חברתית", f: "hum", t: "{שם|שמה} לב מה אחרים מרגישים, {ויודע|ויודעת} איך להגיב.",
      m: ["לנחש מה מרגיש מישהו לידי, ולשאול אם צדקתי.", "לשים לב למי שלבד בהפסקה, ולהזמין אותו.", "להצטרף למשחק של ילדים שאני פחות מכיר{|ה}."] },
    { n: "אהבה", f: "hum", t: "{מראה|מראה} אהבה במילים ובמעשים, {ויודע|ויודעת} לקבל אהבה.",
      m: ["להגיד למישהו שאני אוהב{|ת} משפט אחד של אהבה.", "לתת חיבוק למישהו במשפחה בלי סיבה.", "להכין הפתעה קטנה למישהו שחשוב לי."] },
    { n: "טוב לב", f: "hum", t: "{עוזר|עוזרת} לאחרים בלי לבקש משהו בחזרה.",
      m: ["לעשות מעשה טוב אחד, בלי שמבקשים ממני.", "לעזור בבית במשהו קטן, בהפתעה.", "לשתף מישהו במשהו שלי."] },
    { n: "גמישות מחשבתית", f: "wis", t: "{מקשיב|מקשיבה} לרעיונות אחרים {ומוכן|ומוכנה} לשנות דעה.",
      m: ["כשמישהו חושב אחרת, להקשיב עד הסוף ולהגיד מה הבנתי.", "ללכת הביתה בדרך אחרת מהרגיל.", "לנסות רעיון של חבר, גם אם חשבתי על משהו אחר."] },
    { n: "תעוזה", f: "cou", t: "{עושה|עושה} את מה שנכון, גם כשמפחיד.",
      m: ["לעשות צעד קטן שקצת מפחיד אותי: להרים יד או לשאול שאלה.", "להגיד בנימוס את הדעה שלי, גם כשהיא שונה.", "לנסות משהו חדש שעוד לא ניסיתי."] },
    { n: "התמדה", f: "cou", t: "{ממשיך|ממשיכה} לנסות גם כשקשה.",
      m: ["להתאמן 5 דקות כל יום על משהו שקשה לי.", "כשמשהו לא מצליח, לנסות עוד פעם אחת.", "לסיים משימה שהתחלתי ועזבתי."] },
    { n: "כנות", f: "cou", t: "{אומר|אומרת} את האמת {ולוקח|ולוקחת} אחריות על טעויות.",
      m: ["כשאני טועה, להגיד \"טעיתי\" ולתקן.", "להגיד את האמת בעדינות, גם כשזה לא נעים.", "להודות במשהו קטן שעשיתי ולא סיפרתי."] },
    { n: "הוגנות", f: "jus", t: "{דואג|דואגת} שכולם יקבלו יחס שווה, לא רק החברים הקרובים.",
      m: ["כשמחלקים משהו, לדאוג שכל אחד יקבל חלק שווה.", "לשמור על כללי המשחק גם כשאף אחד לא רואה.", "לתת תור גם למי שעוד לא קיבל."] },
    { n: "עבודת צוות", f: "jus", t: "{עובד|עובדת} טוב עם אחרים, וביחד מצליחים.",
      m: ["לעשות משימה עם מישהו מהמשפחה ולחלק תפקידים.", "בעבודה בקבוצה, לשאול את מי שעוד לא דיבר מה הוא חושב.", "לעזור לחבר בקבוצה לסיים את החלק שלו."] },
    { n: "שיקול דעת", f: "tem", t: "{חושב|חושבת} לפני {שמחליט|שמחליטה}, {ובודק|ובודקת} שזה בטוח.",
      m: ["לפני החלטה, לחשוב על שני \"בעד\" ושני \"נגד\".", "לארגן בערב את התיק למחר ולבדוק שלא שכחתי כלום.", "לעצור רגע לפני שאני עונה{|} ולחשוב."] },
    { n: "צניעות", f: "tem", t: "{שמח|שמחה} בהצלחות בלי להתרברב.",
      m: ["כשאני מצליח{|ה}, להגיד תודה גם למי שעזר לי.", "כשמעירים לי, להקשיב עד הסוף.", "לפרגן לחבר על הצלחה שלו."] },
    { n: "מנהיגות", f: "jus", t: "{מוביל|מובילה} את הקבוצה בדרך נעימה {ודואג|ודואגת} שכולם יהיו חלק.",
      m: ["להציע משחק בהפסקה ולדאוג שכולם ירגישו חלק.", "ללמד ילד צעיר ממני משהו שאני יודע{|ת}.", "להציע לקבוצה דרך הוגנת להחליט."] },
    { n: "שליטה עצמית", f: "tem", t: "{עוצר|עוצרת}, {מחכה|מחכה} {ובוחר|ובוחרת} איך להגיב.",
      m: ["כשאני כועס{|ת}, לנשום 3 נשימות לפני שאני מגיב{|ה}.", "כשאני רוצה משהו מיד, לספור עד 10.", "לסיים שיעורי בית לפני המסך."] },
    { n: "הערכה ליופי ומצוינות", f: "tra", t: "{שם|שמה} לב ליופי בטבע, באנשים ובדברים מיוחדים.",
      m: ["למצוא דבר יפה אחד בדרך ולצלם או לצייר אותו.", "להגיד למישהו מה יפה במשהו שהוא עשה.", "להקשיב לשיר שאני אוהב{|ת} בעיניים עצומות."] },
    { n: "הכרת תודה", f: "tra", t: "{שם|שמה} לב לטוב {ואומר|ואומרת} תודה.",
      m: ["לכתוב לפני השינה שלושה דברים טובים שקרו לי.", "לכתוב פתק תודה למישהו שעזר לי.", "להגיד תודה למישהו שבדרך כלל לא מודים לו."] },
    { n: "תקווה", f: "tra", t: "{מאמין|מאמינה} שדברים יכולים להשתפר, {ופועל|ופועלת} בשביל זה.",
      m: ["כשמשהו לא הולך, לשאול: מה צעד קטן אחד שיעזור?", "לצייר משהו טוב שאני מחכה{|} לו.", "לכתוב מטרה קטנה לשבוע הזה."] },
    { n: "אמונה", f: "tra", t: "{מאמין|מאמינה} במשהו גדול שנותן כוח בזמנים קשים.",
      m: ["לכתוב משפט שנותן לי כוח, ולהגיד אותו לפני משהו קשה.", "לבחור מבוגר שאני סומך{|ת} עליו, ולספר לו כשקשה לי.", "לחשוב מה חשוב לי באמת, ולספר למישהו."] },
    { n: "סלחנות", f: "tem", t: "{נותן|נותנת} הזדמנות נוספת למי שטעה וביקש סליחה.",
      m: ["כשמישהו מתנצל, לחשוב אם אני מוכן{|ה} לסלוח. מותר לקחת זמן.", "כשאני טועה, להגיד לעצמי: כולם טועים לפעמים.", "לתת הזדמנות נוספת למישהו שביקש סליחה."] },
    { n: "הומור", f: "tra", t: "{מצחיק|מצחיקה} {ומשמח|ומשמחת}, גם כשיש מתח.",
      m: ["לספר בדיחה שלא פוגעת באף אחד.", "כשמשהו משתבש, למצוא בו צד מצחיק אחד.", "לעשות פרצוף מצחיק למישהו עצוב."] }
  ];
  S.forEach(function (s, i) { s.c = C[s.f]; s.src = "art/s" + (i < 9 ? "0" : "") + (i + 1) + ".webp"; });
  function idx(n) { for (var i = 0; i < S.length; i++) if (S[i].n === n) return i; throw n; }

  /* סיפורי בלש: a = החוזקה, no = חוזקות קרובות מדי שלא יופיעו כמסיחים */
  var STORIES = [
    { e: "🧲", t: "בשיעור מדעים עדי ראתה שמגנט מושך מסמרים. בבית היא בדקה עוד חפצים, ורשמה אילו מהם נמשכים.", a: "סקרנות", no: ["אהבת למידה", "התמדה"] },
    { e: "🌋", t: "אורי שמע בחדשות על הר געש. הוא שאל שני ספרים בספרייה, קרא אותם בחופש, וסיפר לכיתה מה למד.", a: "אהבת למידה", no: ["סקרנות", "התמדה"] },
    { e: "🏃", t: "ביום הספורט נועם הגיע ראשון, לבש את חולצת הקבוצה, ועודד בקול רם את כל הכיתה בכל תחרות.", a: "התלהבות", no: ["עבודת צוות", "מנהיגות", "הומור"] },
    { e: "🥈", t: "גיא הפסיד בתחרות ריצה והיה מאוכזב. חבר אמר לו: \"זו תחרות אחת. תסתכל כמה התקדמת השנה.\"", a: "נקודת מבט רחבה", no: ["תקווה", "טוב לב", "הבנה חברתית", "אהבה"] },
    { e: "📎", t: "לקבוצה של מאיה נגמר הדבק באמצע הפרויקט. מאיה הציעה לחבר את החלקים באטבים, וזה עבד.", a: "תבונה מעשית", no: ["גמישות מחשבתית", "עבודת צוות", "מנהיגות"] },
    { e: "🤫", t: "דנה ראתה שחברה שלה שקטה ולא מחייכת כמו תמיד. היא שאלה אותה בשקט, בצד: \"קרה משהו?\"", a: "הבנה חברתית", no: ["טוב לב", "אהבה", "נקודת מבט רחבה"] },
    { e: "🖼️", t: "סבא של ליאור חזר מבית החולים. ליאור הכין לו ציור, חיבק אותו ואמר: \"אני אוהב אותך, סבא.\"", a: "אהבה", no: ["טוב לב", "הכרת תודה", "הבנה חברתית"] },
    { e: "🧻", t: "ליה ראתה שלילד מכיתה א' נשפך שוקו על החולצה. היא נתנה לו טישו והלכה איתו לכיור.", a: "טוב לב", no: ["הבנה חברתית", "אהבה", "הוגנות"] },
    { e: "🎭", t: "יובל היה בטוח שהרעיון שלו להצגה הכי טוב. חברה הסבירה רעיון אחר, והוא אמר: \"את צודקת, בואי ננסה את שלך.\"", a: "גמישות מחשבתית", no: ["צניעות", "עבודת צוות", "סלחנות"] },
    { e: "✋", t: "כמה ילדים צחקו על ילד חדש. תמר פחדה שיצחקו גם עליה, ובכל זאת אמרה בקול: \"די, זה לא נחמד.\"", a: "תעוזה", no: ["הוגנות", "טוב לב", "כנות", "מנהיגות"] },
    { e: "🪢", t: "עומר רצה ללמוד קפיצה כפולה בחבל. הוא נכשל שוב ושוב, התאמן כל יום שבוע שלם, ובסוף הצליח.", a: "התמדה", no: ["אהבת למידה", "התלהבות", "תקווה"] },
    { e: "🚰", t: "המורה שאלה מי השאיר את הברז פתוח. אף אחד לא ראה, ונגה אמרה: \"אני שכחתי, סליחה.\"", a: "כנות", no: ["תעוזה", "צניעות"] },
    { e: "🏀", t: "בבחירת קבוצות לכדורסל, כל החזקים נבחרו לאותה קבוצה. אלון הציע לערבב, כדי שהמשחק יהיה שווה.", a: "הוגנות", no: ["מנהיגות", "עבודת צוות", "שיקול דעת"] },
    { e: "📰", t: "הקבוצה של רז הכינה עיתון כיתה. כל אחד קיבל תפקיד, וכשמישהו נתקע, האחרים עזרו לו לסיים בזמן.", a: "עבודת צוות", no: ["מנהיגות", "טוב לב", "הוגנות"] },
    { e: "🚲", t: "חברים הציעו לאיתי לרדת באופניים בירידה תלולה בלי קסדה. איתי חשב רגע ואמר: \"רק עם קסדה, ובירידה הקטנה.\"", a: "שיקול דעת", no: ["שליטה עצמית", "תעוזה"] },
    { e: "💯", t: "גיל קיבל את הציון הכי גבוה בכיתה. כשחבר שאל, הוא אמר רק: \"למדתי הרבה\", ולא התרברב מול כולם.", a: "צניעות", no: ["שליטה עצמית", "התמדה", "כנות"] },
    { e: "🗳️", t: "הכיתה לא הצליחה להחליט מה לעשות במסיבת סוף השנה. יעל הציעה הצבעה, ואחר כך חילקה לכל אחד תפקיד.", a: "מנהיגות", no: ["עבודת צוות", "הוגנות", "תבונה מעשית"] },
    { e: "🎨", t: "אחיה הקטן של מיכל קשקש על הציור שלה. היא כעסה מאוד, עצרה, נשמה עמוק, והלכה לספר לאמא.", a: "שליטה עצמית", no: ["סלחנות", "שיקול דעת", "אהבה"] },
    { e: "🌈", t: "בטיול השנתי עידו עצר ליד מפל ואמר: \"וואו, תראו איך המים נוצצים בשמש!\"", a: "הערכה ליופי ומצוינות", no: ["התלהבות", "סקרנות", "הכרת תודה"] },
    { e: "💌", t: "המאמנת נשארה אחרי האימון לעזור לשקד בתרגיל קשה. שקד כתבה לה פתק: \"תודה שעזרת לי!\"", a: "הכרת תודה", no: ["אהבה", "טוב לב", "צניעות"] },
    { e: "📖", t: "נטע לא הצליחה להקריא מול הכיתה. היא חשבה שאולי בפעם הבאה יהיה קצת יותר קל, וביקשה להתאמן קודם עם חברה.", a: "תקווה", no: ["התמדה", "תעוזה", "אהבת למידה", "עבודת צוות"] },
    { e: "🙏", t: "לפני המעבר לבית ספר חדש, רוני התפללה. התפילה נתנה לה כוח להיכנס לכיתה החדשה.", a: "אמונה", no: ["תעוזה", "תקווה", "שליטה עצמית"] },
    { e: "🤝", t: "בתאל ושירה רבו, ושירה אמרה משהו פוגע. למחרת שירה ביקשה סליחה, ובתאל אמרה: \"סלחתי, בואי נשב ביחד.\"", a: "סלחנות", no: ["טוב לב", "אהבה", "שליטה עצמית"] },
    { e: "🎪", t: "באמצע חזרה להצגה נפל הווילון, וכולם נבהלו. בן עשה פרצוף מצחיק ואמר: \"זה חלק מההצגה!\", וכולם צחקו.", a: "הומור", no: ["תבונה מעשית", "התלהבות", "תעוזה"] }
  ];
  STORIES.forEach(function (s) { s.ai = idx(s.a); s.noi = s.no.map(idx); });

  /* חוזקה להצלה: y = שתי חוזקות שיעזרו (ואיך), x = שתיים שפחות קשורות למצב */
  var HELP = [
    { e: "📚", t: "מחר יש מבחן, והחומר נראה לי קשה.",
      y: [["ללמוד עוד קצת כל יום, גם כשקשה.", "התמדה"], ["להגיד לעצמי: אם אתכונן, יכול להיות טוב יותר.", "תקווה"]],
      x: [["לשחק כל הערב ולא לפתוח את החומר.", "זה נעים עכשיו, אבל לא עוזר להתכונן."], ["להגיד לחברים שהמבחן מיותר.", "זה לא עוזר להבין את החומר."]] },
    { e: "👋", t: "ילד חדש הגיע לכיתה, ואני רוצה להכיר אותו.",
      y: [["לגשת ולהגיד לו שלום ראשון{|ה}.", "תעוזה"], ["להזמין אותו לשבת איתנו בהפסקה.", "טוב לב"]],
      x: [["לדבר עליו עם חברים, בלי לפנות אליו.", "ככה עוד לא מכירים אותו."], ["להמשיך לשחק כרגיל ולא לשים לב אליו.", "ככה קשה להכיר."]] },
    { e: "💬", t: "חבר אמר לי משהו פוגע, ואחר כך ביקש סליחה.",
      y: [["להגיד לו בשקט מה הרגשתי.", "כנות"], ["לחשוב אם לתת לו הזדמנות נוספת.", "סלחנות"]],
      x: [["להגיד לו משהו פוגע בחזרה.", "זה רק מגדיל את הריב."], ["להעמיד פנים שלא קרה כלום, ולשמור את זה בבטן.", "ככה מה שהרגשתי נשאר בפנים."]] },
    { e: "🧩", t: "בעבודה בקבוצה, כל אחד רוצה רעיון אחר.",
      y: [["להקשיב לכל הרעיונות ולחפש איך לחבר ביניהם.", "גמישות מחשבתית"], ["להציע שכל אחד יסביר את הרעיון שלו, ואז מצביעים.", "מנהיגות"]],
      x: [["להתעקש על הרעיון שלי עד שכולם יוותרו.", "ככה לא מגיעים להסכמה."], ["לעזוב את הקבוצה ולעבוד לבד.", "ככה מפסידים את העבודה המשותפת."]] },
    { e: "😤", t: "אחי לקח לי משהו בלי לשאול, ואני {כועס|כועסת} מאוד.",
      y: [["לעצור ולנשום לפני שאני מגיב{|ה}.", "שליטה עצמית"], ["להגיד במילים מה מפריע לי ומה אני רוצה.", "כנות"]],
      x: [["לחטוף ממנו בחזרה ולצעוק.", "זה מגדיל את הכעס של שנינו."], ["לקחת לו משהו שלו, כנקמה.", "זה מתחיל ריב חדש."]] },
    { e: "🏊", t: "לא עברתי את המבחן בשחייה.",
      y: [["להמשיך להתאמן ולנסות שוב.", "התמדה"], ["לזכור שבפעם הבאה יכול להיות אחרת.", "תקווה"]],
      x: [["להפסיק ללכת לאימונים.", "ככה קשה להשתפר."], ["להאשים את המדריך.", "זה לא עוזר להצליח בפעם הבאה."]] },
    { e: "🥱", t: "משעמם לי בחופש, ואין מה לעשות.",
      y: [["לחפש משהו חדש לגלות או לחקור.", "סקרנות"], ["להמציא משחק או לבנות משהו מחפצים בבית.", "תבונה מעשית"]],
      x: [["לשכב ולחכות שהשעמום ייגמר.", "ככה השעמום נשאר."], ["להציק לאח או לאחות.", "זה עלול להתחיל ריב."]] },
    { e: "😢", t: "חברה שלי עצובה, כי החתול שלה חולה.",
      y: [["לשבת איתה ולשאול מה יעזור לה.", "טוב לב"], ["לשים לב אם היא רוצה לדבר, או רק שיהיו לידה.", "הבנה חברתית"]],
      x: [["להגיד לה: זה רק חתול, אל תהיי עצובה.", "ככה היא עלולה להרגיש שלא מבינים אותה."], ["להמשיך לשחק כרגיל ולא לפנות אליה.", "ככה היא עלולה להרגיש לבד."]] }
  ];
  HELP.forEach(function (h) { h.y.forEach(function (p) { p[2] = idx(p[1]); }); });

  var FACTS = [
    { q: "במשחק נכיר 24 חוזקות. חלקן כבר בולטות אצלנו, ואת כולן אפשר לתרגל.", a: true, e: "נכון! חלק מהחוזקות כבר בולטות, ואת כל השאר אפשר לתרגל ולגדל." },
    { q: "חוזקה זה כמו כישרון, למשל לצייר יפה.", a: false, e: "מיתוס! כישרון זה מה שיודעים לעשות. חוזקה זה איך מתנהגים: באומץ, בסקרנות, באכפתיות." },
    { q: "אפשר לחזק חוזקה, כמו שריר.", a: true, e: "נכון! כל פעם שמשתמשים בחוזקה, היא מתחזקת. 💪" },
    { q: "יש חוזקות טובות, ויש חוזקות פחות שוות.", a: false, e: "מיתוס! כל 24 החוזקות חשובות. לכל אחת יש רגע שבו היא בדיוק מה שצריך." },
    { q: "חוזקות עוזרות להתמודד עם דברים קשים.", a: true, e: "נכון! כשמשתמשים בחוזקות, קל יותר להתמודד, ומרגישים טוב יותר." },
    { q: "אם אני לא טוב{|ה} במשהו, אין לי את החוזקה הזאת.", a: false, e: "מיתוס! החוזקה נמצאת, ואולי היא עוד קטנה. אפשר לגדל אותה." },
    { q: "אפשר לראות חוזקות אצל אחרים, ולהגיד להם.", a: true, e: "נכון! כשאומרים לחבר איזו חוזקה ראינו בו, זה מחזק אותו ואת החברות." }
  ];

  var app = document.getElementById("app");
  var KEY = "smid-v1";
  var st = FUN.load(KEY, null) || fresh();
  function fresh() { return { g: null, stars: [0, 0, 0, 0, 0, 0, 0], gems: 0, mine: [], less: [], grow: null, seen: false, opened: false }; }
  function save() { FUN.save(KEY, st); }

  /* ---------- עזרים ---------- */
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearLater() { timers.forEach(clearTimeout); timers = []; }
  function T(s, g) { if (g == null) g = st.g === "f" ? 1 : 0; return String(s).replace(/\{([^|}]*)\|([^}]*)\}/g, function (m, a, b) { return g ? b : a; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sayBtn(text) { return '<button type="button" class="say no-click" data-say="' + esc(text) + '" aria-label="הקראה">🔈</button>'; }
  function $$(sel) { return Array.prototype.slice.call(app.querySelectorAll(sel)); }
  function gemsUI(add, el) {
    if (add) { st.gems += add; save(); FUN.floatText("+" + add + " 💎", el); }
    document.getElementById("gems").textContent = st.gems;
    var p = document.getElementById("gemPill"); p.classList.remove("pulse"); void p.offsetWidth; if (add) p.classList.add("pulse");
  }
  function top() { window.scrollTo(0, 0); var bb = document.getElementById("backBtn"); if (bb) bb.hidden = false; }
  function head(t) { return '<div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + t + " " + sayBtn(t) + "</p></div>"; }
  function bar(p) { return '<div class="progress"><i id="bar" style="width:' + p + '%"></i></div>'; }
  function card(i, extra) {
    return '<div class="scard" style="--c:' + S[i].c + '"><img src="' + S[i].src + '" alt=""><b>' + S[i].n + "</b>" + (extra || "") + "</div>";
  }

  /* ---------- הקראה (קול עברי של המכשיר, אם יש) ---------- */
  var voice = null, readOn = FUN.store("smid-read") !== "0";
  var readBtn = document.getElementById("readBtn");
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var vs = speechSynthesis.getVoices() || [];
    var he = vs.filter(function (v) { return /^(he|iw)/i.test(v.lang); });
    voice = he.filter(function (v) { return /natural|online|google/i.test(v.name); })[0] || he[0] || null;
    document.body.classList.toggle("no-voice", !voice || !readOn);
    readBtn.hidden = !voice; paintRead();
  }
  function paintRead() { readBtn.classList.toggle("off", !readOn); readBtn.setAttribute("aria-label", readOn ? "כיבוי הקראה" : "הפעלת הקראה"); }
  document.body.classList.add("no-voice");
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  readBtn.addEventListener("click", function () {
    readOn = !readOn; FUN.store("smid-read", readOn ? "1" : "0"); paintRead();
    document.body.classList.toggle("no-voice", !voice || !readOn);
    if (!readOn) { try { speechSynthesis.cancel(); } catch (e) {} }
  });
  /* הקראה אוטומטית של הטקסטים המרכזיים (ב'-ה'), ואפשר גם ללחוץ על 🔈 */
  function say(text) {
    if (!voice || !readOn) return;
    try {
      speechSynthesis.cancel();
      var clean = String(text).replace(/<[^>]+>/g, " ").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}]/gu, "");
      var u = new SpeechSynthesisUtterance(clean); u.voice = voice; u.lang = voice.lang; u.rate = 0.95; u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".say"); if (!b) return;
    e.stopPropagation(); FUN.sfx("pop"); say(b.dataset.say);
  }, true);

  FUN.bindMute(document.getElementById("soundBtn"));
  document.getElementById("homeBtn").addEventListener("click", function () { if (st.seen) showMap(); else start(); });
  document.getElementById("backBtn").addEventListener("click", function () { FUN.sfx("pop"); if (st.seen) showMap(); else start(); });
  gemsUI(0);

  /* ---------- החלקה (ימינה / שמאלה / למעלה) ---------- */
  function swipe(el, cb, allowUp) {
    var sx = 0, sy = 0, dx = 0, dy = 0, on = false;
    el.addEventListener("pointerdown", function (e) { on = true; sx = e.clientX; sy = e.clientY; dx = dy = 0; el.setPointerCapture(e.pointerId); el.style.transition = "none"; });
    el.addEventListener("pointermove", function (e) {
      if (!on) return; dx = e.clientX - sx; dy = e.clientY - sy;
      el.style.transform = "translate(" + dx + "px," + Math.min(dy, 40) + "px) rotate(" + dx / 14 + "deg)";
      el.dataset.lean = dx > 40 ? "r" : dx < -40 ? "l" : (allowUp && dy < -50 ? "u" : "");
    });
    function end() {
      if (!on) return; on = false; el.style.transition = ""; el.dataset.lean = "";
      if (dx > 90) cb("r"); else if (dx < -90) cb("l"); else if (allowUp && dy < -90) cb("u"); else el.style.transform = "";
    }
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }
  function fling(el, dir, then) {
    el.style.transition = "transform .35s ease-in, opacity .35s";
    el.style.transform = dir === "r" ? "translate(140%,20px) rotate(25deg)" : dir === "l" ? "translate(-140%,20px) rotate(-25deg)" : "translate(0,-140%) scale(.8)";
    el.style.opacity = "0"; FUN.sfx("whoosh");
    later(then, 330);
  }

  /* ---------- פתיחה: בחירת דמות + 2 שקפים ---------- */
  function start() {
    clearLater(); top(); document.getElementById("backBtn").hidden = true;
    app.innerHTML = '<div class="hero"><div class="sparkles"></div><img class="chest-pic" src="kit/chest.webp" alt="תיבת אוצר">' +
      '<h1 class="hero-title">אספני החוזקות</h1><div class="hero-sub">⚡ מסע האלופים ⚡</div></div>' +
      '<div class="panel center"><p class="big-t">מי יוצא למסע?</p><div class="gpick">' +
      '<button class="gbtn" data-g="m"><span>🦸‍♂️</span>אני בן</button><button class="gbtn" data-g="f"><span>🦸‍♀️</span>אני בת</button></div></div>';
    $$(".gbtn").forEach(function (b) {
      b.onclick = function () { st.g = b.dataset.g; save(); FUN.sfx("unlock"); FUN.confettiAt(b, 20); later(function () { intro(0); }, 350); };
    });
  }
  function slides() {
    return [
      { art: '<img class="chest-pic" src="kit/chest.webp" alt="">', t: T("אני <b>יהלומי</b> 💎 ויש לי משימה {בשבילך|בשבילך}:<br>לפתוח את <b>תיבת האוצר</b>!<br>כל משחק {שתנצח|שתנצחי} = אבן חן למנעול.") },
      { art: '<div class="parade">' + shuffle(S.map(function (s, k) { return k; })).slice(0, 12).map(function (i, k) { return '<img src="' + S[i].src + '" alt="" style="animation-delay:' + (k * 0.06) + 's">'; }).join("") + "</div>",
        t: "במשחק נכיר <b>24 חוזקות</b>: כוחות טובים שבנו.<br>חלקן כבר בולטות אצלנו, ואת <b>כולן</b> אפשר לתרגל 💪" }
    ];
  }
  function intro(n) {
    var SL = slides(), s = SL[n]; top();
    app.innerHTML = '<div class="panel center">' + s.art + '<img class="guide sm" src="' + GUIDE + '" alt="יהלומי">' +
      '<p class="big-t">' + s.t + " " + sayBtn(s.t) + "</p>" +
      '<div class="row mt"><button class="btn pink big" id="next">' + (n < SL.length - 1 ? "הבא ←" : "יאללה, למסע! 🚀") + "</button></div>" +
      '<div class="dots">' + SL.map(function (x, i) { return '<i class="' + (i === n ? "on" : "") + '"></i>'; }).join("") + "</div></div>";
    document.getElementById("next").onclick = function () {
      FUN.sfx("whoosh");
      if (n < SL.length - 1) intro(n + 1); else { st.seen = true; save(); showMap(); }
    };
  }

  /* ---------- תיבת האוצר: 7 חורים במנעול, כל פעילות = אבן ---------- */
  var ACTS = [
    { icon: '<img class="st-ic" src="kit/guide_big.svg" alt="">', name: "אמת או מיתוס?", place: "מה זו חוזקה?", run: stFacts, done: "אלופים! עכשיו {אתה יודע|את יודעת} מה זו חוזקה!" },
    { icon: '<img class="st-ic" src="kit/memory.svg" alt="">', name: "זיכרון החוזקות", place: "חוזקה ↔ מה היא עושה", run: stMemory, done: "איזה זיכרון! מצאת את כל הזוגות!" },
    { icon: '<img class="st-ic" src="kit/detective.svg" alt="">', name: "בלשי החוזקות", place: "איזו חוזקה יש בסיפור?", run: stStories, done: "{בלש|בלשית} חוזקות {אמיתי|אמיתית}! 🕵️" },
    { icon: '<img class="st-ic" src="kit/quartets.svg" alt="">', name: "חוזקה להצלה", place: "מה יעזור כשקשה?", run: stHelp, done: "{מצאת|מצאת} חוזקות שמצילות את המצב!" },
    { icon: '<img class="st-ic" src="kit/mirror.svg" alt="">', name: "המראה שלי", place: "אילו חוזקות בולטות בי?", run: stMirror, done: "{גילית|גילית} את החוזקות שלך!" },
    { icon: '<img class="st-ic" src="kit/practice.svg" alt="">', name: "חדר הכושר", place: "מאמנים חוזקה", run: stGym, done: "החוזקה טעונה ומוכנה לאימון! ⚡" },
    { icon: '<img class="st-ic" src="kit/glasses.svg" alt="">', name: "משקפי החוזקות", place: "רואים חוזקות באחרים", run: stSpot, done: "{הכנת|הכנת} כרטיס מחמאה! 💌" }
  ];
  var HOLES = [[885, 417], [1015, 480], [1020, 612], [945, 700], [825, 700], [745, 612], [755, 480]];
  var GEMC = ["#5ec8bd", "#9c8ed0", "#efb26c", "#e88aa0", "#7cb7ef", "#a6d36a", "#f2c94c"];
  function gemSVG(c) {
    var id = "rg" + c.replace("#", "");
    return '<svg viewBox="-34 -34 68 68" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '" stop-opacity=".75"/></radialGradient></defs>' +
      '<circle r="30" fill="' + c + '" stroke="#fff6e6" stroke-width="3"/><circle r="30" fill="url(#' + id + ')"/>' +
      '<polygon points="0,-17 15,-8 15,8 0,17 -15,8 -15,-8" fill="#fff" opacity=".22" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>' +
      '<ellipse cx="-10" cy="-13" rx="7" ry="4" fill="#fff" opacity=".85" transform="rotate(-30 -10 -13)"/></svg>';
  }
  function chestHTML(filled) {
    return '<div class="chest2" id="chest"><div class="c2-inner"></div><div class="c2-glow"></div>' +
      '<img class="c2-body" src="kit/chest_body.webp" alt="תיבת אוצר נעולה, עם שבעה חורים במנעול"><img class="c2-lid" src="kit/chest_lid.webp" alt="">' +
      '<div class="c2-key"></div>' +
      HOLES.map(function (h, n) {
        return '<span class="hole' + (filled[n] ? " on" : "") + '" data-h="' + n + '" style="left:' + (h[0] / 15.36).toFixed(2) + "%;top:" + (h[1] / 10.24).toFixed(2) + '%">' + gemSVG(GEMC[n]) + "</span>";
      }).join("") + "</div>";
  }
  function showMap(justDone) {
    clearLater(); top(); try { window.speechSynthesis.cancel(); } catch (e) {}
    if (!st.g) { start(); return; }
    document.getElementById("backBtn").hidden = true;
    var filled = st.stars.map(function (x) { return !!x; });
    var show = filled.slice(); if (justDone != null) show[justDone] = false;
    var count = filled.filter(Boolean).length, all = count === ACTS.length;
    var line = T(all ? (st.opened ? "התיבה כבר נפתחה! אפשר לשחק שוב בכל משחק." : "כל 7 האבנים במנעול! 🔓 בוא{|י} נפתח את התיבה!")
      : count === 0 ? "התיבה נעולה 🔒 כל משחק {שתסיים|שתסיימי} = אבן חן למנעול. {בחר|בחרי} משחק!"
      : "כבר " + count + " אבנים במנעול! עוד " + (7 - count) + " והתיבה נפתחת.");
    app.innerHTML = '<div class="hubwrap"><div class="st-head"><img class="guide" src="' + GUIDE + '" alt="יהלומי"><p>' + line + " " + sayBtn(line) + "</p></div>" +
      chestHTML(show) +
      (all ? '<div class="row mt"><button class="btn pink big" id="openBtn">' + (st.opened ? "👑 לאוצר שלי" : "🔓 פותחים את התיבה!") + "</button></div>" : "") +
      '<div class="acts">' + ACTS.map(function (a, i) {
        var stars = ""; for (var q = 0; q < 3; q++) stars += '<i class="' + (q < (st.stars[i] || 0) ? "on" : "") + '">★</i>';
        return '<button class="act' + (filled[i] ? " done" : "") + (!filled[i] && i === filled.indexOf(false) ? " next" : "") + '" data-i="' + i + '" style="--g:' + GEMC[i] + '">' +
          '<span class="act-gem">' + gemSVG(filled[i] ? GEMC[i] : "#cfc8d8") + "</span>" + a.icon +
          '<span class="act-txt"><b>' + a.name + "</b><small>" + a.place + '</small><span class="gem-stars">' + stars + "</span></span></button>";
      }).join("") + "</div>" +
      '<div class="hub-total">🔒 ' + count + ' / 7 אבנים</div>' +
      '<div class="row mt no-print"><button class="btn ghost" id="again">🔄 משחקים מההתחלה</button></div></div>';
    $$(".act").forEach(function (b) { b.onclick = function () { FUN.sfx("pop"); ACTS[+b.dataset.i].run(); }; });
    var ob = document.getElementById("openBtn"); if (ob) ob.onclick = function () { if (st.opened) reveal(); else openChest(); };
    document.getElementById("again").onclick = function () { st = fresh(); save(); gemsUI(0); start(); };
    if (justDone != null) later(function () { fly(justDone, all); }, 500);
  }
  function fly(i, all) {
    var src = app.querySelector('.act[data-i="' + i + '"] .act-gem'), hole = app.querySelector('.hole[data-h="' + i + '"]');
    if (!src || !hole) return;
    hole.scrollIntoView({ block: "center", behavior: "smooth" });
    later(function () {
      var r1 = src.getBoundingClientRect(), r2 = hole.getBoundingClientRect(), f = document.createElement("div");
      f.className = "fly-gem"; f.innerHTML = gemSVG(GEMC[i]);
      f.style.left = r1.left + r1.width / 2 - 22 + "px"; f.style.top = r1.top + r1.height / 2 - 22 + "px"; document.body.appendChild(f);
      FUN.sfx("whoosh");
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        f.style.left = r2.left + r2.width / 2 - 22 + "px"; f.style.top = r2.top + r2.height / 2 - 22 + "px"; f.style.transform = "scale(" + (r2.width / 44) + ") rotate(360deg)";
      }); });
      later(function () {
        f.remove(); hole.classList.add("on", "click");
        FUN.sfx("unlock"); FUN.confettiAt(hole, 18);
        if (all) later(function () { FUN.bigBanner("🔓 כל 7 האבנים!"); FUN.sfx("fanfare"); FUN.confettiSides(50); }, 500);
      }, 800);
    }, 450);
  }
  function finishStation(i, stars, extra) {
    var first = !st.stars[i];
    st.stars[i] = Math.max(st.stars[i] || 0, stars);
    save(); top();
    var msg = T(ACTS[i].done);
    app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt="">' +
      '<h2 class="level-banner">' + msg + "</h2>" + '<div id="stars"></div>' + (extra || "") +
      '<div class="row mt"><button class="btn pink big" id="toMap">' + (first ? "להכניס את האבן לתיבה! 💎" : "חזרה לתיבה 💎") + "</button></div></div>";
    FUN.revealStars(document.getElementById("stars"), stars);
    FUN.sfx("win"); FUN.confettiSides(40);
    if (first) gemsUI(5, document.getElementById("stars"));
    document.getElementById("toMap").onclick = function () { showMap(first ? i : null); };
  }
  function openChest() {
    clearLater(); top();
    var t = T("רגע לפני שפותחים... מה {אתה חושב|את חושבת} שיש בתיבה?");
    var opts = ["💰 זהב", "🎮 משחק", "🏆 גביע", "🤔 משהו אחר"];
    app.innerHTML = '<div class="hubwrap">' + head(t) +
      chestHTML([1, 1, 1, 1, 1, 1, 1]) + '<div class="opts2" id="guess">' + opts.map(function (o) { return '<button class="btn ghost">' + o + "</button>"; }).join("") + "</div></div>";
    $$("#guess .btn").forEach(function (b) {
      b.onclick = function () {
        FUN.sfx("pop"); document.getElementById("guess").hidden = true;
        var ch = document.getElementById("chest");
        ch.scrollIntoView({ block: "center", behavior: "smooth" });
        later(function () { ch.classList.add("glowing"); FUN.sfx("combo", 6); }, 200);
        later(function () { ch.classList.add("unlock"); FUN.sfx("unlock"); }, 1100);
        later(function () { ch.classList.add("opening"); FUN.sfx("fanfare"); FUN.confettiSides(70); }, 2100);
        later(function () { st.opened = true; save(); reveal(); }, 3600);
      };
    });
  }

  /* ---------- 1. אמת או מיתוס (החלקה) ---------- */
  function stFacts() {
    var list = FACTS, i = 0, right = 0, combo = 0;
    show();
    function show() {
      top();
      var it = list[i], q = T(it.q);
      app.innerHTML = bar(i / list.length * 100) +
        head(T("{החלק|החליקי} ימינה אם זה נכון, ושמאלה אם זה מיתוס.")) +
        '<div class="deck"><div class="swcard tfcard" id="sc"><span class="tag yes">נכון ✔</span><span class="tag no">✘ מיתוס</span>' +
        '<div class="tf-num">' + (i + 1) + " / " + list.length + '</div><p class="big-t">' + q + "</p>" + sayBtn(q) + "</div></div>" +
        '<div class="tf"><button class="btn tf-yes" data-d="r">נכון 👉</button><button class="btn tf-no" data-d="l">👈 מיתוס</button></div><div id="ex"></div>';
      var sc = document.getElementById("sc"), done = false;
      say(q);
      function answer(d) {
        if (done) return; done = true;
        var ok = (d === "r") === it.a;
        fling(sc, d, function () {
          var ex = document.getElementById("ex");
          app.querySelector(".tf").remove();
          if (ok) { right++; combo++; FUN.sfx(combo >= 2 ? "combo" : "good", combo); gemsUI(2, ex); if (combo >= 3) FUN.bigBanner("רצף " + combo + "! 🔥"); FUN.confettiAt(ex, 24); }
          else { combo = 0; FUN.sfx("soft"); }
          var e = T(it.e);
          var dk = app.querySelector(".deck"); if (dk) dk.outerHTML = '<p class="echo">"' + q + '"</p>';
          ex = document.getElementById("ex");
          ex.innerHTML = '<div class="feedback' + (ok ? "" : " try") + '"><p>' + (ok ? "🎉 " : "💡 ") + e + " " + sayBtn(e) + "</p>" +
            '<div class="row mt"><button class="btn pink" id="nx">' + (i < list.length - 1 ? "הבא ←" : "סיום! 🎉") + "</button></div></div>";
          document.getElementById("nx").onclick = function () { i++; if (i < list.length) show(); else finishStation(0, FUN.starsFor(right, list.length)); };
        });
      }
      swipe(sc, answer, false);
      $$(".tf .btn").forEach(function (b) { b.onclick = function () { answer(b.dataset.d); }; });
    }
  }

  /* ---------- 2. זיכרון: חוזקה ↔ מה היא עושה ---------- */
  function stMemory() {
    top();
    var pick = shuffle(S.map(function (x, i) { return i; })).slice(0, 6);
    var deck = shuffle(pick.map(function (i) { return [i, "n"]; }).concat(pick.map(function (i) { return [i, "t"]; })));
    var open = [], found = 0, moves = 0, lock = false, combo = 0;
    app.innerHTML = head(T("{מצא|מצאי} כל חוזקה ואת המשפט שמתאר אותה!")) + bar(0) +
      '<div class="album mem">' + deck.map(function (d, k) {
        var i = d[0], face = d[1] === "n" ? '<img src="' + S[i].src + '" alt=""><strong>' + S[i].n + "</strong>" : '<p class="mtxt">' + T(S[i].t) + "</p>";
        return '<button class="flip" data-i="' + i + '" style="--c:' + S[i].c + '" aria-label="קלף סגור"><div class="in"><div class="f"><span>💎</span></div>' +
          '<div class="b' + (d[1] === "t" ? " tx" : "") + '">' + face + "</div></div></button>";
      }).join("") + '</div><div class="moves" id="mv">מהלכים: 0</div>';
    $$(".flip").forEach(function (b) {
      b.onclick = function () {
        if (lock || b.classList.contains("open")) return;
        b.classList.add("open"); FUN.sfx("pop"); open.push(b);
        if (open.length < 2) return;
        moves++; lock = true; document.getElementById("mv").textContent = "מהלכים: " + moves;
        var a = open[0], c = open[1]; open = [];
        if (a.dataset.i === c.dataset.i) {
          found++; combo++;
          later(function () {
            FUN.sfx(combo >= 2 ? "combo" : "good", combo); FUN.confettiAt(c, 22); gemsUI(1, c);
            if (combo >= 2) FUN.bigBanner("רצף " + combo + "! 🔥");
            a.classList.add("matched"); c.classList.add("matched");
            document.getElementById("bar").style.width = (found / 6 * 100) + "%";
            lock = false;
            if (found === 6) later(function () { finishStation(1, moves <= 11 ? 3 : moves <= 16 ? 2 : 1); }, 900);
          }, 450);
        } else {
          combo = 0;
          later(function () { a.classList.remove("open"); c.classList.remove("open"); FUN.sfx("soft"); lock = false; }, 1300);
        }
      };
    });
  }

  /* ---------- 3. בלשי החוזקות: 4 סיפורים עם 3 תשובות, ואז 4 עם 4 ---------- */
  var lastStories = [];
  function stStories() {
    var pool0 = STORIES.filter(function (x) { return lastStories.indexOf(x) < 0; });
    if (pool0.length < 8) pool0 = STORIES;
    var rounds = shuffle(pool0).slice(0, 8), r = 0, firstTry = 0, combo = 0;
    lastStories = rounds;
    next();
    function next() {
      if (r === 4) { levelUp(); return; }
      if (r >= rounds.length) { finishStation(2, FUN.starsFor(firstTry, rounds.length)); return; }
      show(rounds[r]);
    }
    function levelUp() {
      top(); r = 4;
      app.innerHTML = '<div class="panel center lvl"><div class="lvl-burst">⚡</div><h2 class="level-banner">שלב 2: לאלופים!</h2>' +
        '<p class="big-t mt">עכשיו יש <b>4</b> חוזקות לבחירה.<br>' + T("{מוכן|מוכנה}?") + "</p>" +
        '<div class="row mt"><button class="btn pink big" id="go">יאללה! ←</button></div></div>';
      FUN.sfx("unlock"); FUN.confettiSides(30);
      document.getElementById("go").onclick = function () { show(rounds[r]); };
    }
    function show(sto) {
      top();
      var nOpt = r < 4 ? 3 : 4;
      var pool = shuffle(S.map(function (x, i) { return i; }).filter(function (i) { return i !== sto.ai && sto.noi.indexOf(i) < 0; }));
      var opts = shuffle([sto.ai].concat(pool.slice(0, nOpt - 1)));
      var tries = 0;
      app.innerHTML = bar(r / rounds.length * 100) +
        '<div class="panel story"><div class="case-no">🕵️ תיק ' + (r + 1) + " / " + rounds.length + (combo >= 2 ? ' <span class="combo">🔥 ' + combo + "</span>" : "") + '</div>' +
        '<div class="emo">' + sto.e + '</div><div class="txt"><p class="story-t">' + sto.t + "</p>" + sayBtn(sto.t) + "</div>" +
        '<p class="q">איזו חוזקה יש כאן?</p>' +
        '<div class="opts' + (nOpt === 3 ? " three" : " four") + '">' + opts.map(function (i) {
          return '<button class="opt" data-i="' + i + '" style="--c:' + S[i].c + '"><img src="' + S[i].src + '" alt=""><span>' + S[i].n + "</span></button>";
        }).join("") + '</div><div id="fb"></div></div>';
      say(sto.t + " איזו חוזקה יש כאן?");
      $$(".opt").forEach(function (b) {
        b.onclick = function () {
          var i = +b.dataset.i, fb = document.getElementById("fb");
          if (i === sto.ai) {
            if (tries === 0) { firstTry++; combo++; } else combo = 0;
            b.classList.add("right");
            $$(".opt").forEach(function (o) { o.disabled = true; if (o !== b) o.classList.add("wrong"); });
            FUN.sfx(combo >= 2 ? "combo" : "good", combo); FUN.confettiAt(b, 30); gemsUI(tries === 0 ? 2 : 1, b);
            if (combo >= 3) FUN.bigBanner("רצף " + combo + "! 🔥");
            var line = "נכון! " + S[i].n + ": " + T(S[i].t, 0).replace(/\.$/, "") + ".";
            fb.innerHTML = '<div class="feedback"><p>✔ ' + esc(S[i].n) + " " + sayBtn(line) + '</p><div class="row mt"><button class="btn pink" id="nx">' + (r === rounds.length - 1 ? "סיום! 🎉" : "התיק הבא ←") + "</button></div></div>";
            document.getElementById("nx").onclick = function () { r++; next(); };
            later(function () { fb.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 150);
          } else {
            tries++; combo = 0;
            b.classList.add("wrong"); FUN.shake(b); FUN.sfx("soft");
            var hint = T("{נסה|נסי} שוב! מה בדיוק הילד או הילדה עשו בסיפור?");
            fb.innerHTML = '<div class="feedback try"><p>🤔 ' + hint + "</p></div>";
          }
        };
      });
    }
  }

  /* ---------- 4. חוזקה להצלה: בוחרים 2 תגובות מתוך 4, ואז מגלים איזו חוזקה מאחוריהן ---------- */
  function stHelp() {
    var rounds = shuffle(HELP).slice(0, 5), r = 0, clean = 0;
    show();
    function show() {
      if (r >= rounds.length) { finishStation(3, FUN.starsFor(clean, rounds.length)); return; }
      top();
      var h = rounds[r], got = 0, miss = 0;
      var opts = shuffle(h.y.map(function (p, k) { return { ok: true, k: k, t: p[0] }; }).concat(h.x.map(function (p, k) { return { ok: false, k: k, t: p[0] }; })));
      var sit = T(h.t);
      app.innerHTML = bar(r / rounds.length * 100) +
        '<div class="panel story sos"><div class="sos-tag">🚨 מצב ' + (r + 1) + " / " + rounds.length + '</div><div class="emo">' + h.e + "</div>" +
        '<div class="txt"><p class="story-t">' + sit + "</p>" + sayBtn(sit) + "</div>" +
        '<p class="q">אילו 2 תגובות יעזרו כאן? <span id="cnt">(0/2)</span></p>' +
        '<div class="acts2">' + opts.map(function (o, n) {
          return '<button class="actbtn" data-n="' + n + '"><span class="at">' + T(o.t) + '</span><span class="reveal"></span></button>';
        }).join("") + '</div><div id="fb"></div></div>';
      say(sit + " אילו שתי תגובות יעזרו כאן?");
      $$(".actbtn").forEach(function (b) {
        b.onclick = function () {
          var o = opts[+b.dataset.n], fb = document.getElementById("fb");
          b.disabled = true;
          if (o.ok) {
            got++; b.classList.add("right");
            var si = h.y[o.k][2];
            b.querySelector(".reveal").innerHTML = '<img src="' + S[si].src + '" alt=""><b>💎 ' + S[si].n + "</b>";
            FUN.sfx(got === 2 ? "combo" : "good", got * 2); FUN.confettiAt(b, 22); gemsUI(miss ? 1 : 2, b);
            document.getElementById("cnt").textContent = "(" + got + "/2)";
            if (got === 2) {
              if (!miss) clean++;
              $$(".actbtn").forEach(function (x) { x.disabled = true; if (!x.classList.contains("right")) x.classList.add("dim"); });
              FUN.bigBanner(miss ? "הצלחה! 🦸" : "הצלה מושלמת! 🦸");
              fb.innerHTML = '<div class="feedback"><p>💪 ' + "מאחורי כל תגובה טובה יש חוזקה! ויש עוד חוזקות שיכולות לעזור כאן." + '</p><div class="row mt"><button class="btn pink" id="nx">' + (r === rounds.length - 1 ? "סיום! 🎉" : "המצב הבא ←") + "</button></div></div>";
              document.getElementById("nx").onclick = function () { r++; show(); };
              later(function () { fb.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 150);
            } else fb.innerHTML = '<div class="feedback"><p>✔ ' + T("יפה! {חפש|חפשי} עוד תגובה אחת.") + "</p></div>";
          } else {
            miss++; b.classList.add("wrong"); FUN.shake(b); FUN.sfx("soft");
            fb.innerHTML = '<div class="feedback try"><p>🤔 ' + h.x[o.k][1] + T(" {נסה|נסי} תגובה אחרת!") + "</p></div>";
          }
        };
      });
    }
  }

  /* ---------- 5. המראה שלי: מחליקים קלפים (אפשר לעבור לבחירה אחרי 12), ואז בוחרים 3-5 ---------- */
  function stMirror() {
    var order = shuffle(S.map(function (x, i) { return i; })), k = 0, yes = [], maybe = [], less = [];
    var LESS = "🌱 פחות בולט בי כרגע", UNS = "🤔 לא " + T("{בטוח|בטוחה}");
    deal();
    function deal() {
      if (k >= order.length) { pick(); return; }
      if (k === 12) { halfway(); return; }
      cardScreen();
    }
    function halfway() {
      top();
      app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt=""><h2 class="level-banner">כבר 12 קלפים! 🎉</h2>' +
        '<p class="big-t mt">' + T("{רוצה|רוצה} להכיר עוד חוזקות, או לעבור לבחירה?") + "</p>" +
        '<div class="row mt"><button class="btn pink big" id="more">להכיר עוד חוזקות ←</button><button class="btn ghost" id="topick">לבחירה ⭐</button></div></div>';
      FUN.sfx("unlock"); FUN.confettiSides(20);
      document.getElementById("more").onclick = function () { cardScreen(); };
      document.getElementById("topick").onclick = function () { pick(); };
    }
    function cardScreen() {
      top();
      var i = order[k], t = T(S[i].t);
      app.innerHTML = bar(k / order.length * 100) +
        '<div class="cardno">קלף ' + (k + 1) + " מתוך " + order.length + "</div>" +
        head(T("זה {אתה|את}? {החלק|החליקי} את הקלף, או {לחץ|לחצי} על כפתור.")) +
        '<div class="deck"><div class="swcard mcard" id="sc" style="--c:' + S[i].c + '"><span class="tag yes">⭐ ממש אני</span><span class="tag no">' + LESS + '</span><span class="tag up">' + UNS + '</span>' +
        '<img src="' + S[i].src + '" alt=""><b>' + S[i].n + '</b><p>' + t + "</p></div></div>" +
        '<div class="mbtns"><button class="btn tf-yes" data-d="r">⭐ ממש אני</button><button class="btn ghost" data-d="u">' + UNS + '</button><button class="btn tf-no" data-d="l">' + LESS + '</button></div>' +
        '<div class="row"><button class="linkbtn" id="undo"' + (k ? "" : " hidden") + '>↩ חזרה לקלף הקודם</button>' +
        (k >= 12 ? '<button class="linkbtn" id="skip">לבחירה ⭐</button>' : "") + "</div>";
      var sc = document.getElementById("sc"), done = false;
      say(S[i].n + ". " + t);
      function answer(d) {
        if (done) return; done = true;
        (d === "r" ? yes : d === "u" ? maybe : less).push(i);
        if (d === "r") { FUN.sfx("star", Math.min(yes.length, 4) - 1); FUN.confettiAt(sc, 12); }
        fling(sc, d, function () { k++; deal(); });
      }
      swipe(sc, answer, true);
      $$(".mbtns .btn").forEach(function (b) { b.onclick = function () { answer(b.dataset.d); }; });
      document.getElementById("undo").onclick = function () {
        k--; var p = order[k];
        [yes, maybe, less].forEach(function (a) { var j = a.indexOf(p); if (j >= 0) a.splice(j, 1); });
        FUN.sfx("soft"); cardScreen();
      };
      var sk = document.getElementById("skip"); if (sk) sk.onclick = function () { pick(); };
    }
    function pick() {
      top();
      var rest = S.map(function (x, i) { return i; }).filter(function (i) { return yes.indexOf(i) < 0; });
      var mine = [];
      function tile(i) { return '<button class="pk" data-i="' + i + '"><img src="' + S[i].src + '" alt=""><span>' + S[i].n + "</span></button>"; }
      app.innerHTML = '<div class="panel center"><h2 class="level-banner">⭐ ' + yes.length + " &nbsp; 🤔 " + maybe.length + " &nbsp; 🌱 " + less.length + "</h2>" +
        '<p class="big-t mt">' + T("עכשיו {בחר|בחרי} <b>3 עד 5</b> חוזקות שהכי בולטות בך") + "</p></div>" +
        (yes.length ? '<h3 class="sec">⭐ סימנת "ממש אני"</h3><div class="pick">' + yes.map(tile).join("") + "</div>" : "") +
        '<h3 class="sec">' + (yes.length ? "כל שאר החוזקות" : "כל החוזקות") + '</h3><div class="pick">' + rest.map(tile).join("") + "</div>" +
        '<div class="count" id="cnt">⭐ 0 / 5</div><div class="row"><button class="btn pink big" id="ok" disabled>אלה החוזקות שלי! ✨</button></div>';
      var cnt = document.getElementById("cnt"), ok = document.getElementById("ok");
      $$(".pk").forEach(function (b) {
        b.onclick = function () {
          var i = +b.dataset.i, j = mine.indexOf(i);
          if (j >= 0) { mine.splice(j, 1); b.classList.remove("on"); FUN.sfx("soft"); }
          else if (mine.length < 5) { mine.push(i); b.classList.add("on"); FUN.sfx("star", mine.length - 1); FUN.confettiAt(b, 10); }
          else { FUN.shake(cnt); FUN.sfx("soft"); }
          cnt.textContent = "⭐ " + mine.length + " / 5"; ok.disabled = mine.length < 3;
        };
      });
      ok.onclick = function () {
        st.mine = mine; st.less = less; save();
        finishStation(4, 3, '<div class="parade">' + mine.map(function (i, k2) { return '<img src="' + S[i].src + '" alt="" style="animation-delay:' + (k2 * 0.12) + 's">'; }).join("") + "</div>" +
          '<p class="all-msg">' + T("{ותזכור|ותזכרי}") + ": את כל 24 החוזקות אפשר לתרגל 💎<br>חלק בולטות עכשיו, וחלק עוד יגדלו 🌱</p>");
      };
    }
  }

  /* ---------- 6. חדר הכושר: בוחרים חוזקה, משימה, וטוענים כוח ---------- */
  function stGym() {
    var g = null, mis = null;
    chooseS();
    function chooseS() {
      top();
      var rec = st.less || [];
      var list = rec.concat(S.map(function (x, i) { return i; }).filter(function (i) { return rec.indexOf(i) < 0; }));
      app.innerHTML = head(T("איזו חוזקה {תרצה|תרצי} לאמן השבוע?") + (rec.length ? " 🌱 = מהמראה שלך" : "")) +
        '<div class="pick">' + list.map(function (i) {
          return '<button class="pk' + (rec.indexOf(i) >= 0 ? " rec" : "") + '" data-i="' + i + '"><img src="' + S[i].src + '" alt=""><span>' + S[i].n + "</span></button>";
        }).join("") + "</div>";
      $$(".pk").forEach(function (b) {
        b.onclick = function () { g = +b.dataset.i; b.classList.add("on"); FUN.sfx("pop"); FUN.confettiAt(b, 14); later(chooseM, 450); };
      });
    }
    function chooseM() {
      top();
      app.innerHTML = '<div class="panel center">' + card(g, "<p>" + T(S[g].t) + "</p>") +
        '<p class="big-t mt">' + T("{בחר|בחרי} משימת אימון:") + '</p><div class="mis">' + S[g].m.map(function (m, k) {
          return '<button class="misbtn" data-k="' + k + '"><span>' + "🎯" + "</span>" + T(m) + "</button>";
        }).join("") + "</div></div>";
      $$(".misbtn").forEach(function (b) {
        b.onclick = function () { mis = +b.dataset.k; b.classList.add("on"); FUN.sfx("good"); later(charge, 400); };
      });
    }
    function charge() {
      top();
      var p = 0, holding = false, raf = null, lastNote = 0;
      app.innerHTML = '<div class="panel center gym"><p class="big-t">' + T("{לחץ|לחצי} והחזק{|י} את הכפתור כדי לטעון את החוזקה!") + "</p>" +
        '<div class="power"><img src="' + S[g].src + '" alt="" id="pimg"><div class="pring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="bg"/><circle cx="60" cy="60" r="54" class="fg" id="pfg"/></svg></div></div>' +
        '<div class="pct" id="pct">0%</div><button class="hold" id="hold">⚡ ' + T("{החזק|החזיקי}") + "</button></div>";
      var fg = document.getElementById("pfg"), pct = document.getElementById("pct"), hold = document.getElementById("hold"), img = document.getElementById("pimg");
      var L = 2 * Math.PI * 54; fg.style.strokeDasharray = L; fg.style.strokeDashoffset = L;
      function tick() {
        if (holding) p = Math.min(100, p + 1.1); else p = Math.max(0, p - 0.4);
        fg.style.strokeDashoffset = L * (1 - p / 100); pct.textContent = Math.round(p) + "%";
        img.style.transform = "scale(" + (1 + p / 400) + ")"; img.style.filter = "saturate(" + (1 + p / 60) + ") brightness(" + (1 + p / 500) + ")";
        var step = Math.floor(p / 20); if (holding && step > lastNote) { lastNote = step; FUN.sfx("star", step - 1); FUN.confettiAt(img, 6); }
        if (p >= 100) { done(); return; }
        raf = requestAnimationFrame(tick);
      }
      function down(e) { e.preventDefault(); holding = true; hold.classList.add("on"); }
      function up() { holding = false; hold.classList.remove("on"); }
      hold.addEventListener("pointerdown", down); ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { hold.addEventListener(ev, up); });
      raf = requestAnimationFrame(tick);
      function done() {
        cancelAnimationFrame(raf); hold.remove();
        FUN.sfx("fanfare"); FUN.bigBanner("טעון! ⚡"); FUN.confettiSides(40);
        document.querySelector(".power").classList.add("full");
        var when = ["היום", "מחר", "בבית הספר", "בבית"];
        var box = document.createElement("div");
        box.innerHTML = '<p class="big-t mt">מתי?</p><div class="when">' + when.map(function (w) { return '<button class="chip">' + w + "</button>"; }).join("") + "</div>";
        document.querySelector(".gym").appendChild(box);
        Array.prototype.forEach.call(box.querySelectorAll(".chip"), function (c) {
          c.onclick = function () {
            st.grow = { i: g, m: T(S[g].m[mis]), w: c.textContent }; save(); FUN.sfx("good");
            finishStation(5, 3, '<div class="mission"><p>💪 <b>' + S[g].n + "</b>: " + st.grow.m + " (" + st.grow.w + ")</p></div>");
          };
        });
      }
    }
  }

  /* ---------- 7. משקפי החוזקות: כרטיס מחמאה ---------- */
  var WHO = [["👦", "חבר", 0], ["👧", "חברה", 1], ["🧒", "אח", 0], ["👧", "אחות", 1], ["👩", "אמא", 1], ["👨", "אבא", 0], ["👩‍🏫", "מורה", 1], ["👨‍🏫", "מורה", 0], ["👵", "סבתא", 1], ["👴", "סבא", 0]];
  function stSpot() {
    var who = null, s = null;
    stepWho();
    function stepWho() {
      top();
      app.innerHTML = head(T("{שים|שימי} משקפי חוזקות 🕶️ למי {תרצה|תרצי} לתת כרטיס מחמאה?")) +
        '<div class="whos">' + WHO.map(function (w, k) { return '<button class="who" data-k="' + k + '"><span>' + w[0] + "</span>" + w[1] + "</button>"; }).join("") + "</div>" +
        '<input class="name-in" id="wn" maxlength="16" placeholder="השם (לא חובה)">';
      $$(".who").forEach(function (b) {
        b.onclick = function () { who = WHO[+b.dataset.k].slice(); who.push(document.getElementById("wn").value.trim()); b.classList.add("on"); FUN.sfx("pop"); later(stepS, 350); };
      });
    }
    function stepS() {
      top();
      app.innerHTML = head(T("איזו חוזקה {ראית|ראית} אצל " + (who[3] || who[1]) + "?")) +
        '<div class="pick">' + S.map(function (x, i) { return '<button class="pk" data-i="' + i + '"><img src="' + x.src + '" alt=""><span>' + x.n + "</span></button>"; }).join("") + "</div>";
      $$(".pk").forEach(function (b) {
        b.onclick = function () { s = +b.dataset.i; b.classList.add("on"); FUN.sfx("pop"); later(stepWhen, 350); };
      });
    }
    var seen = "";
    function stepWhen() {
      top();
      app.innerHTML = '<div class="panel center">' + card(s) +
        '<p class="big-t mt">' + T("מתי {ראית|ראית} את החוזקה הזאת?") + ' <small class="opt-l">(לא חובה)</small></p>' +
        '<textarea class="when-in" id="wi" maxlength="120" rows="3" placeholder="למשל: כשעזרת לי להשלים את מה שהפסדתי כשלא הייתי בכיתה"></textarea>' +
        '<div class="row mt"><button class="btn pink big" id="mk">ליצור כרטיס 💌</button></div></div>';
      document.getElementById("mk").onclick = function () { seen = document.getElementById("wi").value.trim(); FUN.sfx("pop"); cardOut(); };
    }
    function cardOut() {
      top();
      var tg = who[2], to = who[3] || who[1];
      var line = (tg ? "ראיתי שאת " : "ראיתי שאתה ") + T(S[s].t, tg);
      app.innerHTML = '<div class="compliment" style="--c:' + S[s].c + '"><div class="cm-top">💌 ל' + esc(to) + "</div>" +
        '<img src="' + S[s].src + '" alt=""><div class="cm-name">' + S[s].n + "</div><p>" + esc(line) + "</p>" + (seen ? '<p class="cm-seen">שמתי לב ' + esc(seen) + "</p>" : "") +
        '<div class="cm-sign">' + (tg ? "תודה שאת כזאת! 💎" : "תודה שאתה כזה! 💎") + "</div></div>" +
        '<p class="big-t mt">' + T("{צלם|צלמי} את הכרטיס או {הקרא|הקריאי} אותו ל" + esc(to) + " 😊") + "</p>" +
        '<div class="row mt"><button class="btn pink big" id="go">' + "סיימתי! ✨" + "</button></div>";
      FUN.sfx("win"); FUN.confettiSides(30);
      document.getElementById("go").onclick = function () { finishStation(6, 3); };
    }
  }

  /* ---------- האוצר ---------- */
  function reveal() {
    top(); clearLater();
    var mine = (st.mine && st.mine.length) ? st.mine : [];
    var name = ""; /* השם לא נשמר בין משחקים */
    var cards = mine.map(function (i, k) { return '<div class="tcard" style="--c:' + S[i].c + ";animation-delay:" + (k * 0.2) + 's"><img src="' + S[i].src + '" alt=""><b>' + S[i].n + "</b><small>⭐ בולטת בי</small></div>"; }).join("");
    if (st.grow) cards += '<div class="tcard" style="--c:#8fd3b0;animation-delay:' + (mine.length * 0.2) + 's"><img src="' + S[st.grow.i].src + '" alt=""><b>' + S[st.grow.i].n + "</b><small>⚡ באימון</small></div>";
    app.innerHTML = '<div class="panel center cert"><div class="cert-badge">🏆</div>' +
      '<h2 class="hero-title" style="font-size:clamp(30px,8vw,48px)">' + T("{אלוף|אלופת} החוזקות") + "</h2>" +
      '<input class="name-in" id="nm" autocomplete="off" maxlength="20" placeholder="השם שלי" value="' + esc(name) + '">' +
      '<p class="all-msg mt">האוצר הוא <b>החוזקות שלך</b>!<br>ואת <b>כולן</b> אפשר לגדל ✨</p>' +
      '<div class="treasure">' + cards + "</div>" +
      (st.grow ? '<div class="mission"><p>💪 המשימה שלי: ' + esc(st.grow.m) + " (" + esc(st.grow.w) + ")</p></div>" : "") +
      '<p class="mt" style="font-size:20px;font-weight:800">💎 ' + st.gems + " יהלומים</p>" +
      '<div class="row mt no-print">' + (window.self === window.top ? '<button class="btn" id="pr">🖨️ הדפסה</button>' : "") +
      '<button class="btn ghost" id="map">💎 לתיבה</button><button class="btn ghost" id="again">🔄 משחקים שוב</button></div></div>';
    FUN.sfx("fanfare"); FUN.confetti(140); setTimeout(function () { FUN.confettiSides(50); }, 700);
    var pr = document.getElementById("pr"); if (pr) pr.onclick = function () { window.print(); };
    document.getElementById("map").onclick = function () { showMap(); };
    document.getElementById("again").onclick = function () { st = fresh(); save(); gemsUI(0); start(); };
  }

  if (st.seen && st.g) showMap(); else start();
})();
