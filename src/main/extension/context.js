import Fishpi from 'fishpi'
import EventEmitter from 'events'
import {
    ipcMain, Notification, shell
} from 'electron'
import { notice as Notice } from '../lib/utils';
import path from 'path';

class Context
{
    constructor(ext) {
        this.ext = ext;
        this.events = new EventEmitter();
        this.events.fishpi = new Fishpi();
        ipcMain.on('fishpi.global.login', (event, token) => {
            this.events.fishpi.setToken(token);
            this.events.emit('login', token);
        });
        ipcMain.on('fishpi.global.logout', (event, args) => {
            this.events.fishpi.setToken('');
            this.events.emit('logout');
        });
        ipcMain.on('fishpi.global.exit', (event, args) => {
            this.events.emit('quit');
        });
        try {
            let extPath = path.join(ext.fishpi.root, ext.main);
            delete require.cache[extPath];
            let model = __non_webpack_require__(extPath);
            if (!model.activate) throw (new Error('缺少入口函数 activate'));
            model.activate(this.events);
        } catch (error) {
            console.error(error);
            Notice({ title: `${ext.fishpi.key}`, body: `载入失败：${error.message}` }).show();
        }
    }
}

export default Context;