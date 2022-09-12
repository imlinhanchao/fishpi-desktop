import windows from '../windows'
import TrayModel from './tray'
import HotKey from '../lib/hotkeys'
import {
    ipcMain, Notification, shell
} from 'electron'
import Update from './update'
import info from '../../../package.json'

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
    });
    ipcMain.on('win-update', async (event, argv) => {
        let data = await Update.checkUpdate();
        if (!data || data.tag_name == info.version) data = null;
        if(argv.callback) event.sender.send('win-update-callback-' + argv.callback, { data })
    });
    ipcMain.on('win-update-app', Update.updateEvent);
    ipcMain.on('win-hotkey-boss', (event, argv) => {
        HotKey.register('boss', argv.hotkey, () => {
            win.main.isVisible ? win.main.hide() : win.main.show();
        })
    })

    return win;
}


export default {
    create,
    windows
}