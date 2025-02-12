# YouTube to MP3 Converter

YouTubeの動画から音声をMP3形式でダウンロードするNode.jsスクリプトです。

## 必要な環境

- Node.js (v16以上)
- yt-dlp
- ffmpeg

### yt-dlpのインストール方法

#### Windows
1. 手動ダウンロード方法:
   - [yt-dlpの公式リリースページ](https://github.com/yt-dlp/yt-dlp/releases/latest)からyt-dlp.exeをダウンロード
   - ダウンロードしたyt-dlp.exeをプロジェクトのルートディレクトリに配置

2. curlコマンドを使用する方法:
```bash
curl -L -o yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
```

#### macOS (Homebrewを使用)
```bash
brew install yt-dlp
```

#### Linux
```bash
sudo apt update
sudo apt install yt-dlp
```

### ffmpegのインストール方法

#### macOS (Homebrewを使用)
```bash
brew install ffmpeg
```

#### Windows (Chocolateyを使用)
```bash
choco install ffmpeg
```

#### Linux (aptを使用)
```bash
sudo apt install ffmpeg
```

## インストール方法

1. リポジトリをクローン
```bash
git clone https://github.com/ryomeblog/yt2mp3.git
cd yt2mp3
```

2. 依存パッケージをインストール
```bash
npm install
```

## 使用方法

1. `yt2mp3.txt` ファイルにダウンロードしたい動画の情報を記述
2. 以下のコマンドを実行
```bash
node index.js
```

## 設定ファイルフォーマット (`yt2mp3.txt`)

```
# YouTube URL,開始時間,終了時間,ファイル名
# 開始時間と終了時間はHH:MM:SS形式
# 終了時間は省略可能
# ファイル名には日本語も使用可能

【Youtube URL】,【開始時間】,【終了時間】,【ファイル名】

https://www.youtube.com/watch?v=VIDEO_ID,00:00:00,00:01:31,my_song1
https://www.youtube.com/watch?v=VIDEO_ID,00:04:30,,my_song2
https://www.youtube.com/watch?v=VIDEO_ID,,,my_song3
```

## 利用規約

本ソフトウェアは個人開発のアプリケーションであり、以下の点にご注意ください：

1. **著作権の遵守**
   - 本ソフトウェアを使用してダウンロードするコンテンツの著作権は、各権利者に帰属します。
   - 著作権法や関連法令を遵守し、権利者の許可を得ずにコンテンツを使用しないでください。

2. **自己責任での使用**
   - 本ソフトウェアの使用は全て自己責任で行ってください。
   - 本ソフトウェアの使用によって生じたいかなる損害についても、開発者は一切の責任を負いません。

3. **免責事項**
   - 本ソフトウェアは「現状のまま」提供され、明示的または黙示的な保証は一切ありません。
   - 開発者は、本ソフトウェアの使用に関連して発生するいかなる問題（データ損失、システム障害、法的問題など）についても責任を負いません。

4. **悪用禁止**
   - 本ソフトウェアを違法行為や他者への迷惑行為に使用しないでください。
   - 本ソフトウェアの悪用が発覚した場合、開発者は直ちに使用を停止する権利を有します。

5. **個人開発のアプリ**
   - 本ソフトウェアは個人開発のアプリケーションであり、商用利用や大規模な運用を想定していません。
   - 予期せぬ動作やバグが発生する可能性があることをご了承ください。

## ライセンス

MIT License
