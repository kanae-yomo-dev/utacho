// スモークテスト用エントリ。
// アプリを Node 上でサーバーサイドレンダリングして、例外なく描画できるか確かめる。
// esbuild の構文チェックでは拾えない「モジュール読み込み時の実行時エラー(真っ暗画面)」を検出する。
import { renderToString } from "react-dom/server";
import KaraokeApp from "../src/utacho.jsx";

const html = renderToString(<KaraokeApp />);
if (!html || html.length < 50) {
  throw new Error("スモーク失敗: レンダリング結果が空でした");
}
console.log("スモークOK: renderToString の出力長 =", html.length);
