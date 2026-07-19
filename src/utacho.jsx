import { useState, useEffect, useMemo, useRef } from "react";

// ---- デザイントークン(テーマ) ----
const THEMES = {
  night: {
    name: "ネオン",
    bg: "#131028",
    panel: "#1E1940",
    panelHi: "#2A2355",
    line: "#3A3170",
    lineStrong: "rgba(241,238,255,.55)", // キャンセル等セカンダリボタンの枠線
    text: "#F1EEFF",
    muted: "#9D95C9",
    magenta: "#FF4D8D",
    cyan: "#3EE6E0",
    amber: "#FFC94D",
    onAccent: "#fff", // magenta背景の上の文字色
    magentaSoft: "rgba(255,77,141,.18)",
    cyanSoft: "rgba(62,230,224,.15)",
    amberSoft: "rgba(255,201,77,.12)",
    overlay: "rgba(10,8,24,.75)",
    overlayDark: "rgba(10,8,24,.85)",
    glowMagenta: "rgba(255,77,141,.25)",
    shadowMagenta: "rgba(255,77,141,.35)",
    danger: "#FF5C5C",
  },
  otona: {
    name: "スイート",
    bg: "#F7F1EE",
    panel: "#FFFFFF",
    panelHi: "#F0E3E2",
    line: "#E4D4D2",
    lineStrong: "#B99FA4",
    text: "#4B383D",
    muted: "#A18A8E",
    magenta: "#C96F8B",
    cyan: "#639E92",
    amber: "#C0913D",
    onAccent: "#fff",
    magentaSoft: "rgba(201,111,139,.14)",
    cyanSoft: "rgba(99,158,146,.16)",
    amberSoft: "rgba(192,145,61,.14)",
    overlay: "rgba(75,56,61,.45)",
    overlayDark: "rgba(75,56,61,.6)",
    glowMagenta: "rgba(201,111,139,.3)",
    shadowMagenta: "rgba(201,111,139,.35)",
    danger: "#D9534F",
  },
  chic: {
    name: "シック",
    // 2026-07-13 ユーザーが🛠テーマ調整パネルで確定した配色:
    // マホガニー地×ペールシャンパン(主役と★を同色に)×スモーキーセージ
    bg: "#290200",
    panel: "#282624",
    panelHi: "#343130",
    line: "#413E3B",
    lineStrong: "rgba(236,233,229,.5)",
    text: "#ECE9E4",
    muted: "#A29C94",
    magenta: "#BCA97D",
    cyan: "#97A094",
    amber: "#BCA97D",
    onAccent: "#1E1D1B",
    magentaSoft: "rgba(168,131,74,.16)",
    cyanSoft: "rgba(151,160,148,.15)",
    amberSoft: "rgba(188,169,125,.14)",
    overlay: "rgba(18,17,16,.75)",
    overlayDark: "rgba(18,17,16,.85)",
    glowMagenta: "rgba(168,131,74,.25)",
    shadowMagenta: "rgba(168,131,74,.3)",
    danger: "#D96C62",
  },
  mode: {
    name: "モード",
    bg: "#0C0C0E",
    panel: "#18181B",
    panelHi: "#232327",
    line: "#333338",
    lineStrong: "rgba(255,255,255,.6)",
    text: "#F4F4F6",
    muted: "#909098",
    magenta: "#F4F4F6", // モノクロ: 主役は白
    cyan: "#A8A8B2",
    amber: "#D6D6DC",
    onAccent: "#0C0C0E", // 白ボタンの上は黒文字
    magentaSoft: "rgba(244,244,246,.14)",
    cyanSoft: "rgba(168,168,178,.16)",
    amberSoft: "rgba(214,214,220,.12)",
    overlay: "rgba(0,0,0,.78)",
    overlayDark: "rgba(0,0,0,.88)",
    glowMagenta: "rgba(244,244,246,.18)",
    shadowMagenta: "rgba(244,244,246,.2)",
    danger: "#FF4B4B",
  },
  simple: {
    name: "シンプル",
    bg: "#FAFAFA",
    panel: "#FFFFFF",
    panelHi: "#F0F0F3",
    line: "#E4E4E9",
    lineStrong: "#9C9CA6",
    text: "#26262B",
    muted: "#86868F",
    magenta: "#4C7DF0", // ブルーを主役に
    cyan: "#2AA198",
    amber: "#D9930D",
    onAccent: "#fff",
    magentaSoft: "rgba(76,125,240,.12)",
    cyanSoft: "rgba(42,161,152,.13)",
    amberSoft: "rgba(217,147,13,.12)",
    overlay: "rgba(38,38,43,.4)",
    overlayDark: "rgba(38,38,43,.55)",
    glowMagenta: "rgba(76,125,240,.25)",
    shadowMagenta: "rgba(76,125,240,.3)",
    danger: "#E5484D",
  },
  pop: {
    name: "ポップ",
    bg: "#FFF6C9", // ビビッドクリームイエロー地の多色ポップ
    panel: "#FFFFFF",
    panelHi: "#FFEC9E",
    line: "#F5D96B",
    lineStrong: "#D9A800",
    text: "#3A2E14",
    muted: "#9C8A4D",
    magenta: "#FF3E8F", // ホットピンク
    cyan: "#00B8C2", // ビビッドターコイズ
    amber: "#FF8A00", // ビビッドオレンジ
    onAccent: "#fff",
    magentaSoft: "rgba(255,62,143,.13)",
    cyanSoft: "rgba(0,184,194,.13)",
    amberSoft: "rgba(255,138,0,.15)",
    overlay: "rgba(58,46,20,.45)",
    overlayDark: "rgba(58,46,20,.6)",
    glowMagenta: "rgba(255,62,143,.3)",
    shadowMagenta: "rgba(255,62,143,.35)",
    danger: "#FF3B5C",
  },
};
const THEME_ORDER = ["night", "otona", "pop", "chic", "mode", "simple"];
// #rrggbb の体感輝度(0〜1)。明るいアクセント地に白文字を載せない判定に使う
const hexLum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
const getSavedTheme = () => {
  try {
    const t = localStorage.getItem("utacho-theme");
    return THEMES[t] ? t : "night";
  } catch (e) {
    return "night";
  }
};

const TAGS = ["練習中", "張り上げ", "歌い上げ"];
const STORAGE_KEY = "karaoke-repertoire";
const APP_VERSION = "2026-07-13u"; // 設定モーダルに表示。どのビルドが動いているかの確認用にデプロイごとに更新する

// Claude Artifacts では window.storage、通常のブラウザ(PWA)では localStorage を使う
const storage =
  typeof window !== "undefined" && window.storage
    ? window.storage
    : {
        async get(key) {
          const v = localStorage.getItem(key);
          return v === null ? null : { value: v };
        },
        async set(key, value) {
          localStorage.setItem(key, value);
        },
      };

const MACHINES = ["DAM", "JOYSOUND"]; // 採点機
// 採点技法メトリクス(曲の自己ベストとテイクの両方で使う)。int=trueは整数入力のみ
const TECH_METRICS = [
  { key: "pitchAcc", label: "音程", unit: "%", int: false, dashLabel: "音程正確率" },
  { key: "vibratoSec", label: "ビブラート", unit: "秒", int: false, dashLabel: "ビブラート最長" },
  { key: "shakuri", label: "しゃくり", unit: "回", int: true, dashLabel: "しゃくり最多" },
];

const emptyForm = {
  title: "",
  artist: "",
  keyShift: 0,
  ohako: false,
  score: "",
  scoreMachine: "", // "" | "DAM" | "JOYSOUND"
  pitchAcc: "", // 音程正確率(%)の自己ベスト
  vibratoSec: "", // ビブラート秒数の自己ベスト
  shakuri: "", // しゃくり回数の自己ベスト
  rangeLo: null, // 原曲最低音(MIDIノート番号)
  rangeHi: null, // 原曲最高音(MIDIノート番号)
  tags: [],
  memo: "",
};

// 新規テイクの採点機デフォルト用(最後に選んだ採点機を記憶)
const getLastMachine = () => {
  try {
    return localStorage.getItem("utacho-last-machine") || "";
  } catch (e) {
    return "";
  }
};
const setLastMachine = (m) => {
  try {
    localStorage.setItem("utacho-last-machine", m);
  } catch (e) {
    // 保存できなくても動作に影響なし
  }
};

function keyLabel(k) {
  if (k === 0) return "原曲";
  return k > 0 ? `♯${k}` : `♭${Math.abs(k)}`;
}

// ---- 音域(カラオケ表記 ⇔ MIDIノート番号) ----
// 音域サイト標準の表記。境界: low C2〜B2 / mid1 C3〜B3 / mid2 C4〜G#4 / hi A4〜G#5 / hihi A5〜(hi系のみA始まり)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToKaraoke(n) {
  if (n >= 69) {
    const rep = Math.floor((n - 69) / 12) + 1; // 1:hi 2:hihi 3:hihihi…
    return "hi".repeat(rep) + NOTE_NAMES[n % 12];
  }
  if (n >= 60) return "mid2" + NOTE_NAMES[n % 12];
  if (n >= 48) return "mid1" + NOTE_NAMES[n % 12];
  if (n >= 36) return "low" + NOTE_NAMES[n % 12];
  const rep = Math.floor((35 - n) / 12) + 2; // 2:lowlow 3:lowlowlow…
  return "low".repeat(rep) + NOTE_NAMES[n % 12];
}

