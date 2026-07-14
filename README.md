# 歌帳(utacho)

カラオケの持ち歌を管理する個人用PWA。曲の登録・検索・タグ絞り込み・ランダム選曲・Markdownの取り込み/書き出しができる。

- データはアプリ本体に含まれず、端末の localStorage に保存される
- 持ち歌データのマスターは手元の `持ち歌リスト.md`(このリポジトリには含まない)。「📥 MDを取り込む」で貼り付けて同期し、「📄 MDで書き出す」でバックアップする

## 開発

```bash
npm install
npm run build      # src/ → docs/app.js
npm run icons      # アイコン再生成(要 Pillow)
```

`docs/` を GitHub Pages で配信する。ビルド成果物(`docs/app.js`)はコミットに含める。

## スマホへのインストール

Safari(iPhone)/ Chrome(Android)で Pages のURLを開き、「ホーム画面に追加」する。
