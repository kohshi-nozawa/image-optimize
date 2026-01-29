# image-optimize
画像最適化＆WebP変換ツール。
GulpからNode.jsスクリプト (`sharp`) へ移行しました。

## 使用準備

### 1. Node.jsのインストール
[こちら](https://nodejs.org/ja/)から推奨版をダウンロードしてインストールしてください。

### 2. リポジトリの準備
```bash
git clone git@github.com:kohshi-nozawa/image-optimize.git
cd image-optimize
```

### 3. パッケージのインストール
```bash
npm install
```

---

## 使用方法

### ディレクトリ構成
*   **`srcImg/`**: 圧縮したい画像 (JPG, PNG, HEIC) をここに置きます。
*   **`srcWebp/`**: WebPに変換したい画像 (JPG, PNG, HEIC) をここに置きます。
*   **`distImg/`**: 圧縮後の画像がここに出力されます (HEICはPNGに変換されます)。
*   **`distWebp/`**: WebP変換後の画像がここに出力されます。

※ ディレクトリ構造は維持されます。名前や構造を変更したくない場合はそのまま配置してください。

### コマンド一覧

#### 一括実行 (推奨)
画像圧縮とWebP変換の両方を実行します。
```bash
npm start
```

#### 画像圧縮のみ実行
`srcImg` -> `distImg` の処理のみを行います。
```bash
npm run build
```

#### WebP変換のみ実行
`srcWebp` -> `distWebp` の処理のみを行います。
```bash
npm run webp
```

#### クリーンアップ
出力ディレクトリ (`distImg`, `distWebp`) の中身を全て削除します。
```bash
npm run clear
```

#### ヘルプ表示
コマンド一覧を表示します。
```bash
npm run help
```

---

## 主な機能
*   **圧縮**: `sharp` を使用して画質を保ちつつファイルサイズを削減します。
*   **HEIC対応**: Mac/iPhone等のHEIC形式を自動的にPNGに変換します。
*   **同期**: `src` 側で削除されたファイルは、実行時に `dist` 側からも削除されます（ゴミが残りません）。
*   **拡張子**: 大文字・小文字の拡張子 (`.PNG`, `.jpg` 等) に対応しています。
