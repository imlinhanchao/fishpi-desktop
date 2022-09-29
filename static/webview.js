const { ipcRenderer } = require('electron')

window.$ipc = {
  send ({channel, args}) {
    ipcRenderer.sendToHost(channel, args)
  }
}
