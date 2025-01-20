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

  for await (const videoUrl of newRl) {
    if (!videoUrl.trim() || videoUrl.startsWith('#')) continue;
    
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
      const title = info.title
        .replace(/[^\w\s]/gi, '') // 特殊文字除去
        .replace(/\s+/g, '_') // スペースをアンダースコアに
        .substring(0, 50); // 最大50文字
      const outputFile = `${title}.mp3`;
      console.log('Output file:', outputFile);
      
      processed++;
      console.log(`[${processed}/${total}] Downloading: ${info.title}`);

      // yt-dlpで直接MP3としてダウンロード
      await new Promise((resolve, reject) => {
        exec(`yt-dlp -x --audio-format mp3 -o "${outputFile}" ${videoUrl}`, (error, stdout, stderr) => {
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