function karaokeToMidi(str) {
  const m = String(str).trim().match(/^((?:hi)+|mid1|mid2|(?:low)+)([A-Ga-g][#♯]?)$/i);
  if (!m) return null;
  const note = NOTE_NAMES.indexOf(m[2].toUpperCase().replace("♯", "#"));
  if (note < 0) return null;
  const p = m[1].toLowerCase();
  if (p.startsWith("hi")) {
    const rep = p.length / 2; // hi=1, hihi=2…
    const baseC = 60 + 12 * rep; // hiC=72, hihiC=84…
    // hi系はA始まり: A/A#/B(hiA=69)はbaseCの1オクターブ下側、C〜G#はbaseC側
    return note >= 9 ? baseC - 12 + note : baseC + note;
  }
  if (p === "mid2") return 60 + note;
  if (p === "mid1") return 48 + note;
  return 36 - 12 * (p.length / 3 - 1) + note; // low=36, lowlow=24…
}

// 音域選択肢(lowC〜hihiG#)
const RANGE_OPTIONS = [];
for (let n = 36; n <= 92; n++) RANGE_OPTIONS.push(n);

// 音域ガイド(真ん中のド=ピアノ中央のC4=mid2Cを基準にした対応表)
const RANGE_GUIDE_ROWS = [
  { kara: "lowC〜lowB", note: "C2〜B2", desc: "真ん中のドの2オクターブ下", midi: 36 },
  { kara: "mid1C〜mid1B", note: "C3〜B3", desc: "真ん中のドの1オクターブ下", midi: 48 },
  { kara: "mid2C", note: "C4", desc: "★真ん中のド(ピアノ中央のド)", midi: 60, em: true },
  { kara: "mid2C#〜mid2G#", note: "C#4〜G#4", desc: "真ん中のドのすぐ上", midi: 61 },
  { kara: "hiA", note: "A4", desc: "チューニングの「ラ」(440Hz)", midi: 69, em: true },
  { kara: "hiC", note: "C5", desc: "真ん中のドの1オクターブ上", midi: 72, em: true },
  { kara: "hiC#〜hiG#", note: "C#5〜G#5", desc: "いわゆる「高音曲」の勝負どころ", midi: 73 },
  { kara: "hihiA〜", note: "A5〜", desc: "さらに上(女性キー曲の最高音域)", midi: 81 },
];

const rangeLabel = (lo, hi, shift = 0) =>
  `${midiToKaraoke(lo + shift)}〜${midiToKaraoke(hi + shift)}`;

// メモは「｜」区切り・1行1曲のmd書式と衝突するため、書き出し時にエスケープする
// (⏎ と ¦ はメモ内の予約文字扱い。取り込みで逆変換される)
const escapeMemo = (m) => m.replace(/｜/g, "¦").replace(/\r?\n/g, "⏎");
const unescapeMemo = (m) => m.replace(/⏎/g, "\n").replace(/¦/g, "｜");

// ---- Markdownパーサー(「MDで書き出す」形式の逆変換) ----
// 行形式: - **曲名** / アーティスト｜キー♯n｜90点｜★十八番｜タグ・タグ｜メモ: …
function parseMarkdown(text) {
  const songs = [];
  const errors = [];
  const idOf = (s) => `${s.title}__${s.artist}`;
  const seen = new Map(); // 同一キーは後勝ち
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.trim();
    if (!line.startsWith("- ")) return; // 見出し・空行はスキップ
    const m = line.match(/^-\s+\*\*(.+)\*\*(.*)$/);
    if (!m) {
      errors.push(`${idx + 1}行目: 「- **曲名**」の形式で読み取れませんでした`);
      return;
    }
    const song = { title: m[1].trim(), artist: "", keyShift: 0, ohako: false, score: "", scoreMachine: "", pitchAcc: "", vibratoSec: "", shakuri: "", rangeLo: null, rangeHi: null, tags: [], memo: "" };
    const segs = m[2].split("｜");
    const head = segs.shift().trim(); // " / アーティスト" または空
    if (head.startsWith("/")) song.artist = head.slice(1).trim();
    else if (head) song.artist = head;
    for (const segRaw of segs) {
      const seg = segRaw.trim();
      if (!seg) continue; // 末尾「｜」などの空セグメントは許容
      let km;
      if ((km = seg.match(/^キー([♯♭])(\d+)$/))) {
        song.keyShift = km[1] === "♯" ? Number(km[2]) : -Number(km[2]);
      } else if ((km = seg.match(/^([0-9.]+)点(?:\((DAM|JOYSOUND)\))?$/))) {
        song.score = km[1];
        song.scoreMachine = km[2] || "";
      } else if ((km = seg.match(/^音程([0-9.]+)%$/))) {
        song.pitchAcc = km[1];
      } else if ((km = seg.match(/^ビブ(?:ラート)?([0-9.]+)秒$/))) {
        song.vibratoSec = km[1];
      } else if ((km = seg.match(/^しゃくり([0-9]+)回$/))) {
        song.shakuri = km[1];
      } else if ((km = seg.match(/^音域(\S+)〜(\S+)$/))) {
        const lo = karaokeToMidi(km[1]);
        const hi = karaokeToMidi(km[2]);
        if (lo !== null && hi !== null) {
          song.rangeLo = lo;
          song.rangeHi = hi;
        }
        // 変換できない表記はタグに落とさず無視
      } else if (seg === "★十八番") {
        song.ohako = true;
      } else if (/^メモ[::]/.test(seg)) {
        song.memo = unescapeMemo(seg.replace(/^メモ[::]\s*/, ""));
      } else {
        seg.split("・").forEach((t) => {
          const tag = t.trim();
          if (tag && !song.tags.includes(tag)) song.tags.push(tag);
        });
      }
    }
    seen.set(idOf(song), song);
  });
  seen.forEach((s) => songs.push(s));
  return { songs, errors };
}

const songKey = (s) => `${s.title}__${s.artist}`;

// ---- 録音ストレージ(IndexedDB) ----
// 音声はサイズが大きいため localStorage ではなく IndexedDB に保存する。
// takes(メタのみ・起動時に全読み込み)と blobs(音声本体・再生時のみ取得)の2ストア構成。
// 曲との紐付けは songKey(md再取り込みで曲データが上書きされても紐付きが保たれる)。
const REC_DB = "utacho-rec";
const recSupported =
  typeof window !== "undefined" &&
  !!(window.indexedDB && window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

function openRecDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(REC_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      const takes = db.createObjectStore("takes", { keyPath: "id" });
      takes.createIndex("songKey", "songKey");
      db.createObjectStore("blobs", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function recLoadMeta() {
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction("takes", "readonly").objectStore("takes").getAll();
    req.onsuccess = () => { db.close(); resolve(req.result || []); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function recSave(meta, blob) {
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["takes", "blobs"], "readwrite");
    tx.objectStore("takes").put(meta);
    tx.objectStore("blobs").put({ id: meta.id, blob });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function recPutMeta(meta) {
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("takes", "readwrite");
    tx.objectStore("takes").put(meta);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function recGetBlob(id) {
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction("blobs", "readonly").objectStore("blobs").get(id);
    req.onsuccess = () => { db.close(); resolve(req.result ? req.result.blob : null); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function recDeleteIds(ids) {
  if (ids.length === 0) return;
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["takes", "blobs"], "readwrite");
    ids.forEach((id) => {
      tx.objectStore("takes").delete(id);
      tx.objectStore("blobs").delete(id);
    });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function recRenameSongKey(oldKey, newKey) {
  const db = await openRecDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("takes", "readwrite");
    const req = tx.objectStore("takes").index("songKey").openCursor(IDBKeyRange.only(oldKey));
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        cur.update({ ...cur.value, songKey: newKey });
        cur.continue();
      }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

const fmtRecTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
const fmtRecDate = (ts) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const fmtRecSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`);

const isSameSong = (a, b) =>
  (a.keyShift || 0) === (b.keyShift || 0) &&
  !!a.ohako === !!b.ohako &&
  String(a.score || "") === String(b.score || "") &&
  (a.scoreMachine || "") === (b.scoreMachine || "") &&
  String(a.pitchAcc || "") === String(b.pitchAcc || "") &&
  String(a.vibratoSec || "") === String(b.vibratoSec || "") &&
  String(a.shakuri || "") === String(b.shakuri || "") &&
  (a.rangeLo ?? null) === (b.rangeLo ?? null) &&
  (a.rangeHi ?? null) === (b.rangeHi ?? null) &&
  (a.memo || "") === (b.memo || "") &&
  (a.tags || []).join("・") === (b.tags || []).join("・");

export default function KaraokeApp() {
  const [theme, setTheme] = useState(getSavedTheme);
  // 開発用のテーマ上書き(🛠テーマ調整パネルで編集。テーマごとにこの端末へ保存)
  const [themeTweaks, setThemeTweaks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("utacho-theme-tweaks")) || {};
    } catch (e) {
      return {};
    }
  });
  const [devToolOpen, setDevToolOpen] = useState(false); // 🛠テーマ調整パネル
  const [devCopied, setDevCopied] = useState(false);
  const C = useMemo(() => ({ ...THEMES[theme], ...(themeTweaks[theme] || {}) }), [theme, themeTweaks]);

  const saveThemeTweaks = (next) => {
    setThemeTweaks(next);
    try {
      localStorage.setItem("utacho-theme-tweaks", JSON.stringify(next));
    } catch (e) {
      /* 保存できなくてもセッション内では有効 */
    }
  };
  const setThemeToken = (key, value) =>
    saveThemeTweaks({ ...themeTweaks, [theme]: { ...(themeTweaks[theme] || {}), [key]: value } });
  const resetThemeTweaks = () => {
    const next = { ...themeTweaks };
    delete next[theme];
    saveThemeTweaks(next);
  };
  // 現在の見た目をTHEMESにそのまま貼れる形式でコピー
  const copyThemeCode = async () => {
    const code = Object.keys(THEMES[theme])
      .filter((k) => k !== "name")
      .map((k) => `    ${k}: ${JSON.stringify(C[k])},`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(code);
      setDevCopied(true);
      setTimeout(() => setDevCopied(false), 1500);
    } catch (e) {
      /* クリップボード不可の環境では何もしない */
    }
  };
  const [songs, setSongs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [modal, setModal] = useState(null); // null | {mode:'add'} | {mode:'edit', id}
  const [form, setForm] = useState(emptyForm);
  const [pick, setPick] = useState(null); // ランダム選曲結果
  const [rolling, setRolling] = useState(false);
  const [exportText, setExportText] = useState(null); // MDエクスポート
  const [copyState, setCopyState] = useState("idle"); // idle | done | manual
  const [importText, setImportText] = useState(null); // MDインポート(null=モーダル非表示)
  const [settingsOpen, setSettingsOpen] = useState(false); // ⚙️設定モーダル
  const [tab, setTab] = useState("songs"); // 下部タブ: songs | queue | recs | dash
  const [rangeGuideOpen, setRangeGuideOpen] = useState(false); // 音域ガイド
  // 次歌う曲リスト(キュー)。順序が歌う順。mdには含めない端末ローカルの当日用リスト
  const [queue, setQueue] = useState(() => {
    try {
      const q = JSON.parse(localStorage.getItem("utacho-queue"));
      return Array.isArray(q) ? q : [];
    } catch (e) {
      return [];
    }
  });
  const [confirmDelete, setConfirmDelete] = useState(false); // 曲削除の2段階確認
  const [confirmTagDelete, setConfirmTagDelete] = useState(null); // 削除確認中のカスタムタグ名
  const [recMeta, setRecMeta] = useState([]); // 録音メタ一覧(blobは含まない)
  const [recState, setRecState] = useState(null); // null | {key, elapsed} 録音中
  const [recError, setRecError] = useState(null);
  const [playingId, setPlayingId] = useState(null); // 再生中テイクid
  const [playPaused, setPlayPaused] = useState(false); // 再生の一時停止中
  const [playPos, setPlayPos] = useState(0); // 再生位置(秒)
  const [recSort, setRecSort] = useState("dateDesc"); // 録音一覧のソート
  const [assignTake, setAssignTake] = useState(null); // 曲選択モーダルを開いているテイクid
  const [assignQuery, setAssignQuery] = useState(""); // 曲選択モーダル内の検索
  const [recContinuous, setRecContinuous] = useState(true); // 連続再生(終わったら次のテイクへ)
  const [recRepeat, setRecRepeat] = useState(false); // リピート(連続ONなら全体ループ、OFFなら1本ループ)
  const [confirmTake, setConfirmTake] = useState(null); // テイク削除の2段階確認
  const [artistSearch, setArtistSearch] = useState(null); // null | "loading" | {results} | {error}
  const [newTag, setNewTag] = useState(null); // null=非表示 / 文字列=タグ追加入力中
  const [sheetDrag, setSheetDrag] = useState(0); // 編集シートのスワイプ追従量(px)(id)
  const rollRef = useRef(null);
  const exportRef = useRef(null);
  const fileRef = useRef(null);
  const recRef = useRef(null); // {recorder, stream}
  const recTimerRef = useRef(null);
  const audioRef = useRef(null); // {audio, url} Audio要素は使い回す(iOSの自動再生制限対策)
  const playingTakeRef = useRef(null); // 再生中テイク(連続再生の次テイク決定用)
  const playingFromListRef = useRef(false); // 録音タブ発の再生か(true=連続/リピート適用。編集シート発は1本で停止)
  const onTakeEndedRef = useRef(null); // 再生終了時の挙動(毎レンダー更新して最新のソート順・モードを参照)
  const sheetStartRef = useRef(null); // スワイプ開始Y座標

  const buildMarkdown = () => {
    const sorted = [...songs].sort((a, b) =>
      (a.artist || "").localeCompare(b.artist || "", "ja") || a.title.localeCompare(b.title, "ja")
    );
    const lines = sorted.map((s) => {
      const parts = [`**${s.title}**` + (s.artist ? ` / ${s.artist}` : "")];
      if (s.keyShift) parts.push(`キー${keyLabel(s.keyShift)}`);
      if (s.rangeLo != null && s.rangeHi != null) parts.push(`音域${rangeLabel(s.rangeLo, s.rangeHi)}`);
      if (s.score) parts.push(`${s.score}点${s.scoreMachine ? `(${s.scoreMachine})` : ""}`);
      if (s.pitchAcc) parts.push(`音程${s.pitchAcc}%`);
      if (s.vibratoSec) parts.push(`ビブラート${s.vibratoSec}秒`);
      if (s.shakuri) parts.push(`しゃくり${s.shakuri}回`);
      if (s.ohako) parts.push("★十八番");
      if (s.tags && s.tags.length) parts.push(s.tags.join("・"));
      if (s.memo) parts.push(`メモ: ${escapeMemo(s.memo)}`);
      return `- ${parts.join("｜")}`;
    });
    const d = new Date();
    const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    return `# 持ち歌リスト(${songs.length}曲) ${date}時点\n\n${lines.join("\n")}\n`;
  };

  const openExport = () => {
    setCopyState("idle");
    setExportText(buildMarkdown());
  };

  const copyExport = async () => {
    // 1) 標準のクリップボードAPI
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(exportText);
        setCopyState("done");
        return;
      }
    } catch (e) {
      // ブロックされた場合は次の方法へ
    }
    // 2) テキストエリアを全選択して execCommand
    try {
      const ta = exportRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        if (ok) {
          setCopyState("done");
          return;
        }
      }
    } catch (e) {
      // これも不可なら手動コピーへ
    }
    // 3) どちらも不可: 全選択した状態にして手動コピーを案内
    const ta = exportRef.current;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(0, ta.value.length);
    }
    setCopyState("manual");
  };

  const downloadExport = () => {
    const blob = new Blob([exportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "持ち歌リスト.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // インポート差分(貼り付けテキストと現リストの比較)
  const importPreview = useMemo(() => {
    if (importText === null) return null;
    const { songs: parsed, errors } = parseMarkdown(importText);
    const existing = new Map(songs.map((s) => [songKey(s), s]));
    const parsedKeys = new Set(parsed.map(songKey));
    let added = 0, updated = 0, unchanged = 0;
    parsed.forEach((p) => {
      const cur = existing.get(songKey(p));
      if (!cur) added++;
      else if (isSameSong(cur, p)) unchanged++;
      else updated++;
    });
    const appOnly = songs.filter((s) => !parsedKeys.has(songKey(s))).length;
    return { parsed, errors, added, updated, unchanged, appOnly };
  }, [importText, songs]);

  // 追加・更新のみ: mdに無いアプリ側の曲は残す(曲の削除はアプリ上の操作でのみ行う)
  const applyImport = () => {
    if (!importPreview || importPreview.parsed.length === 0) return;
    const now = Date.now();
    const existing = new Map(songs.map((s) => [songKey(s), s]));
    const merged = new Map(existing);
    importPreview.parsed.forEach((p, i) => {
      const cur = existing.get(songKey(p));
      merged.set(
        songKey(p),
        cur
          ? { ...cur, ...p, id: cur.id, createdAt: cur.createdAt }
          : { ...p, id: `imp_${now}_${i}`, createdAt: now - i }
      );
    });
    persist(Array.from(merged.values()));
    setImportText(null);
  };

  // ファイルからmdを読み込んでインポート欄へ
  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ""));
    reader.readAsText(file);
    e.target.value = "";
  };

  // iOSの共有シート(ファイルに保存/AirDrop)へ。非対応環境はダウンロードにフォールバック
  const canShareFile = typeof navigator !== "undefined" && typeof navigator.canShare === "function";
  const shareExport = async () => {
    try {
      const file = new File([exportText], "持ち歌リスト.md", { type: "text/markdown" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // ユーザーが共有をキャンセル
    }
    downloadExport();
  };

  // 読み込み(データ登録は「MDを取り込む」から行う)
  useEffect(() => {
    (async () => {
      let list = [];
      try {
        const res = await storage.get(STORAGE_KEY);
        if (res && res.value) list = JSON.parse(res.value);
      } catch (e) {
        // 初回はキーが無いので何もしない
      }
      setSongs(list);
      setLoaded(true);
    })();
    if (recSupported) {
      recLoadMeta().then(setRecMeta).catch(() => {});
    }
  }, []);

  const selectTheme = (key) => {
    setTheme(key);
    try {
      localStorage.setItem("utacho-theme", key);
    } catch (e) {
      // 保存できなくても切替自体は有効
    }
  };

  // ステータスバー色・body背景をテーマに追従させる
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEMES[theme].bg);
    document.body.style.background = THEMES[theme].bg;
  }, [theme]);

  // 保存
  const persist = async (next) => {
    setSongs(next);
    try {
      await storage.set(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("保存に失敗しました", e);
    }
  };

  const filtered = useMemo(() => {
    let list = songs.filter((s) => {
      const q = query.trim().toLowerCase();
      const hitQ =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q);
      const hitT = !tagFilter || (tagFilter === "十八番" ? s.ohako : s.tags.includes(tagFilter));
      return hitQ && hitT;
    });
    const col = {
      added: (a, b) => b.createdAt - a.createdAt,
      title: (a, b) => a.title.localeCompare(b.title, "ja"),
      artist: (a, b) => a.artist.localeCompare(b.artist, "ja"),
      score: (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0),
    };
    return [...list].sort(col[sortBy]);
  }, [songs, query, tagFilter, sortBy]);

  // タグ一覧は定数+登録曲から動的に導出(mdで増えた未知タグも扱える)
  const allTags = useMemo(() => {
    const set = new Set(TAGS);
    songs.forEach((s) => (s.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [songs]);

  // 登録済みアーティスト(入力候補のdatalist用)
  const allArtists = useMemo(() => {
    const set = new Set(songs.map((s) => s.artist).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [songs]);

  // ---- 曲名からアーティスト候補を取得 ----
  const jsonpSeq = useRef(0); // JSONPコールバック名の衝突防止用の連番
  const searchGen = useRef(0); // 検索の世代番号。モーダル閉/別曲オープン後に古い結果を表示しないため

  // JSONPヘルパー。iTunes/DeezerはCORSヘッダーを返さないためfetchできず、scriptタグで呼ぶ
  const jsonp = (url, timeoutMs) =>
    new Promise((resolve, reject) => {
      const cb = `__utachoJsonp${++jsonpSeq.current}`;
      const script = document.createElement("script");
      const cleanup = () => {
        clearTimeout(timer);
        // タイムアウト後に遅延到着したレスポンスが呼んでもエラーにならないよう、
        // 即deleteせず自己削除するno-opを残す
        window[cb] = () => {
          delete window[cb];
        };
        script.remove();
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("jsonp timeout"));
      }, timeoutMs);
      window[cb] = (data) => {
        cleanup();
        resolve(data);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error("jsonp load error"));
      };
      script.src = `${url}&callback=${cb}`;
      document.body.appendChild(script);
    });

  // iTunes: 人気順で日本のカタログに強い本命。ただしiOSのブラウザ(Safari/Chrome共にWebKit)からは
  // AppleサーバーがUA判定で musics:// スキーム(Apple Musicアプリ)へ301リダイレクトするため呼べない
  const searchItunes = (term) =>
    jsonp(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=JP&media=music&entity=song&limit=10&lang=ja_jp`,
      5000
    ).then((data) =>
      (data.results || [])
        .filter((r) => r.artistName)
        .map((r) => ({ artist: r.artistName, track: r.trackName }))
    );

  // Deezer: iOSでも使える人気順ソース(JSONP対応・UAリダイレクトなし)
  const searchDeezer = (term) =>
    jsonp(`https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=10&output=jsonp`, 5000).then(
      (data) => {
        // DeezerはAPIエラー(クォータ超過等)もHTTP 200のJSONPで {error:{...}} として返す
        if (data.error) throw new Error(data.error.message || "deezer error");
        return (data.data || [])
          .filter((r) => r.artist && r.artist.name)
          .map((r) => ({ artist: r.artist.name, track: r.title }));
      }
    );

  // MusicBrainz: CORS対応でfetchできる最終フォールバック。
  // 人気順ソートがないため一般的な曲名は同名曲に埋もれやすい
  const searchMusicBrainz = async (term) => {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), 8000);
    try {
      // Luceneクエリのフレーズ内では \ と " をエスケープする必要がある
      const q = `recording:"${term.replace(/[\\"]/g, (m) => "\\" + m)}"`;
      const url = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(q)}&fmt=json&limit=15`;
      const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.recordings || [])
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .filter((r) => r["artist-credit"] && r["artist-credit"][0] && r["artist-credit"][0].name)
        .map((r) => ({
          // 「DAOKO × 米津玄師」「明透 feat. 存流」のような複数クレジットをjoinphraseで連結する
          artist: r["artist-credit"].map((a) => a.name + (a.joinphrase || "")).join(""),
          track: r.title,
        }));
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const searchArtist = async () => {
    const term = form.title.trim();
    if (!term || artistSearch === "loading") return;
    const gen = ++searchGen.current;
    setArtistSearch("loading");
    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
    const sources = isIOS ? [searchDeezer, searchMusicBrainz] : [searchItunes, searchDeezer, searchMusicBrainz];
    let list = [];
    let anyOk = false;
    for (const search of sources) {
      try {
        list = await search(term);
        anyOk = true;
      } catch (e) {
        /* 次のソースへ */
      }
      if (searchGen.current !== gen) return; // この検索は無効化された(モーダル閉・別曲オープン等)
      if (list.length > 0) break;
    }
    if (!anyOk) {
      setArtistSearch({ error: true });
      return;
    }
    // 曲名+アーティストの組で重複除去(同名の別アーティスト・同アーティストの別表記の両方を残す)
    const seen = new Set();
    const results = list
      .filter((r) => {
        if (!r.artist) return false;
        const k = `${r.track || ""}__${r.artist}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 5);
    setArtistSearch({ results });
  };

  // 実行中の検索を無効化しつつ候補表示をリセットする
  const resetArtistSearch = () => {
    searchGen.current++;
    setArtistSearch(null);
  };

  // 曲ごとの録音テイク数(カードのバッジ用)
  const recCounts = useMemo(() => {
    const map = new Map();
    recMeta.forEach((t) => map.set(t.songKey, (map.get(t.songKey) || 0) + 1));
    return map;
  }, [recMeta]);

  // ---- ダッシュボード統計 ----
  const stats = useMemo(() => {
    const scored = songs.filter((s) => Number(s.score) > 0);
    const byMachine = MACHINES.map((m) => {
      const list = scored.filter((s) => s.scoreMachine === m);
      return {
        machine: m,
        count: list.length,
        avg: list.length ? list.reduce((a, s) => a + Number(s.score), 0) / list.length : null,
        best: list.reduce((b, s) => (!b || Number(s.score) > Number(b.score) ? s : b), null),
      };
    });
    const binDefs = [
      { label: "〜79", min: 0, max: 80 },
      { label: "80〜84", min: 80, max: 85 },
      { label: "85〜89", min: 85, max: 90 },
      { label: "90〜92", min: 90, max: 93 },
      { label: "93〜95", min: 93, max: 96 },
      { label: "96〜", min: 96, max: 1000 },
    ];
    const bins = binDefs.map((b) => ({
      ...b,
      count: scored.filter((s) => {
        const v = Number(s.score);
        return v >= b.min && v < b.max;
      }).length,
    }));
    const maxBin = Math.max(1, ...bins.map((b) => b.count));
    const top = [...scored].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 5);
    // 実効音域(キー変更込み)の最高・最低
    let hiSong = null;
    let loSong = null;
    songs.forEach((s) => {
      if (s.rangeLo == null || s.rangeHi == null) return;
      const hi = s.rangeHi + (s.keyShift || 0);
      const lo = s.rangeLo + (s.keyShift || 0);
      if (!hiSong || hi > hiSong.v) hiSong = { v: hi, s };
      if (!loSong || lo < loSong.v) loSong = { v: lo, s };
    });
    // 練習ログ(録音ベース)
    const now = Date.now();
    const takes30 = recMeta.filter((t) => now - t.createdAt < 30 * 86400000).length;
    const days30 = new Set(
      recMeta
        .filter((t) => now - t.createdAt < 30 * 86400000)
        .map((t) => new Date(t.createdAt).toDateString())
    ).size;
    const recentTakes = [...recMeta].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    const titleByKey = new Map(songs.map((s) => [songKey(s), s.title]));
    // 技法別自己ベスト(曲の値=手入力とテイクからの自動反映の両方を含む)
    const techBest = TECH_METRICS.map((mt) => {
      let best = null;
      songs.forEach((s) => {
        const v = Number(s[mt.key]);
        if (s[mt.key] && v > 0 && (!best || v > best.v)) best = { v, s };
      });
      return { ...mt, best };
    }).filter((mt) => mt.best);
    return {
      total: songs.length,
      scoredCount: scored.length,
      ohako: songs.filter((s) => s.ohako).length,
      over90: scored.filter((s) => Number(s.score) >= 90).length,
      byMachine, bins, maxBin, top, hiSong, loSong, techBest,
      takesTotal: recMeta.length, takes30, days30, recentTakes, titleByKey,
    };
  }, [songs, recMeta]);

  // 編集中の元の曲(録音の紐付け・削除確認に使う。formは未保存の編集値なので使わない)
  const editingSong = modal && modal.mode === "edit" ? songs.find((s) => s.id === modal.id) : null;
  const editingRecs = editingSong
    ? recMeta.filter((t) => t.songKey === songKey(editingSong)).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  // 同じ曲名+アーティストの既登録曲(重複警告用)
  const dupSong = useMemo(() => {
    if (!modal) return null;
    const t = form.title.trim();
    if (!t) return null;
    const a = form.artist.trim();
    return songs.find((s) => s.title === t && s.artist === a && s.id !== modal.id) || null;
  }, [modal, form.title, form.artist, songs]);

  const stopPlayback = () => {
    const cur = audioRef.current;
    if (cur) {
      cur.audio.pause();
      if (cur.url) URL.revokeObjectURL(cur.url);
      cur.url = null;
      // Audio要素自体は破棄しない: ユーザー操作で有効化済みの要素を使い回すことで
      // iOSでもonendedからの連続再生(src差し替え)が許可される
    }
    playingTakeRef.current = null;
    playingFromListRef.current = false;
    setPlayingId(null);
    setPlayPaused(false);
    setPlayPos(0);
  };

  // 編集モードの変更を曲リストへ反映する(自動保存の本体。曲名が空の間は保留)
  const applyEdit = () => {
    if (!modal || modal.mode !== "edit") return;
    if (!form.title.trim()) return;
    const orig = songs.find((s) => s.id === modal.id);
    if (!orig) return;
    const updated = { ...orig, ...form, title: form.title.trim(), artist: form.artist.trim() };
    if (orig.title === updated.title && orig.artist === updated.artist && isSameSong(orig, updated)) return;
    // 曲名/アーティストが変わったら録音の紐付け(songKey)も追随させる
    if (songKey(orig) !== songKey(updated)) {
      const oldKey = songKey(orig);
      const newKey = songKey(updated);
      recRenameSongKey(oldKey, newKey).catch(() => {});
      setRecMeta((m) => m.map((t) => (t.songKey === oldKey ? { ...t, songKey: newKey } : t)));
    }
    persist(songs.map((s) => (s.id === modal.id ? updated : s)));
  };

  // 編集モードでは入力の少し後に自動保存する(閉じる時はcloseModalが即時確定する)
  useEffect(() => {
    if (!modal || modal.mode !== "edit") return;
    const timer = setTimeout(applyEdit, 600);
    return () => clearTimeout(timer);
  }, [form, modal, songs]);

  // モーダル表示中は背面(曲リスト)をスクロールさせない。
  // iOSはoverflow:hiddenだけでは止まらないため position:fixed 方式でロックする
  const anyModalOpen =
    modal !== null || settingsOpen || rangeGuideOpen || assignTake !== null ||
    importText !== null || exportText !== null || pick !== null;
  useEffect(() => {
    if (!anyModalOpen) return;
    const y = window.scrollY;
    const b = document.body.style;
    b.position = "fixed";
    b.top = `-${y}px`;
    b.left = "0";
    b.right = "0";
    b.overflow = "hidden";
    return () => {
      b.position = "";
      b.top = "";
      b.left = "";
      b.right = "";
      b.overflow = "";
      window.scrollTo(0, y); // 閉じた時に元のスクロール位置へ復元
    };
  }, [anyModalOpen]);

  const closeModal = (opts) => {
    if (!(opts && opts.skipFlush)) applyEdit(); // 自動保存待ちの変更を確定(削除時はスキップ)
    stopPlayback();
    const r = recRef.current;
    if (r && r.recorder.state !== "inactive") r.recorder.stop(); // 録音中なら停止して保存
    setConfirmDelete(false);
    setConfirmTake(null);
    setRecError(null);
    resetArtistSearch();
    setNewTag(null);
    setConfirmTagDelete(null);
    setSheetDrag(0);
    sheetStartRef.current = null;
    setModal(null);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setConfirmDelete(false);
    resetArtistSearch();
    setNewTag(null);
    setConfirmTagDelete(null);
    setSheetDrag(0);
    setModal({ mode: "add" });
  };
  const openEdit = (s) => {
    // emptyFormを先に敷いて、旧バージョンで保存された曲に無いフィールド(技法など)を空文字で補完
    setForm({ ...emptyForm, ...s, score: s.score ?? "" });
    setConfirmDelete(false);
    setConfirmTake(null);
    setRecError(null);
    resetArtistSearch();
    setNewTag(null);
    setConfirmTagDelete(null);
    setSheetDrag(0);
    setModal({ mode: "edit", id: s.id });
  };

  // 新規追加の確定(編集は自動保存なのでこの関数を通らない)
  const save = () => {
    if (!form.title.trim() || modal.mode !== "add") return;
    const s = {
      ...form,
      title: form.title.trim(),
      artist: form.artist.trim(),
      id: `s_${Date.now()}`,
      createdAt: Date.now(),
    };
    persist([s, ...songs]);
    closeModal();
  };

  // カスタムタグを全曲から削除する(プリセットタグは削除不可)
  const deleteTagEverywhere = (t) => {
    persist(songs.map((s) => (s.tags.includes(t) ? { ...s, tags: s.tags.filter((x) => x !== t) } : s)));
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
    if (tagFilter === t) setTagFilter(null);
    setConfirmTagDelete(null);
  };

  const remove = () => {
    if (editingSong) {
      const key = songKey(editingSong);
      const ids = recMeta.filter((t) => t.songKey === key).map((t) => t.id);
      recDeleteIds(ids).catch(() => {});
      setRecMeta((m) => m.filter((t) => t.songKey !== key));
    }
    persist(songs.filter((s) => s.id !== modal.id));
    closeModal({ skipFlush: true }); // 削除した曲を自動保存が復活させないようにする
  };

  // ---- 録音 ----
  // key="" はクイック録音(曲未設定)。停止後に曲選択モーダルで紐付ける
  const startRecording = async (key) => {
    if (recState) return; // 二重録音防止
    setRecError(null);
    stopPlayback();
    try {
      // カラオケ録音では音声通話向けの処理(エコーキャンセル/ノイズ抑制/自動ゲイン)が
      // 録音開始数秒後に効き始め、歌声や伴奏を削って「こもった音質」になる。生音で録るため明示的に無効化する。
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const mime =
        ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((t) => window.MediaRecorder.isTypeSupported(t)) || "";
      // 録音品質を上げるため音声ビットレートを明示(ブラウザ既定より高音質側に固定)
      const recorder = new MediaRecorder(stream, {
        ...(mime ? { mimeType: mime } : {}),
        audioBitsPerSecond: 256000,
      });
      const chunks = [];
      const startedAt = Date.now();
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop()); // マイク解放
        clearInterval(recTimerRef.current);
        setRecState(null);
        recRef.current = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/mp4" });
        if (blob.size === 0) return;
        const meta = {
          id: `rec_${Date.now()}`,
          songKey: key,
          createdAt: startedAt,
          duration: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
          size: blob.size,
          mimeType: blob.type,
          score: "",
          machine: getLastMachine(),
          pitchAcc: "",
          vibratoSec: "",
          shakuri: "",
        };
        try {
          await recSave(meta, blob);
          setRecMeta((m) => [...m, meta]);
          if (key === "") setAssignTake(meta.id); // クイック録音は保存後に曲選択を開く
        } catch (err) {
          setRecError("録音の保存に失敗しました");
        }
      };
      recRef.current = { recorder, stream };
      recorder.start();
      // 容量逼迫時にブラウザが録音データを消さないよう永続化を要求(拒否されても動作は変わらない)
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      setRecState({ key, elapsed: 0 });
      recTimerRef.current = setInterval(() => {
        setRecState((r) => (r ? { ...r, elapsed: Math.round((Date.now() - startedAt) / 1000) } : r));
      }, 500);
    } catch (e) {
      setRecError("マイクを使えませんでした。マイクの使用許可を確認してください。");
    }
  };

  const stopRecording = () => {
    const r = recRef.current;
    if (r && r.recorder.state !== "inactive") r.recorder.stop();
  };

  const playTake = async (t, { restart = false, fromList = false } = {}) => {
    if (!restart && playingId === t.id) {
      stopPlayback();
      return;
    }
    try {
      const blob = await recGetBlob(t.id);
      if (!blob) {
        setRecError("録音データが見つかりませんでした");
        return;
      }
      let cur = audioRef.current;
      if (!cur) {
        const audio = new Audio();
        // 秒単位に丸めてstateが変わった時だけ再レンダーさせる
        audio.ontimeupdate = () => setPlayPos(Math.floor(audio.currentTime));
        audio.onended = () => {
          const h = onTakeEndedRef.current;
          if (h) h();
          else stopPlayback();
        };
        cur = { audio, url: null };
        audioRef.current = cur;
      }
      if (cur.url) URL.revokeObjectURL(cur.url);
      cur.url = URL.createObjectURL(blob);
      cur.audio.src = cur.url;
      await cur.audio.play();
      playingTakeRef.current = t;
      playingFromListRef.current = fromList;
      setPlayingId(t.id);
      setPlayPaused(false);
      setPlayPos(0);
    } catch (e) {
      setRecError("再生に失敗しました");
    }
  };

  // シークバーからの再生位置移動(一時停止中でも効く)
  const seekTo = (sec) => {
    const cur = audioRef.current;
    if (!cur || !playingId) return;
    try {
      cur.audio.currentTime = sec;
    } catch (e) {
      /* メタデータ未ロード等でシーク不可なら無視 */
    }
    setPlayPos(Math.floor(sec));
  };

  const togglePause = () => {
    const cur = audioRef.current;
    if (!cur || !playingId) return;
    if (cur.audio.paused) {
      cur.audio.play();
      setPlayPaused(false);
    } else {
      cur.audio.pause();
      setPlayPaused(true);
    }
  };

  // 録音一覧の表示順(曲名・アーティストはsongKey経由で曲から解決)
  const sortedAllTakes = useMemo(() => {
    const byKey = new Map(songs.map((s) => [songKey(s), s]));
    const arr = recMeta.map((t) => {
      const s = byKey.get(t.songKey);
      return {
        ...t,
        title: s ? s.title : t.songKey ? t.songKey.split("__")[0] : "(曲未設定)",
        artist: s ? s.artist : t.songKey ? t.songKey.split("__")[1] || "" : "",
      };
    });
    const cmp = {
      dateDesc: (a, b) => b.createdAt - a.createdAt,
      dateAsc: (a, b) => a.createdAt - b.createdAt,
      score: (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || b.createdAt - a.createdAt,
      title: (a, b) => a.title.localeCompare(b.title, "ja") || b.createdAt - a.createdAt,
      artist: (a, b) =>
        (a.artist || "").localeCompare(b.artist || "", "ja") ||
        a.title.localeCompare(b.title, "ja") ||
        b.createdAt - a.createdAt,
    }[recSort];
    return arr.sort(cmp || ((a, b) => b.createdAt - a.createdAt));
  }, [recMeta, songs, recSort]);

  // 再生終了時の挙動。毎レンダー上書きすることで最新のソート順・連続/リピート設定を参照する
  useEffect(() => {
    onTakeEndedRef.current = () => {
      const t = playingTakeRef.current;
      if (!t || !playingFromListRef.current) {
        stopPlayback(); // 編集シート発の再生は従来どおり1本で停止
        return;
      }
      if (recRepeat && !recContinuous) {
        playTake(t, { restart: true, fromList: true }); // 1本リピート
        return;
      }
      if (recContinuous) {
        const i = sortedAllTakes.findIndex((x) => x.id === t.id);
        const next =
          i >= 0 && i + 1 < sortedAllTakes.length
            ? sortedAllTakes[i + 1]
            : recRepeat && sortedAllTakes.length > 0
              ? sortedAllTakes[0] // 全体ループ
              : null;
        if (next) {
          playTake(next, { restart: true, fromList: true });
          return;
        }
      }
      stopPlayback();
    };
  });

  // 一覧の前後のテイクを再生(端はループ)
  const playNeighbor = (dir) => {
    const t = playingTakeRef.current;
    if (!t || sortedAllTakes.length === 0) return;
    const i = sortedAllTakes.findIndex((x) => x.id === t.id);
    if (i < 0) return;
    playTake(sortedAllTakes[(i + dir + sortedAllTakes.length) % sortedAllTakes.length], { restart: true, fromList: true });
  };

  // ---- 次歌う曲リスト(キュー) ----
  const saveQueue = (next) => {
    setQueue(next);
    try {
      localStorage.setItem("utacho-queue", JSON.stringify(next));
    } catch (e) {
      /* 保存できなくてもセッション内では有効 */
    }
  };
  const inQueue = (songId) => queue.some((q) => q.id === songId);
  // 追加/解除のトグル(重複追加は不可)
  const toggleQueued = (songId) =>
    saveQueue(inQueue(songId) ? queue.filter((q) => q.id !== songId) : [...queue, { id: songId, done: false }]);
  const toggleQueueDone = (songId) =>
    saveQueue(queue.map((q) => (q.id === songId ? { ...q, done: !q.done } : q)));
  const moveQueue = (songId, dir) => {
    const i = queue.findIndex((q) => q.id === songId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= queue.length) return;
    const next = [...queue];
    [next[i], next[j]] = [next[j], next[i]];
    saveQueue(next);
  };
  const clearDoneQueue = () => saveQueue(queue.filter((q) => !q.done));
  // 曲データとjoin(削除済み曲のエントリは表示から除外)
  const queueItems = useMemo(() => {
    const byId = new Map(songs.map((s) => [s.id, s]));
    return queue.filter((q) => byId.has(q.id)).map((q) => ({ ...q, song: byId.get(q.id) }));
  }, [queue, songs]);

  const deleteTake = (t) => {
    if (playingId === t.id) stopPlayback();
    recDeleteIds([t.id]).catch(() => {});
    setRecMeta((m) => m.filter((x) => x.id !== t.id));
    setConfirmTake(null);
  };

  // クイック録音したテイクを曲に紐付ける(「曲を選ぶ」で後からでも可)
  const assignTakeToSong = (takeId, s) => {
    const t = recMeta.find((x) => x.id === takeId);
    if (t) {
      const next = { ...t, songKey: songKey(s) };
      setRecMeta((m) => m.map((x) => (x.id === takeId ? next : x)));
      recPutMeta(next).catch(() => {});
    }
    setAssignTake(null);
    setAssignQuery("");
  };

  // テイクの点数・採点機を更新。点数が曲の最高スコアを超えたら自動で更新する
  const updateTake = (t, patch) => {
    const next = { ...t, ...patch };
    setRecMeta((m) => m.map((x) => (x.id === t.id ? next : x)));
    recPutMeta(next).catch(() => {});
    if (patch.machine) setLastMachine(patch.machine);
    if (!editingSong) return;
    // テイクの値が曲の自己ベストを超えたら自動で曲側を更新する(点数・技法とも)
    const upd = {};
    if (Number(next.score) > (Number(editingSong.score) || 0)) {
      upd.score = next.score;
      upd.scoreMachine = next.machine || "";
    }
    ["pitchAcc", "vibratoSec", "shakuri"].forEach((k) => {
      if (Number(next[k]) > (Number(editingSong[k]) || 0)) upd[k] = next[k];
    });
    if (Object.keys(upd).length > 0) {
      persist(songs.map((s) => (s.id === editingSong.id ? { ...s, ...upd } : s)));
      setForm((f) => ({ ...f, ...upd }));
    }
  };

  const spin = () => {
    if (filtered.length === 0) return;
    setRolling(true);
    setPick(filtered[Math.floor(Math.random() * filtered.length)]);
    let n = 0;
    clearInterval(rollRef.current);
    rollRef.current = setInterval(() => {
      setPick(filtered[Math.floor(Math.random() * filtered.length)]);
      n++;
      if (n > 12) {
        clearInterval(rollRef.current);
        setRolling(false);
      }
    }, 90);
  };

  const toggleTag = (t) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
    }));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, textarea, select, button { font-family: inherit; }
        /* iOSは16px未満の入力欄にフォーカスすると画面が自動ズームされるため強制16px */
        input, textarea, select { font-size: 16px !important; }
        input:focus, textarea:focus, select:focus, button:focus-visible { outline: 2px solid ${C.cyan}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* ヘッダー+検索+タグ(スクロールしても上部に固定。上部はノッチ/ステータスバーを避ける) */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: C.bg, borderBottom: `1px solid ${C.line}` }}>
      <header style={{ padding: "calc(14px + env(safe-area-inset-top)) 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "0.12em", fontWeight: 800, whiteSpace: "nowrap" }}>
            歌<span style={{ color: C.magenta }}>帳</span>
          </h1>
          <span style={{ color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>持ち歌 {songs.length}曲</span>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="設定"
            style={{
              marginLeft: "auto", padding: "7px 12px", borderRadius: 999, fontSize: 14,
              border: `1px solid ${C.line}`, background: "transparent", color: C.muted, cursor: "pointer",
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {tab === "songs" && (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
        {/* 検索・並び替え */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="曲名・アーティストで検索"
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 12,
              border: `1px solid ${C.line}`, background: C.panel, color: C.text, fontSize: 15,
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="並び替え"
            style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: C.panel, color: C.text, padding: "0 10px", fontSize: 13 }}
          >
            <option value="added">追加順</option>
            <option value="title">曲名順</option>
            <option value="artist">歌手順</option>
            <option value="score">スコア順</option>
          </select>
        </div>

        {/* タグフィルタ */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", WebkitOverflowScrolling: "touch" }}>
          {["十八番", ...allTags].map((t) => {
            const on = tagFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTagFilter(on ? null : t)}
                style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${on ? C.magenta : C.line}`,
                  background: on ? C.magenta : "transparent",
                  color: on ? C.onAccent : C.muted, fontWeight: on ? 700 : 400,
                }}
              >
                {t === "十八番" ? "★ 十八番" : t}
              </button>
            );
          })}
        </div>
      </div>
      )}
      </div>

      {tab === "songs" && (
      <main style={{ padding: "8px 16px 190px", maxWidth: 640, margin: "0 auto" }}>
        {/* 曲リスト */}
        {loaded && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 20px", color: C.muted }}>
            {songs.length === 0 ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
                <p style={{ margin: 0, fontSize: 15 }}>まだ持ち歌がありません。</p>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>右上の ⚙️ →「MDを取り込む」に持ち歌リスト.mdを読み込むか、右下の「+ 曲を追加」から登録しましょう。</p>
              </>
            ) : (
              <p style={{ fontSize: 14 }}>この条件に合う曲はありません。検索やタグを変えてみてください。</p>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((s) => {
            const queued = inQueue(s.id);
            return (
            <div
              key={s.id}
              role="button"
              onClick={() => openEdit(s)}
              style={{
                textAlign: "left", background: C.panel, border: `1px solid ${C.line}`,
                borderRadius: 14, padding: "14px 14px", cursor: "pointer", color: C.text,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {s.ohako && <span style={{ color: C.amber, fontSize: 15 }} title="十八番">★</span>}
                <span style={{ fontSize: 16, fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title}
                </span>
                <span
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 800, padding: "3px 9px", borderRadius: 7,
                    background: s.keyShift === 0 ? C.panelHi : s.keyShift > 0 ? C.magentaSoft : C.cyanSoft,
                    color: s.keyShift === 0 ? C.muted : s.keyShift > 0 ? C.magenta : C.cyan,
                    border: `1px solid ${s.keyShift === 0 ? C.line : "transparent"}`,
                  }}
                >
                  {keyLabel(s.keyShift)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // カードタップ(編集)を発火させない
                    toggleQueued(s.id);
                  }}
                  aria-label={queued ? "次歌うリストから外す" : "次歌うリストに追加"}
                  title={queued ? "次歌うリストから外す" : "次歌うリストに追加"}
                  style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 999, cursor: "pointer", fontSize: 15,
                    border: `1px solid ${queued ? C.magenta : C.line}`,
                    background: queued ? C.magentaSoft : "transparent",
                    color: queued ? C.magenta : C.muted,
                  }}
                >
                  {queued ? "✓" : "+"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 5, alignItems: "center", fontSize: 13, color: C.muted }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.artist || "アーティスト未登録"}</span>
                {s.score && (
                  <span
                    style={{
                      color: C.cyan, flexShrink: 0, fontSize: 12,
                      padding: "2px 8px", borderRadius: 7,
                      border: `1px solid ${C.cyan}`, background: C.cyanSoft,
                    }}
                  >
                    {s.score}点{s.scoreMachine ? `(${s.scoreMachine})` : ""}
                  </span>
                )}
                {(recCounts.get(songKey(s)) || 0) > 0 && (
                  <span style={{ flexShrink: 0, fontSize: 12 }} title="録音あり">🎙{recCounts.get(songKey(s))}</span>
                )}
              </div>
              {s.rangeLo != null && s.rangeHi != null && (
                <div style={{ marginTop: 5, fontSize: 12, color: C.muted }}>
                  🎵 {rangeLabel(s.rangeLo, s.rangeHi)}
                  {s.keyShift !== 0 && (
                    <span style={{ color: s.keyShift > 0 ? C.magenta : C.cyan }}>
                      {" "}→ {rangeLabel(s.rangeLo, s.rangeHi, s.keyShift)}
                    </span>
                  )}
                </div>
              )}
              {s.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {s.tags.map((t) => (
                    <span key={t} style={{ fontSize: 11, color: C.muted, background: C.panelHi, padding: "2px 8px", borderRadius: 999 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </main>
      )}

      {/* 🎵 次歌う曲リストタブ */}
      {tab === "queue" && (
        <section style={{ padding: "14px 16px 190px", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.muted }}>
              {queueItems.length}曲{queueItems.some((q) => q.done) && `(うち歌った ${queueItems.filter((q) => q.done).length}曲)`}
            </span>
            {queueItems.some((q) => q.done) && (
              <button
                onClick={clearDoneQueue}
                style={{
                  marginLeft: "auto", padding: "7px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                  border: `1px solid ${C.line}`, background: "transparent", color: C.muted,
                }}
              >
                歌った曲をクリア
              </button>
            )}
          </div>
          {queueItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 20px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
              <p style={{ margin: 0, fontSize: 15 }}>次歌う曲がまだありません。</p>
              <p style={{ margin: "6px 0 0", fontSize: 13 }}>
                持ち歌タブの曲カード右の「+」か、🎲ランダム選曲の「これを歌う」で追加できます。
              </p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {queueItems.map((q, i) => {
              const s = q.song;
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14,
                    opacity: q.done ? 0.65 : 1,
                  }}
                >
                  <button
                    onClick={() => toggleQueueDone(q.id)}
                    aria-label={q.done ? "歌った印を外す" : "歌った印を付ける"}
                    style={{
                      width: 30, height: 30, borderRadius: 999, flexShrink: 0, cursor: "pointer", fontSize: 14,
                      border: `1px solid ${q.done ? C.cyan : C.lineStrong}`,
                      background: q.done ? C.cyanSoft : "transparent",
                      color: q.done ? C.cyan : C.muted,
                    }}
                  >
                    {q.done ? "✓" : ""}
                  </button>
                  <div
                    role="button"
                    onClick={() => openEdit(s)}
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 20, fontSize: 12, color: C.muted, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{
                        flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        fontWeight: 700, fontSize: 15,
                        textDecoration: q.done ? "line-through" : "none",
                      }}>
                        {s.title}
                      </span>
                      <span
                        style={{
                          flexShrink: 0, fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 7,
                          background: s.keyShift === 0 ? C.panelHi : s.keyShift > 0 ? C.magentaSoft : C.cyanSoft,
                          color: s.keyShift === 0 ? C.muted : s.keyShift > 0 ? C.magenta : C.cyan,
                          border: `1px solid ${s.keyShift === 0 ? C.line : "transparent"}`,
                        }}
                      >
                        {keyLabel(s.keyShift)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, paddingLeft: 28, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.artist || "アーティスト未登録"}
                      {s.rangeLo != null && s.rangeHi != null && ` ・ 🎵 ${rangeLabel(s.rangeLo, s.rangeHi, s.keyShift)}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => moveQueue(q.id, -1)} disabled={i === 0} aria-label="上へ"
                      style={{ width: 28, height: 24, borderRadius: 7, border: `1px solid ${C.line}`, background: "transparent", color: i === 0 ? C.panelHi : C.muted, cursor: i === 0 ? "default" : "pointer", fontSize: 11 }}>▲</button>
                    <button onClick={() => moveQueue(q.id, 1)} disabled={i === queueItems.length - 1} aria-label="下へ"
                      style={{ width: 28, height: 24, borderRadius: 7, border: `1px solid ${C.line}`, background: "transparent", color: i === queueItems.length - 1 ? C.panelHi : C.muted, cursor: i === queueItems.length - 1 ? "default" : "pointer", fontSize: 11 }}>▼</button>
                  </div>
                  <button onClick={() => toggleQueued(q.id)} aria-label="リストから外す"
                    style={{ width: 30, height: 30, borderRadius: 999, flexShrink: 0, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12 }}>✕</button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 持ち歌タブの操作バー(タブバーの直上) */}
      {tab === "songs" && (
      <div style={{
        position: "fixed", bottom: "calc(58px + env(safe-area-inset-bottom))", left: 0, right: 0, display: "flex", gap: 10,
        padding: "12px 16px 10px", zIndex: 30,
        background: `linear-gradient(to top, ${C.bg} 70%, transparent)`, maxWidth: 640, margin: "0 auto",
      }}>
        <button
          onClick={spin}
          disabled={filtered.length === 0}
          style={{
            flex: 1, padding: "14px 0", borderRadius: 14, border: `1px solid ${C.cyan}`,
            background: C.cyan,
            // ネオンのようにシアンが明るいテーマでは白文字が読めないため濃色(背景色)に切り替える
            color: hexLum(C.cyan) > 0.65 ? C.bg : C.onAccent,
            fontSize: 15, fontWeight: 700,
            cursor: filtered.length ? "pointer" : "not-allowed", opacity: filtered.length ? 1 : 0.4,
          }}
        >
          🎲 次の一曲を選ぶ
        </button>
        <button
          onClick={openAdd}
          style={{
            flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
            background: C.magenta, color: C.onAccent, fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: `0 4px 20px ${C.shadowMagenta}`,
          }}
        >
          + 曲を追加
        </button>
      </div>
      )}

      {/* 下部タブバー */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 35,
        background: C.panel, borderTop: `1px solid ${C.line}`,
      }}>
        <div style={{ display: "flex", maxWidth: 640, margin: "0 auto", padding: "6px 8px calc(6px + env(safe-area-inset-bottom))" }}>
          {[
            { key: "songs", icon: "🎤", label: "持ち歌" },
            { key: "queue", icon: "🎵", label: "次歌う" },
            { key: "recs", icon: "🎙", label: "録音" },
            { key: "dash", icon: "📊", label: "分析" },
          ].map((tb) => {
            const on = tab === tb.key;
            const remain = tb.key === "queue" ? queueItems.filter((q) => !q.done).length : 0;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  padding: "4px 0", border: "none", background: "transparent", cursor: "pointer",
                  color: on ? C.magenta : C.muted, fontWeight: on ? 700 : 400,
                }}
              >
                <span style={{ fontSize: 17, opacity: on ? 1 : 0.75 }}>{tb.icon}</span>
                <span style={{ fontSize: 10 }}>
                  {tb.label}
                  {remain > 0 && <span style={{ color: C.magenta, fontWeight: 700 }}> {remain}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ランダム選曲オーバーレイ */}
      {pick && (
        <div
          onClick={() => !rolling && setPick(null)}
          style={{
            position: "fixed", inset: 0, background: C.overlayDark, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24, zIndex: 40,
          }}
        >
          <div style={{
            background: C.panel, border: `1px solid ${C.magenta}`, borderRadius: 20,
            padding: "32px 24px", width: "100%", maxWidth: 400, textAlign: "center",
            boxShadow: `0 0 60px ${C.glowMagenta}`,
          }}>
            <div style={{ fontSize: 12, letterSpacing: "0.3em", color: C.muted, marginBottom: 12 }}>NEXT SONG</div>
            <div style={{ fontSize: 22, fontWeight: 800, minHeight: 32 }}>{pick.title}</div>
            <div style={{ color: C.muted, marginTop: 6 }}>{pick.artist}</div>
            <div style={{ marginTop: 10, fontSize: 14, color: pick.keyShift > 0 ? C.magenta : pick.keyShift < 0 ? C.cyan : C.muted }}>
              キー:{keyLabel(pick.keyShift)}
            </div>
            {pick.rangeLo != null && pick.rangeHi != null && (
              <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
                音域 {rangeLabel(pick.rangeLo, pick.rangeHi, pick.keyShift)}
                {pick.keyShift !== 0 && `(原曲 ${rangeLabel(pick.rangeLo, pick.rangeHi)})`}
              </div>
            )}
            {!rolling && (
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button onClick={spin} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer" }}>
                  もう一回
                </button>
                <button
                  onClick={() => {
                    // 次歌うリストに積んで閉じる(既にあればそのまま閉じるだけ)
                    if (!inQueue(pick.id)) toggleQueued(pick.id);
                    setPick(null);
                  }}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: C.magenta, color: C.onAccent, fontWeight: 700, cursor: "pointer" }}
                >
                  これを歌う
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎙 録音タブ */}
      {tab === "recs" && (
        <section style={{ padding: "14px 16px 230px", maxWidth: 640, margin: "0 auto" }}>
            {recSupported && (
              <button
                onClick={() => (recState ? stopRecording() : startRecording(""))}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12, marginBottom: 12, fontSize: 14, cursor: "pointer",
                  border: recState ? "none" : `1px solid ${C.magenta}`,
                  background: recState ? C.danger : "transparent",
                  color: recState ? "#fff" : C.magenta,
                  fontWeight: recState ? 800 : 700,
                }}
              >
                {recState ? `■ 停止して保存(${fmtRecTime(recState.elapsed)})` : "● 録音する(あとで曲を選択)"}
              </button>
            )}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: C.muted, marginRight: 2 }}>{recMeta.length}本</span>
                <select
                  value={recSort}
                  onChange={(e) => setRecSort(e.target.value)}
                  aria-label="録音の並び替え"
                  style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, padding: "8px 10px", fontSize: 13 }}
                >
                  <option value="dateDesc">新しい順</option>
                  <option value="dateAsc">古い順</option>
                  <option value="score">点数順</option>
                  <option value="title">曲名順</option>
                  <option value="artist">歌手順</option>
                </select>
                {[
                  { on: recContinuous, set: setRecContinuous, label: "連続再生", hint: "再生が終わったら次のテイクへ" },
                  { on: recRepeat, set: setRecRepeat, label: "リピート", hint: "連続ONなら全体をループ、OFFなら1本をループ" },
                ].map((tg) => (
                  <button
                    key={tg.label}
                    onClick={() => tg.set(!tg.on)}
                    title={tg.hint}
                    style={{
                      padding: "7px 13px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                      border: `1px solid ${tg.on ? C.cyan : C.line}`,
                      background: tg.on ? C.cyanSoft : "transparent",
                      color: tg.on ? C.cyan : C.muted, fontWeight: tg.on ? 700 : 400,
                    }}
                  >
                    {tg.label}
                  </button>
                ))}
              </div>
              {recError && <p style={{ margin: "0 0 8px", fontSize: 12, color: C.amber }}>{recError}</p>}
            </div>

            <div>
              {sortedAllTakes.map((t) => {
                const on = playingId === t.id;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                    <button
                      onClick={() => playTake(t, { fromList: true })}
                      aria-label={on ? "停止" : "再生"}
                      style={{
                        width: 42, height: 42, borderRadius: 999, flexShrink: 0, cursor: "pointer",
                        border: `1px solid ${on ? C.cyan : C.line}`,
                        background: on ? C.cyanSoft : "transparent",
                        color: C.cyan, fontSize: 15,
                      }}
                    >
                      {on ? "■" : "▶"}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }}>
                          {t.title}
                        </span>
                        {t.score && (
                          <span style={{ color: C.cyan, flexShrink: 0, fontSize: 12 }}>
                            {t.score}点{t.machine ? `(${t.machine})` : ""}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.songKey ? (t.artist || "アーティスト未登録") : "—"}・{fmtRecDate(t.createdAt)}・{fmtRecTime(t.duration || 0)}
                      </div>
                    </div>
                    {!t.songKey && (
                      <button
                        onClick={() => {
                          setAssignQuery("");
                          setAssignTake(t.id);
                        }}
                        style={{
                          flexShrink: 0, padding: "7px 10px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                          border: `1px solid ${C.magenta}`, background: C.magentaSoft, color: C.magenta, whiteSpace: "nowrap",
                        }}
                      >
                        曲を選ぶ
                      </button>
                    )}
                    <button
                      onClick={() => (confirmTake === t.id ? deleteTake(t) : setConfirmTake(t.id))}
                      style={{
                        padding: "7px 10px", borderRadius: 10, cursor: "pointer", flexShrink: 0, fontSize: 12,
                        border: `1px solid ${C.danger}`,
                        background: confirmTake === t.id ? C.danger : "transparent",
                        color: confirmTake === t.id ? "#fff" : C.danger,
                        fontWeight: confirmTake === t.id ? 800 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {confirmTake === t.id ? "本当に?" : "削除"}
                    </button>
                  </div>
                );
              })}
              {recMeta.length === 0 && (
                <p style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "32px 0" }}>
                  まだ録音がありません。上のボタンからすぐ録音できます。
                </p>
              )}
            </div>

            {/* 再生バー(再生中のみ、タブバーの直上に固定表示) */}
            {playingId && (() => {
              const t = sortedAllTakes.find((x) => x.id === playingId);
              if (!t) return null;
              return (
                <div style={{
                  position: "fixed", bottom: "calc(58px + env(safe-area-inset-bottom))", left: 0, right: 0, zIndex: 30,
                  maxWidth: 640, margin: "0 auto",
                  background: C.panel, borderTop: `1px solid ${C.line}`, padding: "10px 20px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }}>
                      {t.title}
                      <span style={{ color: C.muted, fontWeight: 400 }}>{t.artist ? ` / ${t.artist}` : ""}</span>
                    </span>
                    <span style={{ color: C.muted, flexShrink: 0, fontSize: 12 }}>
                      {fmtRecTime(Math.min(playPos, t.duration || playPos))} / {fmtRecTime(t.duration || 0)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, t.duration || 0)}
                    step={1}
                    value={Math.min(playPos, t.duration || 0)}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    aria-label="再生位置"
                    style={{ display: "block", width: "100%", margin: "6px 0 8px", accentColor: C.magenta, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
                    <button onClick={() => playNeighbor(-1)} aria-label="前のテイク"
                      style={{ width: 42, height: 42, borderRadius: 999, border: `1px solid ${C.line}`, background: "transparent", color: C.text, fontSize: 15, cursor: "pointer" }}>⏮</button>
                    <button onClick={togglePause} aria-label={playPaused ? "再開" : "一時停止"}
                      style={{ width: 52, height: 52, borderRadius: 999, border: "none", background: C.magenta, color: C.onAccent, fontSize: 19, cursor: "pointer", boxShadow: `0 4px 14px ${C.shadowMagenta}` }}>
                      {playPaused ? "▶" : "⏸"}
                    </button>
                    <button onClick={() => playNeighbor(1)} aria-label="次のテイク"
                      style={{ width: 42, height: 42, borderRadius: 999, border: `1px solid ${C.line}`, background: "transparent", color: C.text, fontSize: 15, cursor: "pointer" }}>⏭</button>
                    <button onClick={stopPlayback} aria-label="停止"
                      style={{ width: 42, height: 42, borderRadius: 999, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.muted, fontSize: 14, cursor: "pointer" }}>■</button>
                  </div>
                </div>
              );
            })()}
        </section>
      )}

      {/* 📊 分析タブ */}
      {tab === "dash" && (
          <section style={{ padding: "14px 16px 190px", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <button
                onClick={() => setRangeGuideOpen(true)}
                style={{ marginLeft: "auto", padding: "7px 12px", borderRadius: 999, fontSize: 12, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, cursor: "pointer" }}
              >
                🎹 音域ガイド
              </button>
            </div>

            {/* 概況 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
              {[
                { label: "持ち歌", value: stats.total },
                { label: "採点記録", value: stats.scoredCount },
                { label: "90点以上", value: stats.over90 },
                { label: "十八番", value: stats.ohako },
              ].map((c) => (
                <div key={c.label} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.magenta }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* 採点機別 */}
            <label style={{ fontSize: 12, color: C.muted }}>採点機別</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0 16px" }}>
              {stats.byMachine.map((m) => (
                <div key={m.machine} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.cyan }}>{m.machine}</div>
                  {m.count === 0 ? (
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>記録なし</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                        {m.count}曲 ・ 平均 <span style={{ color: C.text, fontWeight: 700 }}>{m.avg.toFixed(1)}</span>点
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        最高 <span style={{ color: C.amber, fontWeight: 700 }}>{m.best.score}</span>点「{m.best.title}」
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* スコア分布 */}
            <label style={{ fontSize: 12, color: C.muted }}>スコア分布</label>
            <div style={{ margin: "8px 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
              {stats.bins.map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 52, fontSize: 11, color: C.muted, textAlign: "right", flexShrink: 0 }}>{b.label}</span>
                  <div style={{ flex: 1, height: 16, background: C.bg, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${(b.count / stats.maxBin) * 100}%`, height: "100%", background: b.min >= 90 ? C.magenta : C.cyan, opacity: b.min >= 90 ? 1 : 0.7, borderRadius: 6, transition: "width .3s" }} />
                  </div>
                  <span style={{ width: 28, fontSize: 12, color: C.text, flexShrink: 0 }}>{b.count}</span>
                </div>
              ))}
            </div>

            {/* ベストスコアTOP5 */}
            {stats.top.length > 0 && (
              <>
                <label style={{ fontSize: 12, color: C.muted }}>ベストスコア TOP5</label>
                <div style={{ margin: "8px 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {stats.top.map((s, i) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 20, color: i === 0 ? C.amber : C.muted, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.text }}>{s.title}</span>
                      <span style={{ color: C.magenta, fontWeight: 800, flexShrink: 0 }}>{s.score}点</span>
                      {s.scoreMachine && <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{s.scoreMachine}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 技法別自己ベスト */}
            {stats.techBest.length > 0 && (
              <>
                <label style={{ fontSize: 12, color: C.muted }}>技法別自己ベスト</label>
                <div style={{ margin: "8px 0 16px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {stats.techBest.map((mt) => (
                    <div key={mt.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 92, color: C.muted, flexShrink: 0, fontSize: 12 }}>{mt.dashLabel}</span>
                      <span style={{ color: C.amber, fontWeight: 800, flexShrink: 0 }}>{mt.best.s[mt.key]}{mt.unit}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.muted }}>「{mt.best.s.title}」</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 音域(キー変更込みの実効値) */}
            {(stats.hiSong || stats.loSong) && (
              <>
                <label style={{ fontSize: 12, color: C.muted }}>持ち歌の音域(キー変更込み)</label>
                <div style={{ margin: "8px 0 16px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontSize: 13 }}>
                  {stats.hiSong && (
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      最高音 <span style={{ color: C.magenta, fontWeight: 800 }}>{midiToKaraoke(stats.hiSong.v)}</span>
                      <span style={{ color: C.muted }}>「{stats.hiSong.s.title}」</span>
                    </div>
                  )}
                  {stats.loSong && (
                    <div style={{ marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      最低音 <span style={{ color: C.cyan, fontWeight: 800 }}>{midiToKaraoke(stats.loSong.v)}</span>
                      <span style={{ color: C.muted }}>「{stats.loSong.s.title}」</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 練習ログ(録音ベース) */}
            <label style={{ fontSize: 12, color: C.muted }}>練習ログ</label>
            <div style={{ margin: "8px 0 16px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontSize: 13 }}>
              <div style={{ color: C.muted }}>
                直近30日: <span style={{ color: C.text, fontWeight: 700 }}>{stats.days30}</span>日活動 ・
                録音 <span style={{ color: C.text, fontWeight: 700 }}>{stats.takes30}</span>本
                (累計{stats.takesTotal}本)
              </div>
              {stats.recentTakes.map((t) => (
                <div key={t.id} style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{fmtRecDate(t.createdAt)}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stats.titleByKey.get(t.songKey) || t.songKey.split("__")[0] || "(曲未設定)"}
                  </span>
                  {t.score && <span style={{ color: C.cyan, flexShrink: 0 }}>{t.score}点{t.machine ? `(${t.machine})` : ""}</span>}
                </div>
              ))}
              {stats.takesTotal === 0 && <div style={{ marginTop: 6, color: C.muted, fontSize: 12 }}>まだ録音がありません。曲の編集画面から録音できます。</div>}
            </div>

          </section>
      )}

      {/* 🔗 録音テイクの曲選択モーダル */}
      {assignTake !== null && (
        <div
          onClick={() => {
            setAssignTake(null);
            setAssignQuery("");
          }}
          style={{
            position: "fixed", inset: 0, background: C.overlay, zIndex: 46,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom))",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.panel, borderRadius: 20, width: "100%", maxWidth: 480,
              border: `1px solid ${C.line}`, maxHeight: "100%",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 17 }}>🎙 この録音の曲を選ぶ</h2>
              <input
                value={assignQuery}
                onChange={(e) => setAssignQuery(e.target.value)}
                placeholder="曲名・アーティストで検索"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 15, marginBottom: 8, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ overflowY: "auto", padding: "0 12px", flex: 1 }}>
              {(() => {
                const q = assignQuery.trim().toLowerCase();
                const match = (s) => !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
                // 次歌うリストの未消化曲を先頭に(直前に歌った曲の可能性が高い)
                const headSongs = queueItems.filter((x) => !x.done).map((x) => x.song).filter(match);
                const headIds = new Set(headSongs.map((s) => s.id));
                const rest = songs
                  .filter((s) => !headIds.has(s.id))
                  .filter(match)
                  .sort((a, b) => a.title.localeCompare(b.title, "ja"));
                const row = (s, fromQueue) => (
                  <button
                    key={s.id}
                    onClick={() => assignTakeToSong(assignTake, s)}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "11px 8px",
                      border: "none", borderBottom: `1px solid ${C.line}`, background: "transparent",
                      color: C.text, cursor: "pointer",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{fromQueue ? "🎵 " : ""}{s.title}</span>
                    <span style={{ color: C.muted, fontSize: 12 }}> / {s.artist || "アーティスト未登録"}</span>
                  </button>
                );
                return (
                  <>
                    {headSongs.map((s) => row(s, true))}
                    {rest.map((s) => row(s, false))}
                    {headSongs.length + rest.length === 0 && (
                      <p style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "24px 0" }}>該当する曲がありません</p>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={{ padding: "10px 20px 14px", flexShrink: 0, borderTop: `1px solid ${C.line}` }}>
              <button
                onClick={() => {
                  setAssignTake(null);
                  setAssignQuery("");
                }}
                style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}
              >
                あとで選ぶ(曲未設定のまま)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎹 音域ガイド */}
      {rangeGuideOpen && (
        <div
          onClick={() => setRangeGuideOpen(false)}
          style={{
            position: "fixed", inset: 0, background: C.overlayDark, zIndex: 52,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom))",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: C.panel, borderRadius: 20, width: "100%", maxWidth: 480, padding: 20, border: `1px solid ${C.line}`, maxHeight: "100%", overflowY: "auto" }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>🎹 カラオケ音域表記の読み方</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              基準は<span style={{ color: C.text, fontWeight: 700 }}>「真ん中のド」=ピアノ中央のド(C4)= mid2C</span>。
              そこから1オクターブ下がるごとに mid1 → low、上は hi → hihi になります。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {RANGE_GUIDE_ROWS.map((r) => (
                <div
                  key={r.kara}
                  style={{
                    display: "flex", alignItems: "baseline", gap: 8, padding: "8px 10px", borderRadius: 10,
                    background: r.em ? C.magentaSoft : C.bg,
                    border: `1px solid ${r.em ? C.magenta : C.line}`,
                  }}
                >
                  <span style={{ width: 128, fontWeight: 800, fontSize: 13, color: r.em ? C.magenta : C.text, flexShrink: 0 }}>{r.kara}</span>
                  <span style={{ width: 68, fontSize: 12, color: C.muted, flexShrink: 0 }}>{r.note}</span>
                  <span style={{ fontSize: 12, color: r.em ? C.text : C.muted }}>{r.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
              ⚠️ hi系だけは<span style={{ color: C.text }}>ラ(A)始まり</span>です。mid2G#の次がhiAになり、「mid2A」「mid2B」という表記は使いません(low・mid1・mid2はド始まり)。
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
              めやす(地声・個人差大): 男性 lowG〜mid2G前後 / 女性 mid1G〜hiC前後。
              キーを♯1上げると音域も半音1つ分上にずれます(♭は下)。
            </p>
            <button
              onClick={() => setRangeGuideOpen(false)}
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: C.panel, borderRadius: 20, width: "100%", maxWidth: 400, padding: 20, border: `1px solid ${C.line}` }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>⚙️ 設定</h2>

            <label style={{ fontSize: 12, color: C.muted }}>カラーテーマ</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 18px" }}>
              {THEME_ORDER.map((key) => {
                const t = THEMES[key];
                const on = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectTheme(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                      border: `1px solid ${on ? C.magenta : C.line}`,
                      background: on ? C.magentaSoft : "transparent",
                      color: on ? C.text : C.muted, fontWeight: on ? 700 : 400,
                    }}
                  >
                    <span style={{ display: "flex", gap: 2 }}>
                      {[t.bg, t.magenta, t.cyan].map((c, i) => (
                        <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: c, border: `1px solid ${C.line}` }} />
                      ))}
                    </span>
                    {t.name}
                  </button>
                );
              })}
            </div>

            <label style={{ fontSize: 12, color: C.muted }}>データ(持ち歌リスト.md)</label>
            <div style={{ display: "flex", gap: 10, margin: "8px 0 18px" }}>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setImportText("");
                }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                📥 MDを取り込む
              </button>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  openExport();
                }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                📄 MDで書き出す
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}
            >
              閉じる
            </button>
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: C.muted }}>
              歌帳 v{APP_VERSION}
              {" ・ "}
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setDevToolOpen(true);
                }}
                style={{ border: "none", background: "transparent", color: C.muted, fontSize: 11, textDecoration: "underline", cursor: "pointer", padding: 0 }}
              >
                🛠 テーマ調整(開発用)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MDインポートモーダル */}
      {importText !== null && importPreview && (
        <div style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.panel, borderRadius: 20, width: "100%", maxWidth: 640, padding: 20, maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${C.line}` }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>Markdownを取り込む</h2>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted }}>
              持ち歌リスト.md をファイルから選ぶか、内容を貼り付けてください。追加・更新のみ行い、曲は削除されません(削除は各曲の編集画面から)。
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,text/markdown,text/plain"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileRef.current && fileRef.current.click()}
              style={{
                alignSelf: "flex-start", marginBottom: 10, padding: "9px 14px", borderRadius: 12,
                border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              📁 ファイルから選ぶ
            </button>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"# 持ち歌リスト…\n\n- **曲名** / アーティスト｜キー♯2｜90点｜メモ: …"}
              style={{ flex: 1, minHeight: 200, width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 12, fontFamily: "monospace", resize: "none", whiteSpace: "pre" }}
            />
            {importPreview.parsed.length > 0 && (
              <p style={{ margin: "10px 0 0", fontSize: 13, color: C.text }}>
                読み取り {importPreview.parsed.length}曲:
                <span style={{ color: C.cyan }}> 追加 {importPreview.added}</span> ・
                <span style={{ color: C.magenta }}> 更新 {importPreview.updated}</span> ・
                変更なし {importPreview.unchanged}
                {importPreview.appOnly > 0 && (
                  <span style={{ color: C.muted }}> ・ mdに無い{importPreview.appOnly}曲はそのまま残ります</span>
                )}
              </p>
            )}
            {importPreview.errors.length > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: C.amber }}>
                読み取れなかった行: {importPreview.errors.slice(0, 3).join(" / ")}
                {importPreview.errors.length > 3 ? ` ほか${importPreview.errors.length - 3}件` : ""}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setImportText(null)} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}>
                キャンセル
              </button>
              <button
                onClick={applyImport}
                disabled={importPreview.parsed.length === 0}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                  background: importPreview.parsed.length ? C.magenta : C.panelHi,
                  color: importPreview.parsed.length ? C.onAccent : C.muted,
                  fontWeight: 800, cursor: importPreview.parsed.length ? "pointer" : "not-allowed", fontSize: 14,
                }}
              >
                取り込んで反映
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MDエクスポートモーダル */}
      {exportText !== null && (
        <div style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.panel, borderRadius: 20, width: "100%", maxWidth: 640, padding: 20, maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${C.line}` }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Markdownで書き出す</h2>
            <textarea
              ref={exportRef}
              readOnly
              value={exportText}
              style={{ flex: 1, minHeight: 240, width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 12, fontFamily: "monospace", resize: "none", whiteSpace: "pre" }}
            />
            {copyState === "manual" && (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: C.amber }}>
                この環境では自動コピーが制限されているようです。全選択済みなので、そのまま長押し(またはCtrl+C)でコピーするか、「.mdをダウンロード」をお使いください。
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setExportText(null)} style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}>
                閉じる
              </button>
              {canShareFile ? (
                <button onClick={shareExport} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  📤 共有(ファイルに保存)
                </button>
              ) : (
                <button onClick={downloadExport} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  .mdをダウンロード
                </button>
              )}
              <button onClick={copyExport} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: copyState === "done" ? C.cyan : C.magenta, color: copyState === "done" ? C.bg : C.onAccent, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                {copyState === "done" ? "コピーしました ✓" : "コピー"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠 テーマ調整パネル(開発用)。オーバーレイなしで背後のアプリを操作しながら色を確認できる */}
      {devToolOpen && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              pointerEvents: "auto", background: C.panel, width: "100%", maxWidth: 640, height: "46vh",
              display: "flex", flexDirection: "column", borderRadius: "16px 16px 0 0",
              border: `1px solid ${C.lineStrong}`, borderBottom: "none", boxShadow: "0 -8px 30px rgba(0,0,0,.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${C.line}`, flexShrink: 0, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 13 }}>🛠 テーマ調整({C.name})</strong>
              <span style={{ fontSize: 10, color: C.muted }}>即反映・この端末に保存</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button
                  onClick={copyThemeCode}
                  style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {devCopied ? "コピーした ✓" : "コードをコピー"}
                </button>
                <button
                  onClick={resetThemeTweaks}
                  style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  リセット
                </button>
                <button
                  onClick={() => setDevToolOpen(false)}
                  aria-label="閉じる"
                  style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "6px 14px calc(12px + env(safe-area-inset-bottom))" }}>
              {Object.keys(THEMES[theme])
                .filter((k) => k !== "name")
                .map((k) => {
                  const v = String(C[k]);
                  const isHex = /^#[0-9a-fA-F]{6}$/.test(v);
                  const overridden = themeTweaks[theme] && themeTweaks[theme][k] !== undefined;
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                      <code style={{ width: 112, fontSize: 11, color: overridden ? C.amber : C.muted, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {overridden ? "*" : ""}{k}
                      </code>
                      {isHex ? (
                        <input
                          type="color"
                          value={v}
                          onChange={(e) => setThemeToken(k, e.target.value)}
                          aria-label={`${k}の色`}
                          style={{ width: 38, height: 30, border: "none", background: "transparent", padding: 0, flexShrink: 0, cursor: "pointer" }}
                        />
                      ) : (
                        <span style={{ width: 38, height: 22, borderRadius: 5, background: v, border: `1px solid ${C.line}`, flexShrink: 0 }} />
                      )}
                      <input
                        value={v}
                        onChange={(e) => setThemeToken(k, e.target.value)}
                        aria-label={`${k}の値`}
                        style={{ flex: 1, minWidth: 0, padding: "5px 8px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontFamily: "monospace" }}
                      />
                    </div>
                  );
                })}
              <p style={{ margin: "8px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                * 付きは変更済み。「コードをコピー」で utacho.jsx の THEMES にそのまま貼れる形式になります。rgba系はテキスト欄で直接編集してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 追加・編集モーダル */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: C.overlay, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{
            background: C.panel, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640,
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            borderTop: `1px solid ${C.line}`,
            transform: `translateY(${sheetDrag}px)`,
            transition: sheetStartRef.current != null ? "none" : "transform .2s ease",
          }}>
            {/* ドラッグハンドル(下スワイプで閉じる)。スクロール領域の外なので常に上部に固定される */}
            <div
              onTouchStart={(e) => {
                sheetStartRef.current = e.touches[0].clientY;
              }}
              onTouchMove={(e) => {
                if (sheetStartRef.current == null) return;
                setSheetDrag(Math.max(0, e.touches[0].clientY - sheetStartRef.current));
              }}
              onTouchEnd={() => {
                const d = sheetDrag;
                sheetStartRef.current = null;
                if (d > 90) closeModal();
                else setSheetDrag(0);
              }}
              style={{
                touchAction: "none", cursor: "grab", flexShrink: 0,
                padding: "12px 20px 12px", borderBottom: `1px solid ${C.line}`,
              }}
            >
              <div style={{ width: 44, height: 5, borderRadius: 999, background: C.lineStrong, margin: "0 auto 12px" }} />
              <h2 style={{ margin: 0, fontSize: 17 }}>
                {modal.mode === "add" ? "曲を追加" : "曲を編集"}
                {modal.mode === "edit" && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: C.muted }}>変更は自動保存されます</span>
                )}
              </h2>
            </div>

            <div style={{ overflowY: "auto", padding: "14px 20px calc(20px + env(safe-area-inset-bottom))" }}>
            <label style={{ fontSize: 12, color: C.muted }}>曲名(必須)</label>
            <input
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                // 曲名を書き換えたら旧曲名のアーティスト候補・エラー表示を消す(検索中はgen機構に任せる)
                if (artistSearch && artistSearch !== "loading") resetArtistSearch();
              }}
              placeholder="例:紅"
              style={{ width: "100%", margin: "6px 0 14px", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 15 }}
            />

            <label style={{ fontSize: 12, color: C.muted }}>アーティスト(入力すると登録済みから候補表示)</label>
            <input
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              placeholder="例:X JAPAN"
              list="utacho-artists"
              style={{ width: "100%", margin: "6px 0 8px", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 15 }}
            />
            <datalist id="utacho-artists">
              {allArtists.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <button
                onClick={searchArtist}
                disabled={!form.title.trim() || artistSearch === "loading"}
                style={{
                  padding: "8px 12px", borderRadius: 999, fontSize: 13, whiteSpace: "nowrap",
                  border: `1px solid ${C.line}`, background: "transparent",
                  color: form.title.trim() ? C.muted : C.panelHi,
                  cursor: form.title.trim() ? "pointer" : "not-allowed",
                }}
              >
                {artistSearch === "loading" ? "検索中…" : "🔍 曲名・アーティストを検索"}
              </button>
              {artistSearch && artistSearch.error && (
                <span style={{ fontSize: 12, color: C.amber }}>取得できませんでした(通信環境を確認)</span>
              )}
              {artistSearch && artistSearch.results && artistSearch.results.length === 0 && (
                <span style={{ fontSize: 12, color: C.muted }}>候補が見つかりませんでした</span>
              )}
              {artistSearch && artistSearch.results &&
                artistSearch.results.map((r) => (
                  <button
                    key={`${r.track || ""}__${r.artist}`}
                    onClick={() => {
                      // 候補タップで曲名(正式表記)とアーティストの両方を反映する
                      setForm((f) => ({ ...f, title: r.track || f.title, artist: r.artist }));
                      resetArtistSearch();
                    }}
                    style={{
                      padding: "8px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                      border: `1px solid ${C.cyan}`, background: C.cyanSoft, color: C.cyan,
                      maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {r.track ? `${r.track} / ${r.artist}` : r.artist}
                  </button>
                ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted }}>キー設定</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <button onClick={() => setForm((f) => ({ ...f, keyShift: Math.max(-7, f.keyShift - 1) }))}
                  style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.cyan, fontSize: 18, cursor: "pointer" }}>♭</button>
                <span style={{ minWidth: 48, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{keyLabel(form.keyShift)}</span>
                <button onClick={() => setForm((f) => ({ ...f, keyShift: Math.min(7, f.keyShift + 1) }))}
                  style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.magenta, fontSize: 18, cursor: "pointer" }}>♯</button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted }}>
                音域(原曲)
                <button
                  onClick={() => setRangeGuideOpen(true)}
                  aria-label="音域表記の説明"
                  style={{
                    marginLeft: 8, padding: "2px 9px", borderRadius: 999, fontSize: 11, cursor: "pointer",
                    border: `1px solid ${C.line}`, background: "transparent", color: C.muted,
                  }}
                >
                  ? 表記の読み方
                </button>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <select
                  value={form.rangeLo ?? ""}
                  onChange={(e) => setForm({ ...form, rangeLo: e.target.value === "" ? null : Number(e.target.value) })}
                  aria-label="最低音"
                  style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, padding: "10px 8px", height: 42 }}
                >
                  <option value="">最低音 —</option>
                  {RANGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{midiToKaraoke(n)}</option>
                  ))}
                </select>
                <span style={{ color: C.muted }}>〜</span>
                <select
                  value={form.rangeHi ?? ""}
                  onChange={(e) => setForm({ ...form, rangeHi: e.target.value === "" ? null : Number(e.target.value) })}
                  aria-label="最高音"
                  style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, padding: "10px 8px", height: 42 }}
                >
                  <option value="">最高音 —</option>
                  {RANGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{midiToKaraoke(n)}</option>
                  ))}
                </select>
                {/* aタグ+target=_blank: PWA(ホーム画面起動)からでもブラウザの新しいタブで開く */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${form.title} ${form.artist} 音域`.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 12, height: 42,
                    fontSize: 13, whiteSpace: "nowrap", textDecoration: "none", boxSizing: "border-box",
                    border: `1px solid ${C.line}`, background: "transparent",
                    color: form.title.trim() ? C.muted : C.panelHi,
                    pointerEvents: form.title.trim() ? "auto" : "none",
                  }}
                >
                  🔍 調べる
                </a>
              </div>
              {form.rangeLo != null && form.rangeHi != null && form.keyShift !== 0 && (
                <p style={{ margin: "8px 0 0", fontSize: 13, color: C.cyan }}>
                  キー{keyLabel(form.keyShift)}後: {rangeLabel(form.rangeLo, form.rangeHi, form.keyShift)}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted }}>最高スコア・採点機</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <input
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value.replace(/[^0-9.]/g, "") })}
                  placeholder="—" inputMode="decimal"
                  style={{ width: 90, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 15, height: 42 }}
                />
                {MACHINES.map((m) => {
                  const on = form.scoreMachine === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setForm((f) => ({ ...f, scoreMachine: on ? "" : m }))}
                      style={{
                        padding: "10px 13px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                        border: `1px solid ${on ? C.cyan : C.line}`,
                        background: on ? C.cyanSoft : "transparent",
                        color: on ? C.cyan : C.muted, fontWeight: on ? 700 : 400,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted }}>技法の自己ベスト(DAM精密採点など)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                {TECH_METRICS.map((f) => (
                  <span key={f.key} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{f.label}</span>
                    <input
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value.replace(f.int ? /[^0-9]/g : /[^0-9.]/g, "") })}
                      placeholder="—" inputMode="decimal"
                      style={{ width: 64, padding: "10px 10px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 15, height: 42, boxSizing: "border-box" }}
                    />
                    <span style={{ fontSize: 12, color: C.muted }}>{f.unit}</span>
                  </span>
                ))}
              </div>
            </div>

            <label style={{ fontSize: 12, color: C.muted }}>タグ</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 14px", alignItems: "center" }}>
              <button
                onClick={() => setForm((f) => ({ ...f, ohako: !f.ohako }))}
                style={{
                  padding: "7px 13px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                  border: `1px solid ${form.ohako ? C.amber : C.line}`,
                  background: form.ohako ? C.amberSoft : "transparent",
                  color: form.ohako ? C.amber : C.muted, fontWeight: form.ohako ? 700 : 400,
                }}
              >
                ★ 十八番
              </button>
              {Array.from(new Set([...allTags, ...form.tags])).map((t) => {
                const on = form.tags.includes(t);
                const preset = TAGS.includes(t); // プリセットタグは削除不可
                const confirming = confirmTagDelete === t;
                return (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center" }}>
                    <button
                      onClick={() => {
                        setConfirmTagDelete(null);
                        toggleTag(t);
                      }}
                      style={{
                        padding: "7px 13px", borderRadius: preset ? 999 : "999px 0 0 999px", fontSize: 13, cursor: "pointer",
                        border: `1px solid ${on ? C.cyan : C.line}`,
                        background: on ? C.cyanSoft : "transparent",
                        color: on ? C.cyan : C.muted, fontWeight: on ? 700 : 400,
                      }}>{t}</button>
                    {!preset && (
                      <button
                        onClick={() => (confirming ? deleteTagEverywhere(t) : setConfirmTagDelete(t))}
                        aria-label={`タグ「${t}」を全曲から削除`}
                        style={{
                          padding: "7px 10px", borderRadius: "0 999px 999px 0", fontSize: 12, cursor: "pointer",
                          border: `1px solid ${confirming ? C.danger : on ? C.cyan : C.line}`, borderLeft: "none",
                          background: confirming ? C.danger : "transparent",
                          color: confirming ? "#fff" : C.muted, fontWeight: confirming ? 800 : 400,
                        }}
                      >
                        {confirming ? "全曲から削除?" : "✕"}
                      </button>
                    )}
                  </span>
                );
              })}
              {newTag === null ? (
                <button
                  onClick={() => setNewTag("")}
                  style={{
                    padding: "7px 13px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                    border: `1px dashed ${C.lineStrong}`, background: "transparent", color: C.muted,
                  }}
                >
                  ＋ 追加
                </button>
              ) : (
                <>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value.replace(/[｜・]/g, ""))}
                    placeholder="新しいタグ"
                    autoFocus
                    style={{ width: 130, padding: "7px 12px", borderRadius: 999, border: `1px solid ${C.cyan}`, background: C.bg, color: C.text }}
                  />
                  <button
                    onClick={() => {
                      const t = newTag.trim();
                      if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
                      setNewTag(null);
                    }}
                    style={{ padding: "7px 13px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: "none", background: C.cyan, color: C.bg, fontWeight: 700 }}
                  >
                    追加
                  </button>
                  <button onClick={() => setNewTag(null)} style={{ padding: "7px 10px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.muted }}>
                    ✕
                  </button>
                </>
              )}
            </div>

            <label style={{ fontSize: 12, color: C.muted }}>メモ</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              placeholder="例:サビ前のブレスに注意"
              rows={2}
              style={{ width: "100%", margin: "6px 0 18px", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg, color: C.text, fontSize: 14, resize: "vertical" }}
            />

            {/* 録音(データは端末内のIndexedDBのみ。mdには含まれない) */}
            {recSupported && modal.mode === "edit" && (
              <>
                <label style={{ fontSize: 12, color: C.muted }}>録音(この端末にのみ保存)</label>
                <div style={{ margin: "8px 0 18px", padding: 12, borderRadius: 12, border: `1px solid ${C.line}`, background: C.bg }}>
                  {recState ? (
                    <button
                      onClick={stopRecording}
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                        background: C.danger, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                      }}
                    >
                      ■ 停止して保存({fmtRecTime(recState.elapsed)})
                    </button>
                  ) : (
                    <button
                      onClick={() => editingSong && startRecording(songKey(editingSong))}
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${C.magenta}`, background: "transparent",
                        color: C.magenta, fontWeight: 700, fontSize: 14,
                      }}
                    >
                      ● 録音を開始
                    </button>
                  )}
                  {recError && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: C.amber }}>{recError}</p>
                  )}
                  {editingRecs.map((t) => (
                    <div key={t.id} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <button
                          onClick={() => playTake(t)}
                          style={{
                            width: 40, height: 34, borderRadius: 10, cursor: "pointer", flexShrink: 0,
                            border: `1px solid ${playingId === t.id ? C.cyan : C.line}`,
                            background: playingId === t.id ? C.cyanSoft : "transparent",
                            color: C.cyan, fontSize: 13,
                          }}
                        >
                          {playingId === t.id ? "■" : "▶"}
                        </button>
                        <span style={{ flex: 1, color: C.text }}>{fmtRecDate(t.createdAt)}</span>
                        <span style={{ color: C.muted, flexShrink: 0 }}>{fmtRecTime(t.duration || 0)}</span>
                        <span style={{ color: C.muted, flexShrink: 0 }}>{fmtRecSize(t.size || 0)}</span>
                        <button
                          onClick={() => (confirmTake === t.id ? deleteTake(t) : setConfirmTake(t.id))}
                          style={{
                            padding: "6px 10px", borderRadius: 10, cursor: "pointer", flexShrink: 0, fontSize: 12,
                            border: `1px solid ${C.danger}`,
                            background: confirmTake === t.id ? C.danger : "transparent",
                            color: confirmTake === t.id ? "#fff" : C.danger,
                            fontWeight: confirmTake === t.id ? 800 : 400,
                          }}
                        >
                          {confirmTake === t.id ? "本当に?" : "削除"}
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <input
                          value={t.score || ""}
                          onChange={(e) => updateTake(t, { score: e.target.value.replace(/[^0-9.]/g, "") })}
                          placeholder="点数" inputMode="decimal"
                          style={{ width: 76, padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, color: C.text, fontSize: 14 }}
                        />
                        <span style={{ fontSize: 12, color: C.muted }}>点</span>
                        {MACHINES.map((m) => {
                          const on = t.machine === m;
                          return (
                            <button
                              key={m}
                              onClick={() => updateTake(t, { machine: on ? "" : m })}
                              style={{
                                padding: "7px 11px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                                border: `1px solid ${on ? C.cyan : C.line}`,
                                background: on ? C.cyanSoft : "transparent",
                                color: on ? C.cyan : C.muted, fontWeight: on ? 700 : 400,
                              }}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {TECH_METRICS.map((f) => (
                          <span key={f.key} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <span style={{ fontSize: 11, color: C.muted }}>{f.label}</span>
                            <input
                              value={t[f.key] || ""}
                              onChange={(e) => updateTake(t, { [f.key]: e.target.value.replace(f.int ? /[^0-9]/g : /[^0-9.]/g, "") })}
                              placeholder="—" inputMode="decimal"
                              style={{ width: 52, padding: "8px 8px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, color: C.text, fontSize: 14 }}
                            />
                            <span style={{ fontSize: 11, color: C.muted }}>{f.unit}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {editingRecs.length === 0 && !recState && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted }}>まだ録音がありません。</p>
                  )}
                </div>
              </>
            )}
            {recSupported && modal.mode === "add" && (
              <p style={{ margin: "0 0 14px", fontSize: 12, color: C.muted }}>🎙 録音は保存後の編集画面からできます。</p>
            )}

            {dupSong && (
              <p style={{ margin: "0 0 10px", fontSize: 12, color: C.amber }}>
                ⚠ 同じ曲名・アーティストの曲が既に登録されています(md書き出し時は1曲に統合されます)。
              </p>
            )}
            {confirmDelete && editingRecs.length > 0 && (
              <p style={{ margin: "0 0 10px", fontSize: 12, color: C.amber }}>
                ⚠ この曲の録音{editingRecs.length}件も一緒に削除されます。
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {modal.mode === "edit" ? (
                <>
                  <button
                    onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
                    style={{
                      padding: "13px 16px", borderRadius: 12, border: `1px solid ${C.danger}`,
                      background: confirmDelete ? C.danger : "transparent",
                      color: confirmDelete ? "#fff" : C.danger,
                      fontWeight: confirmDelete ? 800 : 400,
                      cursor: "pointer", fontSize: 14,
                    }}
                  >
                    {confirmDelete ? "本当に削除?" : "削除"}
                  </button>
                  <button
                    onClick={() => closeModal()}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                      background: C.magenta, color: C.onAccent, fontWeight: 800, fontSize: 14, cursor: "pointer",
                    }}
                  >
                    閉じる
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => closeModal()} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${C.lineStrong}`, background: "transparent", color: C.text, cursor: "pointer", fontSize: 14 }}>
                    キャンセル
                  </button>
                  <button
                    onClick={save}
                    disabled={!form.title.trim()}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                      background: form.title.trim() ? C.magenta : C.panelHi,
                      color: form.title.trim() ? C.onAccent : C.muted, fontWeight: 800, fontSize: 14,
                      cursor: form.title.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    保存
                  </button>
                </>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
