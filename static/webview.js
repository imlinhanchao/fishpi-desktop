const { ipcRenderer } = require('electron')

window.$ipc = {
  send (event, args, fn) {
    let callback = fn ? parseInt(Math.random() * 10000).toString() : undefined
    if (fn) ipcRenderer.once(`${event}.${callback}`, fn)
    ipcRenderer.sendToHost(event, args, callback)
  },
  invoke (event, argv) {
    return new Promise((resolve, reject) => {
      try {
        this.send(event, argv, (event, data) => {
          resolve(data)
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  on (event, fn) {
    ipcRenderer.on(event, fn)
  },
  off (event, fn) {
    ipcRenderer.off(event, fn)
  }
}
console.dir(window.$ipc)
