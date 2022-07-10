import Win from '../lib/window'
import {
    ipcMain
} from 'electron'
import * as Main from '@electron/remote/main'

class Page
{
    constructor(app, name) {
        this.name = name;
        this.app = app;
        ipcMain.on(`${name}-event`, (event, args) => {
            if (!args.call || !this.events || !this.events[args.call]) return;
            this.events[args.call].call(this, event, args.args, (data) => {
                event.sender.send(`${name}-event-callback-` + args.callback, { data })
            });
        });
    }

    create(options={}) {
        this.win = new Win(this.app, {
            quitEvent(event) {
                this.win = null;
                return options.quitEvent ? 
                    options.quitEvent(event) : null
            },
            ...options
        })
        Main.enable(this.win.webContents);
        return this.win;
    }
}

export default Page;