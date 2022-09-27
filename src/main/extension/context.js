import Fishpi from 'fishpi'
import EventEmitter from 'events'
import {
    ipcMain, Notification, shell
} from 'electron'
import electron from 'electron'
import { notice as Notice } from '../lib/utils';
import path from 'path';

class Context
{
    constructor(ext, app, wins) {
        this.ext = ext;
        this.app = app;
        this.wins = wins;
        this.events = new EventEmitter();
        this.events.fishpi = new Fishpi();
        this.events.setSidebar = (icon, html) => {
            this.setSidebar(icon, html);
        }

        this.listener();
        try {
            let extPath = path.join(ext.fishpi.root, ext.main);
            delete require.cache[extPath];
            let model = __non_webpack_require__(extPath);
            if (!model.activate) throw (new Error('缺少入口函数 activate'));
            model.activate(this.events, electron);
        } catch (error) {
            console.error(error);
            Notice({ title: `${ext.fishpi.key}`, body: `载入失败：${error.message}` }).show();
        }
    }

    listener() {
        ipcMain.on('fishpi.global.login', (event, args) => {
            this.events.fishpi.setToken(args.token);
            this.events.emit('login', args.token);
        });
        ipcMain.on('fishpi.global.logout', (event, args) => {
            this.events.fishpi.setToken('');
            this.events.emit('logout');
        });
        ipcMain.on('fishpi.global.exit', (event, args) => {
            this.events.emit('quit');
        });
    }

    setSidebar(icon, html) {
            
    }
}

export default Context;