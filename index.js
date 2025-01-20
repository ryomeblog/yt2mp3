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
      const info = await new Promise((resolve, reject) => {
        exec(`yt-dlp ${videoUrl} --dump-json`, (error, stdout, stderr) => {
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
      const outputFile = `${safeFileName}.mp3`;
      console.log('Output file:', outputFile);
      
      processed++;
      console.log(`[${processed}/${total}] Downloading: ${info.title}`);

      // yt-dlpで直接MP3としてダウンロード
      // 時間指定用のオプションを構築
      const timeOptions = [];
      if (startTime || endTime) {
        const start = startTime || '00:00:00';
        const end = endTime || '';
        timeOptions.push(`--download-sections *${start}-${end}`);
        timeOptions.push('--force-keyframes-at-cuts');
      }
      
      await new Promise((resolve, reject) => {
        exec(`yt-dlp -x --audio-format mp3 ${timeOptions.join(' ')} -o "${outputFile}" ${videoUrl}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr));
          } else {
            resolve(stdout);
          }
        });
      });

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
