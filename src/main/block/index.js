import windows from '../windows'
import TrayModel from './tray'
import {
    ipcMain, Notification, shell
} from 'electron'

let create = (app) => {
    let win = windows.create(app);
    new TrayModel(app, win).create();
    ipcMain.on('win-notice', (event, arg) => {
        let notice = new Notification(arg)
        notice.on('click', () => {
            if(!arg.url) win.main.show()
            else shell.openExternal(arg.url)
            if(arg.callback) event.sender.send('win-notice-callback-' + arg.callback)
        })
        notice.show();
    })
    return win;
}


export default {
    create,
    windows
}