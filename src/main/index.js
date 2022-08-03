import { app, shell } from 'electron'
import blocks from './block'
import * as main from '@electron/remote/main'

let mainWindow
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

if (process.argv.indexOf('--dev') >= 0) require('electron-debug')({ showDevTools: true })

function create () {
  mainWindow = blocks.create(app)
}

app.on('ready', create)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    blocks.windows.create(app)
  }
})
app.commandLine.appendSwitch('ignore-certificate-errors')

app.on('web-contents-created', (e, contents) => {
  // Check for a webview
  if (contents.getType() == 'window') {
    // Listen for any new window events
    contents.on('new-window', (e, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) return;
      let mat = url.match(/goto=(.*?)$/);
      if (mat) url = decodeURIComponent(mat[1])
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})

main.initialize()

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})

*/