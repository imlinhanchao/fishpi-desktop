import path from 'path'
import os from 'os'
import fs from 'fs'
import https from 'https'
import AdmZip from 'adm-zip'
import { spawn } from 'child_process'
import axios from 'axios'
import { rootPath } from 'electron-root-path';

let CopyPath = '';

const downloadFile = (url, dest, cb = () =>{}) => {
    // 确保dest路径存在
    const file = fs.createWriteStream(dest)
    const urlImage = url;
    
    https.get(urlImage, (res) => {

      if (res.statusCode == 302 || res.statusCode == 301)
      {
        downloadFile(res.headers.location, dest, cb)
        return
      }
      else if (res.statusCode !== 200) {
        cb(res.statusCode)
        return
      }
  
      // 进度
      const len = parseInt(res.headers['content-length']) // 文件总长度
      let cur = 0
      const total = (len / 1048576).toFixed(2) // 转为M 1048576 - bytes in  1Megabyte
      res.on('data', function (chunk) {
        let progress;
        if (!isNaN(total)) {
            cur += chunk.length
            progress = (100.0 * cur / len).toFixed(2) // 当前进度
        } else {
            progress = -1;
        }
        const currProgress = (cur / 1048576).toFixed(2) // 当前了多少
        cb('data', progress, currProgress, total)
      })
  
      res.on('end', () => {
        cb('download')
      })
  
      // 超时,结束等
      file.on('finish', () => {
        file.close()
        cb('finish', url)
      }).on('error', (err) => {
        fs.unlink(dest)
        if (cb) cb('error', err.message)
      })
      res.pipe(file)
    })
}
  
async function checkUpdate() {
    try {
        let rsp = await axios.get('https://api.github.com/repos/imlinhanchao/fishpi-desktop/releases/latest');
        return rsp.data;            
    } catch (error) {
        console.error(error)
    }
}

function updateApp(file, cb) {  
    try {
        let unzip = new AdmZip(file);
        let unzipPath = os.tmpdir();
        let folder = path.basename(file).replace(/\.zip$/, '');
        unzip.extractAllTo(unzipPath, true);
        unzipPath = path.resolve(unzipPath, folder);
        cb('done');
        let isWin32 = process.platform == 'win32'
        let execute = isWin32 ? 'cmd' : 'bash'
        let argv = isWin32 ? [ '/k' ] : [];
        let updateShell = path.resolve(os.tmpdir(), `fishpi-update.${isWin32 ? 'bat' : 'sh'}`);
        let sleep = isWin32 ? 'timeout /T 3 /NOBREAK' : 'sleep 3s';
        let kill = isWin32 ? 'taskkill /im fishpi.exe /F' : '';
        let copy = isWin32 ? `xcopy "${unzipPath}" "${rootPath}" /s /e /y` : `cp -r "${unzipPath}/" "${path.join(rootPath, CopyPath)}"`
        let lanuch = isWin32 ? `"${path.resolve(rootPath, 'fishpi.exe')}"` : `open ${rootPath}`;
        fs.writeFileSync(updateShell, `${isWin32 ? '@echo off' : ''}
echo '更新中...'
${sleep}
${kill}
${copy}
${lanuch}
        `)
        argv.push(updateShell);
        spawn(execute, argv, { detached: true, windowsHide: true });
        process.exit(0);
    } catch (error) {
        console.error(error);
        cb('fail');        
    }
}

function getDownload(update) {
    let data = update.assets.find(f => f.name == 'update-file.zip')
    if (data) return data;
    switch(process.platform) {
        case 'win32': {
            return update.assets.find(f => f.name.indexOf(`win32-${process.arch == 'x64' ? 'x64' : 'x86'}`))
        }
        case 'darwin': {
            return update.assets.find(f => f.name.indexOf(`darwin`))
        }
    }
}

function updateEvent(event, argv) {
    try
    {
        let data = getDownload(argv);
        let savePath = path.resolve(os.tmpdir(), data.name);
        data.browser_download_url = data.browser_download_url.replace(/^https:\/\/github.com/, 'https://download.fastgit.org')
        downloadFile(data.browser_download_url, savePath, (state, pro, currPro, total) => {
            if (state == 'data') {
                if (argv.callback) event.sender.send('win-update-app-callback-' + argv.callback, { state, pro, currPro, total })
            }
            else if(state == 'finish') {
                if (argv.callback) event.sender.send('win-update-app-callback-' + argv.callback, { state })
                if (data.name == 'update-file.zip' && process.platform == 'darwin')
                    CopyPath = 'Contents';
                updateApp(savePath, (state) => {
                    event.sender.send('win-update-app-callback-' + argv.callback, { state })
                });
            }
        })
    } catch (err) {
        event.sender.send('update-app-callback-' + argv.callback, { state: 'fail' })
        console.error(err)
    }
}

export default {
    checkUpdate,
    updateApp,
    updateEvent
}