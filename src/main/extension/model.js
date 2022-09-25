import Fishpi from 'fishpi'
import {
    ipcMain, Notification, shell
} from 'electron'
import { notice as Notice } from '../lib/utils';

let Events = {

}
class Model
{
    constructor(ext) {
        this.fishpi = new Fishpi();
        ipcMain.on('fishpi.global.login', (event, token) => {
            this.fishpi.setToken(token);
            if (Events.login) {
                Events.login.forEach(e => e(token));
            }
        });
        ipcMain.on('fishpi.global.logout', (event, args) => {
            this.fishpi.setToken('');
            if (Events.logout) {
                Events.logout.forEach(e => e());
            }
        });
        ipcMain.on('fishpi.global.exit', (event, args) => {
            if (Events.close) {
                Events.close.forEach(e => e());
            }
        });
        try {
            delete require.cache[path.join(ext.fishpi.root, ext.main)];
            let extModel = require(path.join(ext.fishpi.root, ext.main));
            if (!extModel.activate) throw (new Error('缺少入口函数 activate'));
            extModel.activate(this);
        } catch (error) {
            console.error(error);
            Notice({ title: `${ext.fishpi.key}`, body: `载入失败：${error.message}` }).show();
        }
    }

    on(event, fn) {
        if (fn instanceof Function) {
            if(!Events[event]) Events[event] = [];
            Events[event].push(fn);
            return;
        }
        Notice({ title: `${ext.fishpi.key}`, body: `无效监听函数参数 fn` }).show();
    }

    destory(event, fn) {
        if(!Events[event]) {
            Events[event] = [];
            return;
        }
        Events = Events.filter(e => e !== fn);
    }

    reset(event) {
        Events[event] = [];
    }
}

export default Model;