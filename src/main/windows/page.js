import Win from '../lib/window'
import {
    ipcMain
} from 'electron'

class Page
{
    constructor(app, name) {
        this.name = name;
        this.app = app;
        ipcMain.on(`${name}-event`, (event, args) => {
            if (!args.call || !this.events || !this.events[args.call]) return;
            this.events[args.call].call(this, event, args.args, args.callback);
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
        return this.win;
    }
}

export default Page;