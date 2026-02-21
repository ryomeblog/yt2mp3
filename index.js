const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

(async () => {
  // yt2mp3.txtを読み取る
  const fileStream = fs.createReadStream('yt2mp3.txt');
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let total = 0;
  let processed = 0;
  
  // ファイルの行数をカウント
  for await (const line of rl) {
    if (line.trim() && !line.startsWith('#')) total++;
  }

  // ファイルを再度読み取り処理を実行
  fileStream.destroy();
  const newStream = fs.createReadStream('yt2mp3.txt');
  const newRl = readline.createInterface({
    input: newStream,
    crlfDelay: Infinity
  });

  for await (const line of newRl) {
    if (!line.trim() || line.startsWith('#')) continue;
    
    // URL,開始時間,終了時間,ファイル名をパース
    const [videoUrl, startTime, endTime, fileName] = line.split(',').map(s => s.trim());
    if (!videoUrl) {
      console.error('Invalid line format:', line);
      continue;
    }

    // ファイル名のバリデーション
    const safeFileName = (fileName || 'audio')
      .replace(/[<>:"/\\|?*]/g, '') // ファイルシステムで禁止されている文字を除去
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .substring(0, 50); // 最大50文字
    
    try {
      // 動画情報を取得
      const ytDlpCommand = process.platform === 'win32' ? '.\\yt-dlp.exe' : 'yt-dlp';
      const ytDlpOptions = '--remote-components ejs:github';
      const info = await new Promise((resolve, reject) => {
        exec(`${ytDlpCommand} ${videoUrl} --dump-json ${ytDlpOptions}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr));
          } else {
            resolve(JSON.parse(stdout));
          }
        });
      });

      if (!info.title) {
        throw new Error('Failed to get video details');
      }

      // 特殊文字を除去し、ファイル名を簡潔にする
      // musicフォルダが存在しない場合は作成
      if (!fs.existsSync('music')) {
        fs.mkdirSync('music');
      }
      
      const outputFile = `music/${safeFileName}.mp3`;
      console.log('Output file:', outputFile);
      
      processed++;
      console.log(`[${processed}/${total}] Downloading: ${info.title}`);

      // 直接ffmpegでHLSを処理させないため、まずyt-dlpで音声ファイルをローカルにダウンロードしてから
      // ffmpegでトリミング・MP3変換を行う
      const downloadTemplate = `music/${safeFileName}.%(ext)s`;
      await new Promise((resolve, reject) => {
        exec(`${ytDlpCommand} -f bestaudio -o "${downloadTemplate}" ${ytDlpOptions} ${videoUrl}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
          } else {
            resolve(stdout);
          }
        });
      });

      // ダウンロードした拡張子はinfo.extを使う（存在しない場合はm4aを想定）
      const downloadedFile = `music/${safeFileName}.${info.ext || 'm4a'}`;

      // ffmpegでトリミング＆MP3変換
      let ffmpegCmd = 'ffmpeg -y';
      if (startTime) ffmpegCmd += ` -ss ${startTime}`;
      if (endTime) ffmpegCmd += ` -to ${endTime}`;
      ffmpegCmd += ` -i "${downloadedFile}" -c:a libmp3lame -q:a 2 "${outputFile}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || stdout || error.message));
          } else {
            resolve(stdout);
          }
        });
      });

      // ダウンロードした元ファイル（webm等）がmp3と異なる場合は削除
      if (downloadedFile !== outputFile && fs.existsSync(downloadedFile)) {
        fs.unlinkSync(downloadedFile);
      }

      console.log(`Conversion complete! File saved as: ${outputFile}\n`);
      
    } catch (error) {
      console.error('Error processing video:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }
  
  console.log('All videos processed!');
})();
